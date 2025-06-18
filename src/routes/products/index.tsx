// src/routes/products/index.tsx
import { createSignal, onMount, onCleanup } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { MetaProvider } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import ProductDisplayArea from "~/components/ProductDisplayArea";
import SearchInput from "~/components/SearchInput"; // Import SearchInput
import FilterDropdowns from "~/components/FilterDropdowns"; // Import FilterDropdowns
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

  // State for the search input, NOT synced with URL
  const [searchQuery, setSearchQuery] = createSignal(""); // Initialize as empty, not from URL

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

  // Queries for filter options
  const fetchFilterOptions = async (
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<string[]> => {
    const urlParams = new URLSearchParams();
    for (const key in params) {
      if (params[key]) {
        urlParams.append(key, params[key]);
      }
    }
    const queryString = urlParams.toString();
    const fetchUrl = `${baseUrl}/api/products/${endpoint}${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  };

  const brandsQuery = useQuery<string[], Error>(() => ({
    queryKey: ["brands", selectedCategory(), selectedFuelType()], // Brands depend on selected category and fuel type
    queryFn: ({ queryKey }) =>
      fetchFilterOptions("brands", {
        category: queryKey[1] as string,
        fuelType: queryKey[2] as string,
      }),
    staleTime: Infinity, // Brands list is unlikely to change often
  }));

  const categoriesQuery = useQuery<string[], Error>(() => ({
    queryKey: ["categories", selectedBrand()], // Categories depend on selected brand
    queryFn: ({ queryKey }) =>
      fetchFilterOptions("categories", { brand: queryKey[1] as string }),
    staleTime: Infinity,
    // Removed 'enabled' property to always fetch, letting fetchFilterOptions handle empty brand
  }));

  const fuelTypesQuery = useQuery<string[], Error>(() => ({
    queryKey: ["fuelTypes", selectedBrand(), selectedCategory()], // Fuel types depend on brand and category
    queryFn: ({ queryKey }) =>
      fetchFilterOptions("fuelTypes", {
        brand: queryKey[1] as string,
        category: queryKey[2] as string,
      }),
    staleTime: Infinity,
    // Removed 'enabled' property to always fetch, letting fetchFilterOptions handle empty brand/category
  }));

  // --- Event Handlers ---

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Trigger a refetch of products based on the new search query
    // No need to update searchParams.q, as it's no longer in the URL
    productsQuery.refetch();
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

  const selectClasses =
    "w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100";

  return (
    <MetaProvider>
      <main class="bg-white pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
          {/* --- Search and Filter Controls --- */}
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectClasses={selectClasses}
          />

          <FilterDropdowns
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedFuelType={selectedFuelType}
            handleFilterChange={handleFilterChange}
            isFetching={() => productsQuery.isFetching}
            selectClasses={selectClasses}
            brands={brandsQuery.data || []}
            categories={categoriesQuery.data || []}
            fuelTypes={fuelTypesQuery.data || []}
          />

          {/* --- Content Display --- */}
          <ProductDisplayArea
            productsQuery={productsQuery}
            handlePageChange={handlePageChange}
            pageSize={pageSize}
          />
        </div>
      </main>
    </MetaProvider>
  );
};

export default ProductsPage;
