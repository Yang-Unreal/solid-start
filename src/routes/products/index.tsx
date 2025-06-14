// src/routes/products/index.tsx
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import type { Product } from "~/db/schema";

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
const TARGET_ROWS_ON_PAGE = 3;
const MAX_API_PAGE_SIZE = 100;

// CHANGE: This logic is now perfectly synced with the CSS classes.
// The order is from largest to smallest to ensure the correct breakpoint is matched.
const getActiveColumnCount = () => {
  if (typeof window === "undefined") return 4; // SSR fallback
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1920) return 6; // Matches 3xl:grid-cols-6
  if (screenWidth >= 1536) return 5; // Matches 2xl:grid-cols-5
  if (screenWidth >= 1024) return 4; // Matches lg:grid-cols-4 and xl:grid-cols-4
  if (screenWidth >= 768) return 3; // Matches md:grid-cols-3
  if (screenWidth >= 640) return 2; // Matches sm:grid-cols-2
  return 1; // Default for screens smaller than 640px
};

const calculatePageSize = () => {
  const columns = getActiveColumnCount();
  let newPageSize = columns * TARGET_ROWS_ON_PAGE;
  if (newPageSize === 0) newPageSize = 12; // Fallback
  return Math.min(newPageSize, MAX_API_PAGE_SIZE);
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageSize, setPageSize] = createSignal(calculatePageSize());

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

  onMount(() => {
    setPageSize(calculatePageSize());
    const handleResize = () => {
      const newSize = calculatePageSize();
      if (newSize !== pageSize()) {
        setPageSize(newSize);
        setSearchParams({ page: "1", pageSize: newSize.toString() });
      }
    };
    window.addEventListener("resize", handleResize);
    onCleanup(() => window.removeEventListener("resize", handleResize));
  });

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
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
  }));

  const products = () => productsQuery.data?.data || [];
  const pagination = () => productsQuery.data?.pagination || null;
  const isFetching = () => productsQuery.isFetching;
  const error = () => productsQuery.error;

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toLocaleString("en-US")}`;
  const paginationButtonClasses = `min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <MetaProvider>
      <main class="bg-white pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <Show when={productsQuery.isLoading && !productsQuery.isFetching}>
          <p class="text-center text-xl text-neutral-700 py-10">
            Loading products...
          </p>
        </Show>
        <Show when={error()}>
          <div class="text-center py-10">
            <p class="text-xl text-red-600">
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

        <Show when={productsQuery.data}>
          <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
            {/* This CSS now perfectly matches the JS logic */}
            <div class="justify-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6  gap-6 sm:gap-8">
              <For each={products()}>
                {(product) => (
                  <A
                    href={`/products/${product.id}`}
                    class="card-content-host flex flex-col bg-white shadow-lg rounded-xl overflow-hidden group"
                  >
                    <div class="w-full aspect-video bg-neutral-100 overflow-hidden">
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
                          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          width="640"
                          height="360"
                        />
                      </picture>
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                      <p class="text-sm font-medium text-neutral-500">
                        {product.brand}
                      </p>
                      <h2
                        class="text-lg font-semibold text-neutral-800 truncate"
                        title={product.model}
                      >
                        {product.model}
                      </h2>
                      <p class="text-xl mt-2 mb-4 text-neutral-700 flex-grow">
                        {formatPrice(product.priceInCents)}
                      </p>
                      <div class="mt-auto pt-2 border-t border-neutral-100">
                        <p class="text-xs text-neutral-600">
                          Category: {product.category || "N/A"}
                        </p>
                        <p class="text-xs text-neutral-600">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>
                    </div>
                  </A>
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
        <Show when={productsQuery.isSuccess && products().length === 0}>
          <p class="text-center text-xl text-neutral-700 py-10">
            No products found. Add some!
          </p>
        </Show>
      </main>
    </MetaProvider>
  );
};
export default ProductsPage;
