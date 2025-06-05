// src/routes/products/index.tsx
import {
  For,
  Show,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
} from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { PlusCircle, Trash2 } from "lucide-solid";
import { authClient } from "~/lib/auth-client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  imageUrl: string | null;
  category: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  data: Product[];
  pagination: PaginationInfo;
  error?: string;
}

const PRODUCTS_QUERY_KEY_PREFIX = "products";

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

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = authClient.useSession();
  const tanstackQueryClient = useQueryClient();

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

  const [dynamicPageSize, setDynamicPageSize] = createSignal(12); // Default initial page size

  const calculatePageSize = () => {
    if (typeof window !== "undefined") {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 2800) return 36;
      if (screenWidth >= 1920) return 24;
      if (screenWidth >= 1280) return 18;
      if (screenWidth >= 768) return 12;
      return 8;
    }
    return 12;
  };

  onMount(() => {
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
        numParamPageSize <= 100
      ) {
        // MAX_PAGE_SIZE from API
        return numParamPageSize;
      }
    }
    return dynamicPageSize() || 12;
  };

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [string, { page: number; size: number }];
  }): Promise<ApiResponse> => {
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
  const isLoadingInitial = () =>
    productsQuery.isLoading && !productsQuery.data && !productsQuery.isError;
  const isFetching = () => productsQuery.isFetching;
  const error = () => productsQuery.error;

  const [deleteError, setDeleteError] = createSignal<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = createSignal<
    string | null
  >(null);

  const deleteProductMutation = useMutation(() => ({
    mutationFn: deleteProductApi,
    onSuccess: (data, variables) => {
      setShowSuccessMessage(
        `Product "${data.product.name}" deleted successfully.`
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

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      setDeleteError(null);
      setShowSuccessMessage(null);
      deleteProductMutation.mutate(productId);
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
    `$${(priceInCents / 100).toFixed(2)}`;
  const paginationButtonClasses = `min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-[#c2fe0c] text-black hover:bg-[#a8e00a] active:bg-[#8ab40a] focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed`;
  const userRole = () =>
    (session()?.data?.user as { role?: string } | undefined)?.role;

  return (
    <MetaProvider>
      <Title>Our Products</Title>
      <main class="bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
            Our Products
          </h1>
          <Show when={!session().isPending && userRole() === "admin"}>
            <A
              href="/products/new"
              class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-[#c2fe0c] text-black hover:bg-[#a8e00a] active:bg-[#8ab40a] focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-black"
            >
              <PlusCircle size={18} class="mr-2" /> Add Product
            </A>
          </Show>
        </div>

        <Show when={showSuccessMessage()}>
          <div class="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-500/50">
            {showSuccessMessage()}
          </div>
        </Show>
        <Show when={deleteError()}>
          <div class="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-500/50">
            Error: {deleteError()}
          </div>
        </Show>
        <Show when={isLoadingInitial()}>
          <p class="text-center text-xl text-neutral-700 dark:text-neutral-300 py-10">
            Loading products...
          </p>
        </Show>
        <Show when={error() && !isFetching() && !isLoadingInitial()}>
          <div class="text-center py-10">
            <p class="text-xl text-red-600 dark:text-red-400">
              Error: {error()?.message || "An unknown error occurred."}
            </p>
            <p class="text-neutral-600 dark:text-neutral-400 mt-2">
              Please try refreshing.{" "}
              <button
                onClick={() => productsQuery.refetch()}
                class="ml-2 text-sky-600 dark:text-[#c2fe0c] underline"
              >
                Retry
              </button>
            </p>
          </div>
        </Show>

        <Show when={productsQuery.data && !error()}>
          <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
            <div class="product-grid gap-6 sm:gap-8">
              <For each={products()}>
                {(product) => (
                  <div class="card-content-host flex flex-col bg-white dark:bg-black shadow-lg rounded-xl overflow-hidden">
                    <Show when={product.imageUrl}>
                      <div class="w-full aspect-video bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <img
                          src={product.imageUrl!}
                          alt={product.name}
                          class="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    </Show>
                    <div class="p-5 flex flex-col flex-grow">
                      <h2
                        class="text-lg font-semibold mb-1 text-neutral-800 dark:text-neutral-200 truncate"
                        title={product.name}
                      >
                        {product.name}
                      </h2>
                      <p class="text-xl mb-3 text-neutral-700 dark:text-neutral-300">
                        {formatPrice(product.priceInCents)}
                      </p>
                      <Show when={product.description}>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-grow min-h-[40px]">
                          {product.description!.length > 100
                            ? product.description!.substring(0, 97) + "..."
                            : product.description}
                        </p>
                      </Show>
                      <div class="mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <p class="text-xs text-neutral-500 dark:text-neutral-400">
                          Category: {product.category || "N/A"}
                        </p>
                        <p class="text-xs text-neutral-500 dark:text-neutral-400">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>
                      <Show
                        when={!session().isPending && userRole() === "admin"}
                      >
                        <div class="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <button
                            onClick={() =>
                              handleDeleteProduct(product.id, product.name)
                            }
                            disabled={
                              deleteProductMutation.isPending &&
                              deleteProductMutation.variables === product.id
                            }
                            class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-100  focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black"
                          >
                            <Trash2 size={16} class="mr-2" />
                            {deleteProductMutation.isPending &&
                            deleteProductMutation.variables === product.id
                              ? "Deleting..."
                              : "Delete Product"}
                          </button>
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
          <Show when={pagination() && pagination()!.totalPages > 1}>
            <div class="mt-10 flex justify-center items-center space-x-3">
              <button
                onClick={() => handlePageChange(pagination()!.currentPage - 1)}
                disabled={!pagination()!.hasPreviousPage || isFetching()}
                class={paginationButtonClasses}
              >
                Previous
              </button>
              <span class="text-neutral-700 dark:text-neutral-300 font-medium text-sm">
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
        <Show
          when={
            productsQuery.isSuccess &&
            !isLoadingInitial() &&
            !error() &&
            products().length === 0
          }
        >
          <p class="text-center text-xl text-neutral-700 dark:text-neutral-300 py-10">
            No products found. Add some!
          </p>
        </Show>
      </main>
    </MetaProvider>
  );
};
export default ProductsPage;
