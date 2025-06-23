// src/components/ProductListDashboard.tsx
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import {
  PlusCircle,
  Trash2,
  Package,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Square, // Added Square icon for unchecked checkbox
  CheckSquare, // Added CheckSquare icon for checked checkbox
} from "lucide-solid";
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
  const [searchParams] = useSearchParams();
  const tanstackQueryClient = useQueryClient();
  const [selectedProductIds, setSelectedProductIds] = createSignal<Set<string>>(
    new Set()
  );

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const isProductSelected = (productId: string) =>
    selectedProductIds().has(productId);

  const toggleSelectAll = () => {
    const allProductIds: string[] = products().map((p) => p.id);
    if (selectedProductIds().size === allProductIds.length) {
      setSelectedProductIds(new Set<string>());
    } else {
      setSelectedProductIds(new Set<string>(allProductIds as string[]));
    }
  };

  const isAllSelected = () =>
    products().length > 0 &&
    selectedProductIds().size === products().length &&
    products().every((p) => selectedProductIds().has(p.id));

  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    return Array.isArray(paramValue)
      ? paramValue[0] || defaultValue
      : paramValue || defaultValue;
  };

  // Internal signals for page and pageSize, not tied to URL
  const [currentPage, setCurrentPage] = createSignal(1);
  const [dynamicPageSize, setDynamicPageSize] = createSignal(
    calculatePageSize()
  );

  const currentBrand = () => getSearchParamString(searchParams.brand, "");
  const currentCategory = () => getSearchParamString(searchParams.category, "");
  const currentFuelType = () => getSearchParamString(searchParams.fuelType, "");
  const currentSortBy = () =>
    getSearchParamString(searchParams.sortBy, "createdAt");
  const currentSortOrder = () =>
    getSearchParamString(searchParams.sortOrder, "desc");

  onMount(() => {
    const initialSize = calculatePageSize();
    setDynamicPageSize(initialSize); // Set initial page size

    const handleResize = () => {
      const newSize = calculatePageSize();
      if (newSize !== dynamicPageSize()) {
        setDynamicPageSize(newSize);
        setCurrentPage(1); // Reset to page 1 on resize
      }
    };
    window.addEventListener("resize", handleResize);
    onCleanup(() => window.removeEventListener("resize", handleResize));
  });

  const pageSize = () => dynamicPageSize(); // Always use internal dynamicPageSize

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [
      string,
      {
        page: number;
        size: number;
        q?: string; // Add q parameter
        brand: string;
        category: string;
        fuelType: string;
        sortBy: string;
        sortOrder: string;
      }
    ];
  }): Promise<ApiResponse> => {
    const [
      _key,
      { page, size, q, brand, category, fuelType, sortBy, sortOrder },
    ] = context.queryKey; // Destructure q
    let baseUrl = "";
    if (import.meta.env.SSR && typeof window === "undefined") {
      baseUrl =
        import.meta.env.VITE_INTERNAL_API_ORIGIN ||
        `http://localhost:${process.env.PORT || 3000}`;
    }
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", size.toString());
    if (q) params.append("q", q); // Add this line
    if (brand) params.append("brand", brand);
    if (category) params.append("category", category);
    if (fuelType) params.append("fuelType", fuelType);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);

    const fetchUrl = `${baseUrl}/api/products?${params.toString()}`;
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
    readonly [
      string,
      {
        page: number;
        size: number;
        q?: string; // Add q parameter
        brand: string;
        category: string;
        fuelType: string;
        sortBy: string;
        sortOrder: string;
      }
    ]
  >(() => ({
    queryKey: [
      PRODUCTS_QUERY_KEY_PREFIX,
      {
        page: currentPage(), // Use internal currentPage signal
        size: pageSize(), // Use internal pageSize signal
        q: getSearchParamString(searchParams.q, ""),
        brand: currentBrand(),
        category: currentCategory(),
        fuelType: currentFuelType(),
        sortBy: currentSortBy(),
        sortOrder: currentSortOrder(),
      },
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

  async function bulkDeleteProductsApi(
    productIds: string[]
  ): Promise<{ message: string; deletedCount: number }> {
    const response = await fetch("/api/products/bulk-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: productIds }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to parse error response from server" }));
      throw new Error(
        errorData.error ||
          `Error deleting products: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }

  const deleteProductMutation = useMutation(() => ({
    mutationFn: deleteProductApi,
    onSuccess: (data, variables) => {
      setShowSuccessMessage(
        `Product "${data.product.brand} ${data.product.model}" deleted successfully.`
      );
      tanstackQueryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });
      tanstackQueryClient.setQueriesData<ApiResponse | undefined>(
        { queryKey: [PRODUCTS_QUERY_KEY_PREFIX], exact: false },
        (oldData) => {
          if (!oldData?.data) {
            return oldData;
          }
          const newDataArray = oldData.data.filter(
            (product) => product.id !== variables
          );
          return {
            ...oldData,
            data: newDataArray,
          };
        }
      );
      tanstackQueryClient.removeQueries({
        queryKey: ["product", variables],
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

  const bulkDeleteProductsMutation = useMutation(() => ({
    mutationFn: bulkDeleteProductsApi,
    onSuccess: (data, variables) => {
      setShowSuccessMessage(
        `${data.deletedCount} products deleted successfully.`
      );

      const currentPagination = pagination(); // Get current pagination info before cache update
      const productsBeforeOptimisticUpdate = products(); // Capture current products array before optimistic update

      // Optimistically update the cache
      tanstackQueryClient.setQueriesData<ApiResponse | undefined>(
        { queryKey: [PRODUCTS_QUERY_KEY_PREFIX], exact: false },
        (oldData) => {
          if (!oldData?.data) {
            return oldData;
          }
          const deletedIds = new Set(variables);
          const newDataArray = oldData.data.filter(
            (product) => !deletedIds.has(product.id)
          );
          return {
            ...oldData,
            data: newDataArray,
          };
        }
      );

      variables.forEach((id) => {
        tanstackQueryClient.removeQueries({
          queryKey: ["product", id],
        });
      });
      setSelectedProductIds(new Set<string>()); // Clear selection after successful deletion
      setDeleteError(null);

      if (currentPagination && data.deletedCount > 0) {
        let newPage = currentPagination.currentPage;
        const currentProductsCountOnPage =
          productsBeforeOptimisticUpdate.length;

        // If all products on the current page were deleted
        if (data.deletedCount === currentProductsCountOnPage) {
          // If it's not the first page, go to the previous page
          if (currentPagination.currentPage > 1) {
            newPage = currentPagination.currentPage - 1;
          } else {
            // If it's the first page and all products on it were deleted,
            // and there are no more products in total, stay on page 1.
            // The "No products found" message will correctly appear if total products is 0.
            newPage = 1;
          }
        } else {
          // If not all products on the current page were deleted,
          // or if we are on the first page and some products remain,
          // we might need to adjust if the total pages changed.
          const expectedTotalProductsAfterDeletion = Math.max(
            0,
            currentPagination.totalProducts - data.deletedCount
          );
          const expectedTotalPages = Math.max(
            1,
            Math.ceil(
              expectedTotalProductsAfterDeletion / currentPagination.pageSize
            )
          );

          if (newPage > expectedTotalPages) {
            newPage = expectedTotalPages;
          }
        }

        if (newPage !== currentPagination.currentPage) {
          handlePageChange(newPage);
        }
      }

      // Invalidate queries *after* determining the new page, so the next fetch is for the correct page.
      tanstackQueryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });

      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => {
      setDeleteError(
        err.message || "An unknown error occurred during bulk delete."
      );
      setShowSuccessMessage(null);
      setTimeout(() => setDeleteError(null), 5000);
    },
  }));

  const handleDeleteProduct = (product: Product) => {
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

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedProductIds());
    if (idsToDelete.length === 0) {
      setDeleteError("No products selected for deletion.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete ${idsToDelete.length} selected products?`
      )
    ) {
      setDeleteError(null);
      setShowSuccessMessage(null);
      bulkDeleteProductsMutation.mutate(idsToDelete);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage); // Update internal page signal
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toLocaleString("en-US")}`;
  const paginationButtonClasses = `h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-300 text-neutral-700 hover:bg-neutral-400 active:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-neutral-100 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed`;

  return (
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Products List</h2>
        <div class="flex items-center space-x-2">
          <A
            href="/products/new"
            class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-neutral-100"
          >
            <PlusCircle size={18} class="mr-2" /> Add Product
          </A>
          <Show when={selectedProductIds().size > 0}>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteProductsMutation.isPending}
              class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} class="mr-2" />{" "}
              {bulkDeleteProductsMutation.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedProductIds().size})`}
            </button>
          </Show>
        </div>
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

      {/* Mobile List View */}
      <div class="block md:hidden space-y-3">
        <Show
          when={pagination() && pagination()!.totalProducts > 0}
          fallback={
            <p class="text-center text-neutral-700 py-10">No products found.</p>
          }
        >
          <For each={products()}>
            {(product) => (
              <div class="bg-white rounded-lg shadow p-3 flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <button
                    onClick={() => toggleProductSelection(product.id)}
                    class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                    aria-label={`Select ${product.name}`}
                  >
                    <Show
                      when={isProductSelected(product.id)}
                      fallback={<Square size={20} />}
                    >
                      <CheckSquare size={20} />
                    </Show>
                  </button>
                </div>
                <div class="flex-shrink-0 w-24">
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
                      alt={product.name}
                      class="w-24 h-16 rounded-md object-cover"
                      fetchpriority="high"
                    />
                  </picture>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-neutral-800 truncate">
                    {product.name}
                  </p>
                  <p class="text-sm font-semibold text-neutral-700 mt-1">
                    {formatPrice(product.priceInCents)}
                  </p>
                  <p class="text-xs text-neutral-500 mt-1">
                    Brand: {product.brand || "N/A"}
                  </p>
                  <p class="text-xs text-neutral-500">
                    Category: {product.category || "N/A"}
                  </p>
                  <p class="text-xs text-neutral-500">
                    Stock: {product.stockQuantity}
                  </p>
                </div>
                <div class="flex flex-col items-center space-y-2">
                  <A
                    href={`/products/${product.id}/edit`}
                    class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil size={18} />
                  </A>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    disabled={
                      deleteProductMutation.isPending &&
                      deleteProductMutation.variables === product.id
                    }
                    class="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>

      {/* Desktop Table View */}
      <div class="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg">
        <Show
          when={pagination() && pagination()!.totalProducts > 0}
          fallback={
            <p class="text-center text-neutral-700 py-10">No products found.</p>
          }
        >
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <button
                    onClick={toggleSelectAll}
                    class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                    aria-label="Select all products"
                  >
                    <Show
                      when={isAllSelected()}
                      fallback={<Square size={20} />}
                    >
                      <CheckSquare size={20} />
                    </Show>
                  </button>
                </th>
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
                      <button
                        onClick={() => toggleProductSelection(product.id)}
                        class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                        aria-label={`Select ${product.name}`}
                      >
                        <Show
                          when={isProductSelected(product.id)}
                          fallback={<Square size={20} />}
                        >
                          <CheckSquare size={20} />
                        </Show>
                      </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
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
                          alt={product.name}
                          class="h-10 w-16 rounded-md object-cover"
                        />
                      </picture>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      <div>{product.name}</div>
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
                      <A
                        href={`/products/${product.id}/edit`}
                        class="text-sky-600 hover:text-sky-900 mr-4"
                      >
                        <Pencil size={16} class="inline-block mr-1" />
                        Edit
                      </A>
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
        </Show>
      </div>

      <Show when={pagination() && pagination()!.totalPages > 1}>
        <div class="mt-4 flex flex-wrap justify-center items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination()!.currentPage === 1 || isFetching()}
            class={paginationButtonClasses}
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage - 1)}
            disabled={!pagination()!.hasPreviousPage || isFetching()}
            class={paginationButtonClasses}
          >
            <ChevronLeft size={18} />
          </button>
          <span class="text-neutral-700 font-medium text-sm px-2 py-1">
            Page {pagination()!.currentPage} of {pagination()!.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage + 1)}
            disabled={!pagination()!.hasNextPage || isFetching()}
            class={paginationButtonClasses}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.totalPages)}
            disabled={
              pagination()!.currentPage === pagination()!.totalPages ||
              isFetching()
            }
            class={paginationButtonClasses}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </Show>
    </div>
  );
}
