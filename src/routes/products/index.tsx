// src/routes/products/index.tsx
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import type { Product } from "~/db/schema";

// --- Type Definitions ---
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

// --- Constants ---
const PRODUCTS_QUERY_KEY_PREFIX = "products";
const TARGET_ROWS_ON_PAGE = 3;
const MAX_API_PAGE_SIZE = 100;

// --- Helper Functions ---
const getActiveColumnCount = () => {
  if (typeof window === "undefined") return 4; // Default for SSR
  const screenWidth = window.innerWidth;
  if (screenWidth >= 1920) return 6;
  if (screenWidth >= 1536) return 5;
  if (screenWidth >= 1024) return 4;
  if (screenWidth >= 768) return 3;
  if (screenWidth >= 640) return 2;
  return 1;
};

const calculatePageSize = () => {
  const columns = getActiveColumnCount();
  let newPageSize = columns * TARGET_ROWS_ON_PAGE;
  if (newPageSize === 0) newPageSize = 12; // Fallback
  return Math.min(newPageSize, MAX_API_PAGE_SIZE);
};

// --- Main Component ---
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dynamicPageSize, setDynamicPageSize] = createSignal(
    calculatePageSize()
  );

  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    return Array.isArray(paramValue)
      ? paramValue[0] || defaultValue
      : paramValue || defaultValue;
  };

  // State for the search input, synced with URL
  const [searchQuery, setSearchQuery] = createSignal(
    getSearchParamString(searchParams.q, "")
  );

  const pageSize = () => {
    const paramPageSizeValue = getSearchParamString(searchParams.pageSize, "");
    if (paramPageSizeValue) {
      const numParamPageSize = parseInt(paramPageSizeValue, 10);
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

  let baseUrl = "";
  if (import.meta.env.SSR && typeof window === "undefined") {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }

  // Signals for URL parameters
  const currentPage = () =>
    parseInt(getSearchParamString(searchParams.page, "1"), 10);
  const selectedBrand = () => getSearchParamString(searchParams.brand, "");
  const selectedCategory = () =>
    getSearchParamString(searchParams.category, "");
  const selectedFuelType = () =>
    getSearchParamString(searchParams.fuelType, "");

  onMount(() => {
    const handleResize = () => {
      const newSize = calculatePageSize();
      if (newSize !== pageSize()) {
        setDynamicPageSize(newSize);
        // On resize, reset to page 1 with the new page size
        setSearchParams({
          ...searchParams,
          page: "1",
          pageSize: newSize.toString(),
        });
      }
    };
    window.addEventListener("resize", handleResize);
    onCleanup(() => window.removeEventListener("resize", handleResize));
  });

  // --- Data Fetching ---

  // Main query function for products
  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [
      string,
      {
        page: number;
        size: number;
        brand: string;
        category: string;
        fuelType: string;
        q: string; // Search query parameter
      }
    ];
  }): Promise<ApiResponse> => {
    const [_key, { page, size, brand, category, fuelType, q }] =
      context.queryKey;
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", size.toString());
    if (brand) params.append("brand", brand);
    if (category) params.append("category", category);
    if (fuelType) params.append("fuelType", fuelType);
    if (q) params.append("q", q); // Add search query to the API call

    const queryString = params.toString();
    const fetchUrl = `${baseUrl}/api/products?${queryString}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  };

  // TanStack Query for products
  const productsQuery = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    readonly [
      string,
      {
        page: number;
        size: number;
        brand: string;
        category: string;
        fuelType: string;
        q: string;
      }
    ]
  >(() => ({
    queryKey: [
      PRODUCTS_QUERY_KEY_PREFIX,
      {
        page: currentPage(),
        size: pageSize(),
        brand: selectedBrand(),
        category: selectedCategory(),
        fuelType: selectedFuelType(),
        q: searchQuery(), // Include search query in the query key
      },
    ] as const,
    queryFn: fetchProductsQueryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Provides a smoother UX while new data loads
  }));

  const products = () => productsQuery.data?.data || [];
  const pagination = () => productsQuery.data?.pagination || null;
  const isFetching = () => productsQuery.isFetching;
  const error = () => productsQuery.error;

  // --- Event Handlers ---

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchParams({
      ...searchParams,
      page: "1", // Reset to page 1 on a new search
      q: query || undefined, // Remove 'q' param if empty
    });
  };

  const handleFilterChange = (
    filterType: "brand" | "category" | "fuelType",
    value: string
  ) => {
    setSearchParams({
      ...searchParams,
      page: "1", // Reset to page 1 when a filter changes
      [filterType]: value || undefined, // Remove param if "All" is selected
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...searchParams,
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- UI and Formatting ---

  const formatPrice = (priceInCents: number) =>
    `$${(priceInCents / 100).toLocaleString("en-US")}`;
  const paginationButtonClasses = `w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[100px] sm:px-4 sm:py-2`;
  const selectClasses =
    "w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100";

  return (
    <MetaProvider>
      <main class="bg-white pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
          {/* --- Search and Filter Controls --- */}
          <div class="mb-6">
            <label for="search-input" class="sr-only">
              Search Products
            </label>
            <input
              id="search-input"
              type="search"
              placeholder="Search for products by name, brand, model..."
              value={searchQuery()}
              onInput={(e) => handleSearchChange(e.currentTarget.value)}
              class={selectClasses}
              aria-label="Search products"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* These filter dropdowns are now supplemental to the main search */}
            <div>
              <label for="brand-select" class="sr-only">
                Brand
              </label>
              <select
                id="brand-select"
                value={selectedBrand()}
                onChange={(e) =>
                  handleFilterChange("brand", e.currentTarget.value)
                }
                class={selectClasses}
                disabled={isFetching()}
              >
                <option value="">All Brands</option>
                {/* For simplicity, we are not showing dynamic filter options here, but they can be added back with separate useQuery hooks */}
              </select>
            </div>
            <div>
              <label for="category-select" class="sr-only">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory()}
                onChange={(e) =>
                  handleFilterChange("category", e.currentTarget.value)
                }
                class={selectClasses}
                disabled={isFetching()}
              >
                <option value="">All Categories</option>
              </select>
            </div>
            <div>
              <label for="fuel-type-select" class="sr-only">
                Fuel Type
              </label>
              <select
                id="fuel-type-select"
                value={selectedFuelType()}
                onChange={(e) =>
                  handleFilterChange("fuelType", e.currentTarget.value)
                }
                class={selectClasses}
                disabled={isFetching()}
              >
                <option value="">All Fuel Types</option>
              </select>
            </div>
          </div>

          {/* --- Content Display --- */}
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
                  aria-label="Retry fetching products"
                >
                  Retry
                </button>
              </p>
            </div>
          </Show>

          <Show
            when={products().length > 0}
            fallback={
              <Show when={!isFetching()}>
                <p class="text-center text-xl text-neutral-700 py-10">
                  No products found.
                </p>
              </Show>
            }
          >
            <div class="product-grid-container justify-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
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
                          alt={product.name}
                          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fetchpriority="high"
                          width="640"
                          height="360"
                        />
                      </picture>
                    </div>
                    <div class="p-5 flex flex-col flex-grow">
                      <h2
                        class="text-lg font-semibold text-neutral-800 truncate"
                        title={product.name}
                      >
                        {product.name}
                      </h2>
                      <p class="text-xl mt-2 mb-4 text-neutral-700 flex-grow">
                        {formatPrice(product.priceInCents)}
                      </p>
                      <div class="mt-auto pt-2 border-t border-neutral-100">
                        <p class="text-xs text-neutral-600">
                          Brand: {product.brand || "N/A"}
                        </p>
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

            <Show when={pagination() && pagination()!.totalPages > 1}>
              <div class="mt-10 flex justify-center items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination()!.hasPreviousPage || isFetching()}
                  class={paginationButtonClasses}
                  aria-label="First page"
                >
                  <span class="hidden sm:inline">First</span>
                  <span class="sm:hidden" aria-hidden="true">
                    «
                  </span>
                </button>
                <button
                  onClick={() =>
                    handlePageChange(pagination()!.currentPage - 1)
                  }
                  disabled={!pagination()!.hasPreviousPage || isFetching()}
                  class={paginationButtonClasses}
                  aria-label="Previous page"
                >
                  <span class="hidden sm:inline">Previous</span>
                  <span class="sm:hidden" aria-hidden="true">
                    ‹
                  </span>
                </button>
                <span class="text-neutral-700 font-medium text-sm px-2">
                  Page {pagination()!.currentPage} of {pagination()!.totalPages}
                </span>
                <button
                  onClick={() =>
                    handlePageChange(pagination()!.currentPage + 1)
                  }
                  disabled={!pagination()!.hasNextPage || isFetching()}
                  class={paginationButtonClasses}
                  aria-label="Next page"
                >
                  <span class="hidden sm:inline">Next</span>
                  <span class="sm:hidden" aria-hidden="true">
                    ›
                  </span>
                </button>
                <button
                  onClick={() => handlePageChange(pagination()!.totalPages)}
                  disabled={!pagination()!.hasNextPage || isFetching()}
                  class={paginationButtonClasses}
                  aria-label="Last page"
                >
                  <span class="hidden sm:inline">Last</span>
                  <span class="sm:hidden" aria-hidden="true">
                    »
                  </span>
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </main>
    </MetaProvider>
  );
};

export default ProductsPage;
