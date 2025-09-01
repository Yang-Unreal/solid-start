// src/routes/dashboard/vehicles.tsx
import { Suspense } from "solid-js";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import VehicleListDashboard from "~/components/vehicle/VehicleListDashboard";
import type { Vehicle, Photo } from "~/db/schema";
import { useSearch } from "~/context/SearchContext";

export type VehicleWithPhotos = Vehicle & { photos: Photo[] };

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
interface ApiResponse {
  data: VehicleWithPhotos[];
  pagination: PaginationInfo;
  error?: string;
}

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

const FIXED_PAGE_SIZE = 10;

export default function DashboardVehiclesPage() {
  const { searchQuery, selectedFilters, currentPage, setCurrentPage } =
    useSearch();
  const pageSize = () => FIXED_PAGE_SIZE;

  const buildFilterString = () => {
    const filters = selectedFilters();
    return Object.entries(filters)
      .filter(([, values]) => values.length > 0)
      .map(([name, values]) => {
        const quotedValues = values.map((v) => `"${v}"`).join(", ");
        return `${name} IN [${quotedValues}]`;
      })
      .join(" AND ");
  };

  const fetchVehiclesQueryFn = async (context: {
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

    const fetchUrl = `${baseUrl}/api/vehicles?${params.toString()}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  };

  const vehiclesQuery: UseQueryResult<ApiResponse, Error> = useQuery(() => ({
    queryKey: [
      VEHICLES_QUERY_KEY_PREFIX,
      {
        page: currentPage(),
        size: pageSize(),
        q: searchQuery(),
        filter: buildFilterString(),
      },
    ] as const,
    queryFn: fetchVehiclesQueryFn,
    staleTime: 30000, // 30 seconds stale time
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on mount to prevent hydration mismatch
    refetchOnWindowFocus: false, // Don't refetch on window focus
    keepPreviousData: true, // Keep previous data while loading
  }));

  return (
    <div class="">
      <div class="flex flex-col md:flex-row">
        {/* Main content area */}
        <Suspense>
          <div class="flex-grow px-1.5 md:px-3">
            <VehicleListDashboard
              vehiclesQuery={vehiclesQuery}
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
