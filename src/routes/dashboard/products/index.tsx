// src/routes/dashboard/products.tsx
import ProductListDashboard from "~/components/ProductListDashboard";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import {
  createSignal,
  type Accessor,
  type Setter,
  createMemo,
  Suspense,
} from "solid-js";
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
const FIXED_PAGE_SIZE = 10;

const fetchProductsQueryFn = async (context: {
  queryKey: readonly [string, { page: number; size: number; q?: string }];
}): Promise<ApiResponse> => {
  const [_key, { page, size, q }] = context.queryKey;

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

  const fetchUrl = `${baseUrl}/api/products?${params.toString()}`;
  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export default function DashboardProductsPage() {
  const { searchQuery, onSearchChange } = useSearch();

  const [currentPage, setCurrentPage] = createSignal(1);
  const pageSize = () => FIXED_PAGE_SIZE;

  const productsQuery: UseQueryResult<ApiResponse, Error> = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    readonly [string, { page: number; size: number; q?: string }]
  >(() => ({
    queryKey: [
      PRODUCTS_QUERY_KEY_PREFIX,
      { page: currentPage(), size: pageSize(), q: searchQuery() },
    ] as const,
    queryFn: fetchProductsQueryFn,
    keepPreviousData: true,
  }));

  const MemoizedSearchInput = createMemo(() => (
    <div class="flex justify-start items-center mb-4 space-x-4 px-4">
      <div class="flex-1">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  ));

  return (
    <div class="p-4">
      {MemoizedSearchInput()}
      <Suspense>
        <ProductListDashboard
          productsQuery={productsQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
