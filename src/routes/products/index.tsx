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
import { useSearchParams } from "@solidjs/router"; // Still needed for 'q' param
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
}

// New type for filter options API response
interface FilterOptionsResponse
  extends Record<string, Record<string, number>> {}

// --- Constants ---
const PRODUCTS_QUERY_KEY_PREFIX = "products";
const FILTER_OPTIONS_QUERY_KEY = "filterOptions";
const FIXED_PAGE_SIZE = 50; // Fixed page size as requested

// Local Storage Keys
const LS_SEARCH_QUERY_KEY = "productSearchQuery";
const LS_SELECTED_BRANDS_KEY = "productSelectedBrands";
const LS_SELECTED_CATEGORIES_KEY = "productSelectedCategories";
const LS_SELECTED_FUEL_TYPES_KEY = "productSelectedFuelTypes";

// Helper to get a single string search param, or default (only for 'q' now)
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

  // Internal state for current page, not tied to URL
  const [currentPage, setCurrentPage] = createSignal(1);
  const pageSize = () => FIXED_PAGE_SIZE; // Fixed page size

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

  let baseUrl = "";
  if (import.meta.env.SSR && typeof window === "undefined") {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }

  // --- Data Fetching (Products) ---

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [
      string,
      {
        page: number; // Page is now internal, but still passed to API
        size: number; // Size is now fixed, but still passed to API
        q?: string;
        filter: string;
      }
    ];
  }): Promise<ApiResponse> => {
    const [_key, { page, size, q, filter }] = context.queryKey;
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", size.toString());
    if (q) params.append("q", q);
    if (filter) params.append("filter", filter);

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
        q?: string;
        filter: string;
      }
    ]
  >(() => {
    return {
      queryKey: [
        PRODUCTS_QUERY_KEY_PREFIX,
        {
          page: currentPage(), // Use internal currentPage signal
          size: pageSize(), // Use fixed pageSize
          q: currentSearchQuery(),
          filter: buildFilterString(),
        },
      ] as const,
      queryFn: fetchProductsQueryFn,
      staleTime: 5 * 60 * 1000,
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
    cacheTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  }));

  // Memoized filter options to prevent unnecessary re-renders of For loops
  const availableBrands = createMemo(
    (prevBrands: { value: string; count: number }[] = []) => {
      const newFacets = filterOptionsQuery.data?.brand || {};
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
      const newFacets = filterOptionsQuery.data?.category || {};
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
      const newFacets = filterOptionsQuery.data?.fuelType || {};
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
    setCurrentPage(newPage); // Update internal page signal
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
