// src/routes/products/index.tsx
import {
  createSignal,
  createMemo,
} from "solid-js";
import { MetaProvider } from "@solidjs/meta";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import ProductDisplayArea from "~/components/ProductDisplayArea";
import type { Product } from "~/db/schema";
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

const PRODUCTS_QUERY_KEY_PREFIX = "products";
const FIXED_PAGE_SIZE = 30;

export default function ProductsPage() {
  const { searchQuery, selectedBrands, selectedCategories, selectedFuelTypes, showFilters } = useSearch();

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