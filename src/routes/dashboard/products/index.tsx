// src/routes/dashboard/products.tsx
import { Suspense } from "solid-js";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import ProductListDashboard from "~/components/product/ProductListDashboard";
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

const FIXED_PAGE_SIZE = 10;

export default function DashboardProductsPage() {
  const {
    searchQuery,
    selectedBrands,
    selectedCategories,
    selectedFuelTypes,
    currentPage,
    setCurrentPage,
  } = useSearch();
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
    if (!response.ok) throw new Error("Network response was not ok");
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
    keepPreviousData: true,
  }));

  return (
    <div class="">
      <div class="flex flex-col md:flex-row">
        {/* Main content area */}
        <Suspense>
          <div class="flex-grow px-1.5 md:px-3">
            <ProductListDashboard
              productsQuery={productsQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
