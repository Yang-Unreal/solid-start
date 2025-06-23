// src/routes/products/index.tsx
import {
  createSignal,
  onMount,
  onCleanup,
  For,
  createEffect,
  on,
  createMemo,
} from "solid-js";
import { useSearchParams } from "@solidjs/router"; // Still needed for page/pageSize
import { MetaProvider } from "@solidjs/meta";
import { useQuery } from "@tanstack/solid-query";
import ProductDisplayArea from "~/components/ProductDisplayArea";
import SearchInput from "~/components/SearchInput";
import FilterDropdown from "~/components/FilterDropdowns"; // Import the new component
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
  // Removed facets property
}

// New type for filter options API response
interface FilterOptionsResponse
  extends Record<string, Record<string, number>> {}

// --- Constants ---
const PRODUCTS_QUERY_KEY_PREFIX = "products";
const FILTER_OPTIONS_QUERY_KEY = "filterOptions";
const TARGET_ROWS_ON_PAGE = 3;
const MAX_API_PAGE_SIZE = 100;
const SSR_DEFAULT_PAGE_SIZE = 12; // Explicit default for SSR

// Local Storage Keys
const LS_SEARCH_QUERY_KEY = "productSearchQuery";
const LS_SELECTED_BRANDS_KEY = "productSelectedBrands";
const LS_SELECTED_CATEGORIES_KEY = "productSelectedCategories";
const LS_SELECTED_FUEL_TYPES_KEY = "productSelectedFuelTypes";

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
  if (newPageSize === 0) newPageSize = SSR_DEFAULT_PAGE_SIZE; // Fallback
  return Math.min(newPageSize, MAX_API_PAGE_SIZE);
};

// Helper to get a single string search param, or default (still needed for page/pageSize)
const getSearchParamString = (
  paramValue: string | string[] | undefined,
  defaultValue: string
): string => {
  return Array.isArray(paramValue)
    ? paramValue[0] || defaultValue
    : paramValue || defaultValue;
};

