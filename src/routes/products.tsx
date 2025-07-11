// src/routes/products/index.tsx
import {
  createSignal,
  onMount,
  createEffect,
  on,
  createMemo,
  Show,
} from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import ProductDisplayArea from "~/components/ProductDisplayArea";
import FilterDropdown from "~/components/FilterDropdowns";
import type { Product } from "~/db/schema";
import { useSearch } from "~/context/SearchContext";
import { SlidersHorizontal, ArrowLeftToLine } from "lucide-solid";
import MagneticLink from "~/components/MagneticLink";

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

export default function ProductsPage() {
  const { searchQuery, selectedBrands, setSelectedBrands, selectedCategories, setSelectedCategories, selectedFuelTypes, setSelectedFuelTypes, showFilters, setShowFilters } = useSearch();

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
      <main class="pt-24 bg-white  pb-4 sm:pb-6  lg:pb-8 min-h-screen container-padding">
        <div class="mx-auto w-full max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none">
          <div
            class={`flex flex-col md:flex-row ${showFilters() ? "md:gap-8" : ""}`}>
            {/* Filter Sidebar */}
            <Show when={showFilters()}>
              <div
                class={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${showFilters() ? "w-full md:w-80" : "w-0"}`}>
                <div class="flex flex-col space-y-2">
                  <div class="h-[0.5px] bg-gray-300 w-full"></div>
                  <FilterDropdown
                    title="Brand"
                    options={availableBrands().map((b) => b.value)}
                    selectedOptions={selectedBrands()}
                    onSelect={(option) =>
                      setSelectedBrands(
                        selectedBrands().includes(option)
                          ? selectedBrands().filter((b) => b !== option)
                          : [...selectedBrands(), option]
                      )
                    }
                  />
                  <div class="h-[0.5px] bg-gray-300 w-full"></div>
                  <FilterDropdown
                    title="Category"
                    options={availableCategories().map((c) => c.value)}
                    selectedOptions={selectedCategories()}
                    onSelect={(option) =>
                      setSelectedCategories(
                        selectedCategories().includes(option)
                          ? selectedCategories().filter((c) => c !== option)
                          : [...selectedCategories(), option]
                      )
                    }
                  />
                  <div class="h-[0.5px] bg-gray-300 w-full"></div>
                  <FilterDropdown
                    title="Fuel Type"
                    options={availableFuelTypes().map((f) => f.value)}
                    selectedOptions={selectedFuelTypes()}
                    onSelect={(option) =>
                      setSelectedFuelTypes(
                        selectedFuelTypes().includes(option)
                          ? selectedFuelTypes().filter((f) => f !== option)
                          : [...selectedFuelTypes(), option]
                      )
                    }
                  />
                </div>
              </div>
            </Show>

            {/* Main content area */}
            <div class="flex-grow">
              <ProductDisplayArea
                productsQuery={productsQuery}
                handlePageChange={handlePageChange}
                pageSize={pageSize}
                showFilters={showFilters()}
              />
            </div>
          </div>
        </div>
      </main>
    </MetaProvider>
  );
}
