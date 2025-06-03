// src/routes/products.tsx
import { For, Show } from "solid-js";
import { useSearchParams, A } from "@solidjs/router"; // Added A
import { MetaProvider, Title } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import { PlusCircle } from "lucide-solid"; // For the "Add Product" button

// Export the interface so it can be used by new.tsx
export interface Product {
  // Added export
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

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    if (Array.isArray(paramValue)) {
      return paramValue[0] || defaultValue;
    }
    return paramValue || defaultValue;
  };

  const currentPage = () => {
    const pageStr = getSearchParamString(searchParams.page, "1");
    return parseInt(pageStr, 10);
  };

  const pageSize = () => {
    const pageSizeStr = getSearchParamString(searchParams.pageSize, "12");
    return parseInt(pageSizeStr, 10);
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

    let response: Response;
    try {
      response = await fetch(fetchUrl);
    } catch (networkError: any) {
      throw new Error(
        `Network error: ${networkError.message || "Failed to connect"}`
      );
    }

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } else {
          const textError = await response.text();
          errorMsg = textError.substring(0, 200) || errorMsg;
        }
      } catch (parsingError) {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    try {
      const data: ApiResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (jsonError: any) {
      throw new Error(`Invalid JSON response: ${jsonError.message}`);
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
  const isLoadingInitial = () => productsQuery.isLoading && !productsQuery.data;
  const isFetching = () => productsQuery.isFetching;
  const error = () => productsQuery.error;

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const paginationButtonClasses = `
    min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium
    transition-colors duration-150 ease-in-out bg-[#c2fe0c] text-black
    hover:bg-[#a8e00a] active:bg-[#8ab40a] focus:outline-none focus:ring-2
    focus:ring-[#c2fe0c] focus:ring-offset-2 focus:ring-offset-neutral-100
    dark:focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <MetaProvider>
      <Title>Our Products</Title>
      <main class="bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
            Our Products
          </h1>
          <A
            href="/products/new" // Link to the new product page
            class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium
                   transition-colors duration-150 ease-in-out bg-[#c2fe0c] text-black
                   hover:bg-[#a8e00a] active:bg-[#8ab40a] focus:outline-none focus:ring-2
                   focus:ring-[#c2fe0c] focus:ring-offset-2 focus:ring-offset-neutral-100
                   dark:focus:ring-offset-black"
          >
            <PlusCircle size={18} class="mr-2" />
            Add Product
          </A>
        </div>

        <Show when={isLoadingInitial()}>
          <p class="text-center text-xl text-neutral-700 dark:text-neutral-300 py-10">
            Loading products...
          </p>
        </Show>

        <Show when={error() && !isFetching()}>
          <div class="text-center py-10">
            <p class="text-xl text-red-600 dark:text-red-400">
              Error: {error()?.message || "An unknown error occurred."}
            </p>
            <p class="text-neutral-600 dark:text-neutral-400 mt-2">
              Please try refreshing the page or check back later.
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
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <For each={products()}>
              {(product) => (
                <div class="card-content-host flex flex-col">
                  <Show when={product.imageUrl}>
                    <img
                      src={product.imageUrl!}
                      alt={product.name}
                      class="w-full h-56 object-cover"
                      loading="lazy"
                      width="400"
                      height="224"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
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
                  </div>
                </div>
              )}
            </For>
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
            No products found.
          </p>
        </Show>
      </main>
    </MetaProvider>
  );
};

export default ProductsPage;