// --- Main Component ---
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Create a memoized signal for the search query from URL search params
  // This ensures reactivity for the queryKey when searchParams.q changes.
  const currentSearchQuery = createMemo(() => {
    const q = searchParams.q;
    const value = Array.isArray(q) ? q[0] : q;
    return value === "" ? undefined : value; // Return undefined if empty string to trigger re-fetch
  });

  // State for filters, initialized from localStorage
  const [selectedBrands, setSelectedBrands] = createSignal<string[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(LS_SELECTED_BRANDS_KEY) || "[]")
      : []
  );
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(LS_SELECTED_CATEGORIES_KEY) || "[]")
      : []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = createSignal<string[]>(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(LS_SELECTED_FUEL_TYPES_KEY) || "[]")
      : []
  );

  // Persist filter changes to localStorage
  createEffect(
    on(selectedBrands, (brands) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_SELECTED_BRANDS_KEY, JSON.stringify(brands));
      }
    })
  );
  createEffect(
    on(selectedCategories, (categories) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          LS_SELECTED_CATEGORIES_KEY,
          JSON.stringify(categories)
        );
      }
    })
  );
  createEffect(
    on(selectedFuelTypes, (fuelTypes) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          LS_SELECTED_FUEL_TYPES_KEY,
          JSON.stringify(fuelTypes)
        );
      }
    })
  );

  // Initialize currentCalculatedPageSize based on URL param or SSR default.
  // This value will be used for both SSR and initial client hydration.
  const initialPageSizeFromUrlOrSSR = createMemo(() => {
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
    return SSR_DEFAULT_PAGE_SIZE;
  });

  const [currentCalculatedPageSize, setCurrentCalculatedPageSize] =
    createSignal(initialPageSizeFromUrlOrSSR());

  // Effect to update currentCalculatedPageSize and URL param on client-side resize/mount
  createEffect(
    on(
      () => {
        // Only run on client
        if (typeof window === "undefined") return;
        return calculatePageSize();
      },
      (newCalculatedSize) => {
        if (newCalculatedSize === undefined) return; // Skip SSR run

        // If the client-calculated size is different from the current effective size (from URL or initial SSR)
        // then update the URL param and the signal.
        if (newCalculatedSize !== currentCalculatedPageSize()) {
          setCurrentCalculatedPageSize(newCalculatedSize);
          setSearchParams({
            ...searchParams,
            page: "1", // Reset to page 1 on page size change
            pageSize: newCalculatedSize.toString(),
          });
        }
      },
      { defer: true } // Defer this effect until after initial render/hydration
    )
  );

  // Attach resize listener
  onMount(() => {
    const handleResize = () => {
      // Trigger the effect by changing the window size, which will re-run calculatePageSize
      // The effect itself handles the update logic.
      // No direct signal update here, let the effect handle it.
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      onCleanup(() => window.removeEventListener("resize", handleResize));
    }
  });

  // Helper to build MeiliSearch filter string
  const buildFilterString = () => {
    const filters: string[] = [];
    if (selectedBrands().length > 0) {
      filters.push(
        `brand IN [${selectedBrands()
          .map((b) => `"${b}"`)
          .join(", ")}]`
      );
    }
    if (selectedCategories().length > 0) {
      filters.push(
        `category IN [${selectedCategories()
          .map((c) => `"${c}"`)
          .join(", ")}]`
      );
    }
    if (selectedFuelTypes().length > 0) {
      filters.push(
        `fuelType IN [${selectedFuelTypes()
          .map((f) => `"${f}"`)
          .join(", ")}]`
      );
    }
    return filters.join(" AND ");
  };

  // The pageSize signal now directly reflects the current calculated/URL-derived page size
  const pageSize = () => currentCalculatedPageSize();

  let baseUrl = "";
  if (import.meta.env.SSR && typeof window === "undefined") {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }

  // Signals for URL parameters
  const currentPage = () =>
    parseInt(getSearchParamString(searchParams.page, "1"), 10);

  // --- Data Fetching (Products) ---

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [
      string,
      {
        page: number;
        size: number;
        q?: string; // Make q optional in the function parameter type
        filter: string; // Add filter parameter
      }
    ];
  }): Promise<ApiResponse> => {
    const [_key, { page, size, q, filter }] = context.queryKey;
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", size.toString());
    if (q) params.append("q", q); // Only append if q is not undefined or empty string
    if (filter) params.append("filter", filter); // Add filter to params

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

  const productsQuery = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    readonly [
      string,
      {
        page: number;
        size: number;
        q?: string; // Make q optional in the queryKey type
        filter: string; // Add filter parameter
      }
    ]
  >(() => {
    return {
      queryKey: [
        PRODUCTS_QUERY_KEY_PREFIX,
        {
          page: currentPage(),
          size: pageSize(),
          q: currentSearchQuery(), // Use the memoized signal here
          filter: buildFilterString(), // Pass the filter string
        },
      ] as const,
      queryFn: fetchProductsQueryFn,
      staleTime: 5 * 60 * 1000, // Revert staleTime to 5 minutes
      keepPreviousData: true,
    };
  });

  // --- Data Fetching (Filter Options) ---
  const fetchFilterOptionsQueryFn =
    async (): Promise<FilterOptionsResponse> => {
      const fetchUrl = `${baseUrl}/api/filter-options`;
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      return response.json();
    };

  const filterOptionsQuery = useQuery<
    FilterOptionsResponse,
    Error,
    FilterOptionsResponse,
    readonly [string]
  >(() => ({
    queryKey: [FILTER_OPTIONS_QUERY_KEY] as const,
    queryFn: fetchFilterOptionsQueryFn,
    // Removed staleTime: Infinity to allow refetch to work correctly
    cacheTime: 0, // Set cacheTime to 0 to always refetch when triggered
    refetchOnWindowFocus: true, // Refetch on window focus to automatically update filters
    refetchOnMount: true, // Refetch on mount to ensure fresh data when navigating to the page
  }));

  // Memoized filter options to prevent unnecessary re-renders of For loops
  const availableBrands = createMemo(
    (prevBrands: { value: string; count: number }[] = []) => {
      const newFacets = filterOptionsQuery.data?.brand || {}; // Use filterOptionsQuery.data
      const newBrandEntries = Object.entries(newFacets);

      const prevBrandMap = new Map(prevBrands.map((b) => [b.value, b]));

      const stableBrands: { value: string; count: number }[] = [];
      for (const [value, count] of newBrandEntries) {
        const prevBrand = prevBrandMap.get(value);
        if (prevBrand && prevBrand.count === count) {
          stableBrands.push(prevBrand);
        } else {
          stableBrands.push({ value, count });
        }
      }
      return stableBrands;
    }
  );

  const availableCategories = createMemo(
    (prevCategories: { value: string; count: number }[] = []) => {
      const newFacets = filterOptionsQuery.data?.category || {}; // Use filterOptionsQuery.data
      const newCategoryEntries = Object.entries(newFacets);

      const prevCategoryMap = new Map(prevCategories.map((c) => [c.value, c]));

      const stableCategories: { value: string; count: number }[] = [];
      for (const [value, count] of newCategoryEntries) {
        const prevCategory = prevCategoryMap.get(value);
        if (prevCategory && prevCategory.count === count) {
          stableCategories.push(prevCategory);
        } else {
          stableCategories.push({ value, count });
        }
      }
      return stableCategories;
    }
  );

  const availableFuelTypes = createMemo(
    (prevFuelTypes: { value: string; count: number }[] = []) => {
      const newFacets = filterOptionsQuery.data?.fuelType || {}; // Use filterOptionsQuery.data
      const newFuelTypeEntries = Object.entries(newFacets);

      const prevFuelTypeMap = new Map(prevFuelTypes.map((f) => [f.value, f]));

      const stableFuelTypes: { value: string; count: number }[] = [];
      for (const [value, count] of newFuelTypeEntries) {
        const prevFuelType = prevFuelTypeMap.get(value);
        if (prevFuelType && prevFuelType.count === count) {
          stableFuelTypes.push(prevFuelType);
        } else {
          stableFuelTypes.push({ value, count });
        }
      }
      return stableFuelTypes;
    }
  );

  // Effect to clean up selected brands if they no longer exist in available options
  createEffect(
    on(
      [selectedBrands, availableBrands],
      ([currentSelected, currentAvailable]) => {
        const availableValues = new Set(currentAvailable.map((b) => b.value));
        const newSelected = currentSelected.filter((b) =>
          availableValues.has(b)
        );
        if (newSelected.length !== currentSelected.length) {
          setSelectedBrands(newSelected);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              LS_SELECTED_BRANDS_KEY,
              JSON.stringify(newSelected)
            );
          }
        }
      }
    )
  );

  // Effect to clean up selected categories if they no longer exist in available options
  createEffect(
    on(
      [selectedCategories, availableCategories],
      ([currentSelected, currentAvailable]) => {
        const availableValues = new Set(currentAvailable.map((c) => c.value));
        const newSelected = currentSelected.filter((c) =>
          availableValues.has(c)
        );
        if (newSelected.length !== currentSelected.length) {
          setSelectedCategories(newSelected);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              LS_SELECTED_CATEGORIES_KEY,
              JSON.stringify(newSelected)
            );
          }
        }
      }
    )
  );

  // Effect to clean up selected fuel types if they no longer exist in available options
  createEffect(
    on(
      [selectedFuelTypes, availableFuelTypes],
      ([currentSelected, currentAvailable]) => {
        const availableValues = new Set(currentAvailable.map((f) => f.value));
        const newSelected = currentSelected.filter((f) =>
          availableValues.has(f)
        );
        if (newSelected.length !== currentSelected.length) {
          setSelectedFuelTypes(newSelected);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              LS_SELECTED_FUEL_TYPES_KEY,
              JSON.stringify(newSelected)
            );
          }
        }
      }
    )
  );

  // --- Event Handlers ---

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...searchParams,
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefreshFilters = () => {
    filterOptionsQuery.refetch();
  };

  return (
    <MetaProvider>
      <main class="bg-white pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
          {/* SearchInput component is now in Nav.tsx, so remove it from here */}

          {/* Filter Section */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FilterDropdown
              title="Brand"
              options={availableBrands().map((b) => b.value)}
              selectedOptions={selectedBrands()}
              onSelect={(option) => {
                const newBrands = selectedBrands().includes(option)
                  ? selectedBrands().filter((b) => b !== option)
                  : [...selectedBrands(), option];
                setSelectedBrands(newBrands);
              }}
            />
            <FilterDropdown
              title="Category"
              options={availableCategories().map((c) => c.value)}
              selectedOptions={selectedCategories()}
              onSelect={(option) => {
                const newCategories = selectedCategories().includes(option)
                  ? selectedCategories().filter((c) => c !== option)
                  : [...selectedCategories(), option];
                setSelectedCategories(newCategories);
              }}
            />
            <FilterDropdown
              title="Fuel Type"
              options={availableFuelTypes().map((f) => f.value)}
              selectedOptions={selectedFuelTypes()}
              onSelect={(option) => {
                const newFuelTypes = selectedFuelTypes().includes(option)
                  ? selectedFuelTypes().filter((f) => f !== option)
                  : [...selectedFuelTypes(), option];
                setSelectedFuelTypes(newFuelTypes);
              }}
            />
          </div>

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
