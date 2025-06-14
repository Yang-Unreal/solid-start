// src/components/ProductListDashboard.tsx
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { PlusCircle, Trash2, Package } from "lucide-solid";
// CHANGE: Import the new types directly from your schema file
import type { Product, ProductImages } from "~/db/schema";

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// The API now returns the enhanced Product type
interface ApiResponse {
  data: Product[];
  pagination: PaginationInfo;
  error?: string;
}

const PRODUCTS_QUERY_KEY_PREFIX = "products";
const TARGET_ROWS_ON_PAGE = 3;
const MAX_API_PAGE_SIZE = 100;

async function deleteProductApi(
  productId: string
): Promise<{ message: string; product: Product }> {
  const fetchUrl = `/api/products?id=${productId}`;
  const response = await fetch(fetchUrl, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to parse error response from server" }));
    throw new Error(
      errorData.error ||
        `Error deleting product: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

// ... (calculatePageSize and getActiveColumnCount functions remain the same) ...
const getActiveColumnCount = () => {
  if (typeof window === "undefined") return 4;
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1920) return 6;
  if (screenWidth >= 1536) return 5;
  if (screenWidth >= 1280) return 4;
  if (screenWidth >= 1024) return 4;
  if (screenWidth >= 768) return 3;
  if (screenWidth >= 640) return 2;
  return 1;
};

const calculatePageSize = () => {
  const columns = getActiveColumnCount();
  let newPageSize = columns * TARGET_ROWS_ON_PAGE;
  if (newPageSize === 0 && columns > 0) newPageSize = columns;
  if (newPageSize < columns && columns > 0) newPageSize = columns;
  const absoluteMinPageSize = Math.max(6, columns);
  newPageSize = Math.max(newPageSize, absoluteMinPageSize);
  return Math.min(newPageSize, MAX_API_PAGE_SIZE);
};

export default function ProductListDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tanstackQueryClient = useQueryClient();

  // ... (data fetching logic and hooks remain the same) ...
  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    return Array.isArray(paramValue)
      ? paramValue[0] || defaultValue
      : paramValue || defaultValue;
  };
  const currentPage = () =>
    parseInt(getSearchParamString(searchParams.page, "1"), 10);
  const [dynamicPageSize, setDynamicPageSize] = createSignal(
    calculatePageSize()
  );

  onMount(() => {
    // ... onMount logic is unchanged ...
    const initialSize = calculatePageSize();
    setDynamicPageSize(initialSize);
    const currentParamSizeValue = searchParams.pageSize;
    let currentParamSizeAsNumber: number | undefined = undefined;
    if (Array.isArray(currentParamSizeValue)) {
      const firstValue = currentParamSizeValue[0];
      if (firstValue) {
        const parsed = parseInt(firstValue, 10);
        if (!isNaN(parsed)) currentParamSizeAsNumber = parsed;
      }
    } else if (typeof currentParamSizeValue === "string") {
      const parsed = parseInt(currentParamSizeValue, 10);
      if (!isNaN(parsed)) currentParamSizeAsNumber = parsed;
    }
    if (
      currentParamSizeAsNumber === undefined ||
      currentParamSizeAsNumber !== initialSize
    ) {
      setSearchParams(
        { page: "1", pageSize: initialSize.toString() },
        { replace: true }
      );
    }
    const handleResize = () => {
      const newSize = calculatePageSize();
      if (newSize !== dynamicPageSize()) {
        setDynamicPageSize(newSize);
        setSearchParams({ page: "1", pageSize: newSize.toString() });
      }
    };
    window.addEventListener("resize", handleResize);
    onCleanup(() => window.removeEventListener("resize", handleResize));
  });

  const pageSize = () => {
    // ... pageSize logic is unchanged ...
    const paramPageSizeValue = searchParams.pageSize;
    let paramToUse: string | undefined = undefined;
    if (Array.isArray(paramPageSizeValue)) {
      paramToUse = paramPageSizeValue[0];
    } else {
      paramToUse = paramPageSizeValue;
    }
    if (paramToUse) {
      const numParamPageSize = parseInt(paramToUse, 10);
      if (
        !isNaN(numParamPageSize) &&
        numParamPageSize > 0 &&
        numParamPageSize <= MAX_API_PAGE_SIZE
      ) {
        return numParamPageSize;
      }
    }
    return dynamicPageSize();
  };

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [string, { page: number; size: number }];
  }): Promise<ApiResponse> => {
    // ... fetchProductsQueryFn is unchanged ...
    const [_key, { page, size }] = context.queryKey;
    let baseUrl = "";
    if (import.meta.env.SSR && typeof window === "undefined") {
      baseUrl =
        import.meta.env.VITE_INTERNAL_API_ORIGIN ||
        `http://localhost:${process.env.PORT || 3000}`;
    }
    const fetchUrl = `${baseUrl}/api/products?page=${page}&pageSize=${size}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } else {
          const textError = await response.text();
          errorMsg = textError.substring(0, 200) || errorMsg;
        }
      } catch (e) {
        /* ignore */
      }
      throw new Error(errorMsg);
    }
    try {
      const data: ApiResponse = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (e: any) {
      throw new Error(`Invalid JSON response: ${e.message}`);
    }
  };

  const productsQuery = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    readonly [string, { page: number; size: number }]
  >(() => ({
    queryKey: [
      PRODUCTS_QUERY_KEY_PREFIX,
      { page: currentPage(), size: pageSize() },
    ] as const,
    queryFn: fetchProductsQueryFn,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    gcTime: 30 * 60 * 1000,
  }));

  const products = () => productsQuery.data?.data || [];
  const pagination = () => productsQuery.data?.pagination || null;
  const isFetching = () => productsQuery.isFetching;
  const error = () => productsQuery.error;

  const [deleteError, setDeleteError] = createSignal<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = createSignal<
    string | null
  >(null);

  const deleteProductMutation = useMutation(() => ({
    mutationFn: deleteProductApi,
    onSuccess: (data, variables) => {
      // CHANGE: Updated success message
      setShowSuccessMessage(
        `Product "${data.product.brand} ${data.product.model}" deleted successfully.`
      );
      tanstackQueryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });
      setDeleteError(null);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => {
      setDeleteError(err.message || "An unknown error occurred.");
      setShowSuccessMessage(null);
      setTimeout(() => setDeleteError(null), 5000);
    },
  }));
  const handleDeleteProduct = (product: Product) => {
    // CHANGE: Updated confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to delete "${product.brand} ${product.model}"?`
      )
    ) {
      setDeleteError(null);
      setShowSuccessMessage(null);
      deleteProductMutation.mutate(product.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toLocaleString("en-US")}`;
  const paginationButtonClasses = `min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Products List</h2>
        <A
          href="/products/new"
          class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-neutral-100"
        >
          <PlusCircle size={18} class="mr-2" /> Add Product
        </A>
      </div>

      <Show when={showSuccessMessage()}>
        <div class="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-300">
          {showSuccessMessage()}
        </div>
      </Show>
      <Show when={deleteError()}>
        <div class="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
          Error: {deleteError()}
        </div>
      </Show>

      <Show when={error()}>
        <div class="text-center py-10">
          <p class="text-red-600">
            Error: {error()?.message || "An unknown error occurred."}
          </p>
          <p class="text-neutral-700 mt-2">
            Please try refreshing.{" "}
            <button
              onClick={() => productsQuery.refetch()}
              class="ml-2 text-sky-600 underline"
            >
              Retry
            </button>
          </p>
        </div>
      </Show>

      <Show when={products().length > 0}>
        {/* Mobile List View */}
        <div class="block md:hidden space-y-3">
          <For each={products()}>
            {(product) => (
              <div class="bg-white rounded-lg shadow p-3 flex items-center space-x-4">
                <div class="flex-shrink-0 w-24">
                  {/* CHANGE: Use <picture> tag for optimized images */}
                  <picture>
                    <source
                      srcset={product.images.thumbnail.avif}
                      type="image/avif"
                    />
                    <source
                      srcset={product.images.thumbnail.webp}
                      type="image/webp"
                    />
                    <img
                      src={product.images.thumbnail.jpeg}
                      alt={`${product.brand} ${product.model}`}
                      class="w-full aspect-video rounded-md object-cover"
                    />
                  </picture>
                </div>
                <div class="flex-1 min-w-0">
                  {/* CHANGE: Display brand and model */}
                  <p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {product.brand}
                  </p>
                  <p class="font-bold text-neutral-800 truncate">
                    {product.model}
                  </p>
                  <p class="text-sm font-semibold text-neutral-700 mt-1">
                    {formatPrice(product.priceInCents)}
                  </p>
                </div>
                <div class="flex flex-col items-center space-y-2">
                  <span class="text-xs text-neutral-500">
                    Stock: {product.stockQuantity}
                  </span>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    disabled={
                      deleteProductMutation.isPending &&
                      deleteProductMutation.variables === product.id
                    }
                    class="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                    aria-label={`Delete ${product.brand} ${product.model}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Desktop Table View */}
        <div class="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Image
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <For each={products()}>
                {(product) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {/* CHANGE: Use <picture> tag for optimized images */}
                      <picture>
                        <source
                          srcset={product.images.thumbnail.avif}
                          type="image/avif"
                        />
                        <source
                          srcset={product.images.thumbnail.webp}
                          type="image/webp"
                        />
                        <img
                          src={product.images.thumbnail.jpeg}
                          alt={`${product.brand} ${product.model}`}
                          class="h-10 w-16 rounded-md object-cover"
                        />
                      </picture>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {/* CHANGE: Display brand and model */}
                      <div>{product.brand}</div>
                      <div class="font-normal text-neutral-600">
                        {product.model}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {product.category || "N/A"}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatPrice(product.priceInCents)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {product.stockQuantity}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        disabled={
                          deleteProductMutation.isPending &&
                          deleteProductMutation.variables === product.id
                        }
                        class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} class="inline-block mr-1" />
                        {deleteProductMutation.isPending &&
                        deleteProductMutation.variables === product.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        <Show when={pagination() && pagination()!.totalPages > 1}>
          <div class="mt-4 flex justify-center items-center space-x-3">
            <button
              onClick={() => handlePageChange(pagination()!.currentPage - 1)}
              disabled={!pagination()!.hasPreviousPage || isFetching()}
              class={paginationButtonClasses}
            >
              Previous
            </button>
            <span class="text-neutral-700 font-medium text-sm">
              Page {pagination()!.currentPage} of {pagination()!.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination()!.currentPage + 1)}
              disabled={!pagination()!.hasNextPage || isFetching()}
              class={paginationButtonClasses}
            >
              Next
            </button>
          </div>
        </Show>
      </Show>
      <Show when={products().length === 0 && !isFetching() && !error()}>
        <p class="text-center text-neutral-700 py-10">No products found.</p>
      </Show>
    </div>
  );
}
