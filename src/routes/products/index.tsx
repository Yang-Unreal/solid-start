// src/routes/products/index.tsx
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";

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
const TARGET_ROWS_ON_PAGE = 3;
const MAX_API_PAGE_SIZE = 100;

const getActiveColumnCount = () => {
  if (typeof window === "undefined") return 4; // SSR fallback (e.g., for 'lg')

  const screenWidth = window.innerWidth;

  // Pixel values for breakpoints:
  // Default Tailwind: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

  // Order from largest to smallest is important.
  if (screenWidth >= 1920) return 6; // Matches custom `3xl:grid-cols-6`
  if (screenWidth >= 1536) return 5; // Matches `2xl:grid-cols-5`
  if (screenWidth >= 1280) return 4; // Matches `xl:grid-cols-4`
  if (screenWidth >= 1024) return 4; // Matches `lg:grid-cols-4`
  if (screenWidth >= 768) return 3; // Matches `md:grid-cols-3`
  if (screenWidth >= 640) return 2; // Matches `sm:grid-cols-2`
  return 1; // Default `grid-cols-1`
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

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toFixed(2)}`;
  const paginationButtonClasses = `min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <MetaProvider>
      <main class="bg-white pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <Show when={isLoadingInitial()}>
          <p class="text-center text-xl text-neutral-700 py-10">
            Loading products...
          </p>
        </Show>
        <Show when={error() && !isFetching() && !isLoadingInitial()}>
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

        <Show when={productsQuery.data && !error()}>
          <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
            {/*
              Tailwind classes define columns. `getActiveColumnCount` MUST match these.
            */}
            <div class="justify-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 sm:gap-8">
              <For each={products()}>
                {(product) => (
                  <div class="card-content-host flex flex-col bg-white shadow-lg rounded-xl overflow-hidden">
                    <Show when={product.imageUrl}>
                      <div class="w-full aspect-video bg-neutral-200 overflow-hidden">
                        <img
                          src={product.imageUrl!}
                          alt={product.name}
                          class="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      </div>
                    </Show>
                    <div class="p-5 flex flex-col flex-grow">
                      <h2
                        class="text-lg font-semibold mb-1 text-neutral-800 truncate"
                        title={product.name}
                      >
                        {product.name}
                      </h2>
                      <p class="text-xl mb-3 text-neutral-700">
                        {formatPrice(product.priceInCents)}
                      </p>
                      <Show when={product.description}>
                        <p class="text-sm text-neutral-700 mb-4 flex-grow min-h-[40px]">
                          {product.description!.length > 100
                            ? product.description!.substring(0, 97) + "..."
                            : product.description}
                        </p>
                      </Show>
                      <div class="mt-auto pt-2 border-t border-neutral-200">
                        <p class="text-xs text-neutral-600">
                          Category: {product.category || "N/A"}
                        </p>
                        <p class="text-xs text-neutral-600">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>
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
        <Show
          when={
            productsQuery.isSuccess &&
            !isLoadingInitial() &&
            !error() &&
            products().length === 0
          }
        >
          <p class="text-center text-xl text-neutral-700 py-10">
            No products found. Add some!
          </p>
        </Show>
      </main>
    </MetaProvider>
  );
};
export default ProductsPage;
