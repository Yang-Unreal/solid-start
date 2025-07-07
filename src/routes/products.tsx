// src/routes/products/index.tsx
import { createSignal, onMount, createEffect, on, createMemo } from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import ProductDisplayArea from "~/components/ProductDisplayArea";
import FilterDropdown from "~/components/FilterDropdowns";
import type { Product } from "~/db/schema";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";

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
interface FilterOptionsResponse
  extends Record<string, Record<string, number>> {}

const PRODUCTS_QUERY_KEY_PREFIX = "products";
const FILTER_OPTIONS_QUERY_KEY = "filterOptions";
const FIXED_PAGE_SIZE = 30;

const LS_SELECTED_BRANDS_KEY = "productSelectedBrands";
const LS_SELECTED_CATEGORIES_KEY = "productSelectedCategories";
const LS_SELECTED_FUEL_TYPES_KEY = "productSelectedFuelTypes";

export default function ProductsPage() {
  const { searchQuery, onSearchChange } = useSearch();

  const [selectedBrands, setSelectedBrands] = createSignal<string[]>([]);
  const [selectedCategories, setSelectedCategories] = createSignal<string[]>(
    []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = createSignal<string[]>([]);

  onMount(() => {
    setSelectedBrands(
      JSON.parse(localStorage.getItem(LS_SELECTED_BRANDS_KEY) || "[]")
    );
    setSelectedCategories(
      JSON.parse(localStorage.getItem(LS_SELECTED_CATEGORIES_KEY) || "[]")
    );
    setSelectedFuelTypes(
      JSON.parse(localStorage.getItem(LS_SELECTED_FUEL_TYPES_KEY) || "[]")
    );
  });

  createEffect(
    on(selectedBrands, (brands) => {
      if (typeof window !== "undefined")
        localStorage.setItem(LS_SELECTED_BRANDS_KEY, JSON.stringify(brands));
    })
  );
  createEffect(
    on(selectedCategories, (categories) => {
      if (typeof window !== "undefined")
        localStorage.setItem(
          LS_SELECTED_CATEGORIES_KEY,
          JSON.stringify(categories)
        );
    })
  );
  createEffect(
    on(selectedFuelTypes, (fuelTypes) => {
      if (typeof window !== "undefined")
        localStorage.setItem(
          LS_SELECTED_FUEL_TYPES_KEY,
          JSON.stringify(fuelTypes)
        );
    })
  );

  const [currentPage, setCurrentPage] = createSignal(1);
  const pageSize = () => FIXED_PAGE_SIZE;

  const buildFilterString = () => {
    const filters: string[] = [];
    if (selectedBrands().length > 0)
      filters.push(
        `brand IN [${selectedBrands()
          .map((b) => `"${b}"`)
          .join(", ")}]`
      );
    if (selectedCategories().length > 0)
      filters.push(
        `category IN [${selectedCategories()
          .map((c) => `"${c}"`)
          .join(", ")}]`
      );
    if (selectedFuelTypes().length > 0)
      filters.push(
        `fuelType IN [${selectedFuelTypes()
          .map((f) => `"${f}"`)
          .join(", ")}]`
      );
    return filters.join(" AND ");
  };

  const fetchProductsQueryFn = async (context: {
    queryKey: readonly [
      string,
      { page: number; size: number; q?: string; filter: string }
    ];
  }): Promise<ApiResponse> => {
    const [_key, { page, size, q, filter }] = context.queryKey;
    let baseUrl = "";
    if (import.meta.env.SSR) {
      baseUrl =
        import.meta.env.VITE_INTERNAL_API_ORIGIN ||
        `http://localhost:${process.env.PORT || 3000}`;
    }
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: size.toString(),
    });
    if (q) params.append("q", q);
    if (filter) params.append("filter", filter);
    const fetchUrl = `${baseUrl}/api/products?${params.toString()}`;
    const response = await fetch(fetchUrl);
    if (!response.ok)
      throw new Error((await response.json()).error || `HTTP error!`);
    return response.json();
  };

  const productsQuery: UseQueryResult<ApiResponse, Error> = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    readonly [
      string,
      { page: number; size: number; q?: string; filter: string }
    ]
  >(() => ({
    queryKey: [
      PRODUCTS_QUERY_KEY_PREFIX,
      {
        page: currentPage(),
        size: pageSize(),
        q: searchQuery(),
        filter: buildFilterString(),
      },
    ] as const,
    queryFn: fetchProductsQueryFn,
    staleTime: 10 * 1000,
    keepPreviousData: true,
  }));

  const fetchFilterOptionsQueryFn =
    async (): Promise<FilterOptionsResponse> => {
      let baseUrl = "";
      if (import.meta.env.SSR) {
        baseUrl =
          import.meta.env.VITE_INTERNAL_API_ORIGIN ||
          `http://localhost:${process.env.PORT || 3000}`;
      }
      const fetchUrl = `${baseUrl}/api/filter-options`;
      const response = await fetch(fetchUrl);
      if (!response.ok)
        throw new Error((await response.json()).error || `HTTP error!`);
      return response.json();
    };

  const filterOptionsQuery = useQuery<FilterOptionsResponse, Error>(() => ({
    queryKey: [FILTER_OPTIONS_QUERY_KEY] as const,
    queryFn: fetchFilterOptionsQueryFn,
    staleTime: 10 * 1000,
  }));

  const availableBrands = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.brand || {}).map(
      ([value, count]) => ({ value, count })
    )
  );
  const availableCategories = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.category || {}).map(
      ([value, count]) => ({ value, count })
    )
  );
  const availableFuelTypes = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.fuelType || {}).map(
      ([value, count]) => ({ value, count })
    )
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MetaProvider>
      <main class="pt-24 bg-white px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 min-h-screen">
        <div class="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
          <div class="mb-6">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
          </div>
          <div class="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FilterDropdown
              title="Brand"
              options={availableBrands().map((b) => b.value)}
              selectedOptions={selectedBrands()}
              onSelect={(option) =>
                setSelectedBrands((prev) =>
                  prev.includes(option)
                    ? prev.filter((b) => b !== option)
                    : [...prev, option]
                )
              }
            />
            <FilterDropdown
              title="Category"
              options={availableCategories().map((c) => c.value)}
              selectedOptions={selectedCategories()}
              onSelect={(option) =>
                setSelectedCategories((prev) =>
                  prev.includes(option)
                    ? prev.filter((c) => c !== option)
                    : [...prev, option]
                )
              }
            />
            <FilterDropdown
              title="Fuel Type"
              options={availableFuelTypes().map((f) => f.value)}
              selectedOptions={selectedFuelTypes()}
              onSelect={(option) =>
                setSelectedFuelTypes((prev) =>
                  prev.includes(option)
                    ? prev.filter((f) => f !== option)
                    : [...prev, option]
                )
              }
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
}
