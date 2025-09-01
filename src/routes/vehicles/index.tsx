// src/routes/vehicles/index.tsx
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { isServer, getRequestEvent } from "solid-js/web";
import { useSearch } from "~/context/SearchContext";
import type { Vehicle, Photo } from "~/db/schema";
import VehicleDisplayArea from "~/components/vehicle/VehicleDisplayArea";

interface FilterOptionsResponse
  extends Record<string, Record<string, number>> {}

const FILTER_OPTIONS_QUERY_KEY = "filterOptions";

const fetchFilterOptionsQueryFn = async (): Promise<FilterOptionsResponse> => {
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

const fetchVehicles = async (
  page = 1,
  pageSize = 12,
  q = "",
  filter = "",
  sort = "vehicle_id:asc"
): Promise<ApiResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    q,
    filter,
    sort,
  });

  const baseUrl = isServer
    ? new URL(getRequestEvent()!.request.url).origin
    : "";
  const res = await fetch(`${baseUrl}/api/vehicles?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch vehicles");
  }
  const data = await res.json();
  return data as ApiResponse;
};

export default function VehiclesPage() {
  const {
    searchQuery,
    selectedFilters,
    currentPage,
    setCurrentPage,
    sortOption,
  } = useSearch();

  const pageSize = () => 12;

  const filterOptionsQuery = useQuery<FilterOptionsResponse, Error>(() => ({
    queryKey: [FILTER_OPTIONS_QUERY_KEY] as const,
    queryFn: fetchFilterOptionsQueryFn,
    staleTime: 10 * 1000,
  }));

  const buildFilterString = () => {
    // Temporarily disabled for testing - always show all vehicles
    return "";
  };

  const vehiclesQuery: UseQueryResult<ApiResponse, Error> = useQuery<
    ApiResponse,
    Error
  >(() => ({
    queryKey: [
      "vehicles",
      currentPage(),
      pageSize(),
      searchQuery(),
      buildFilterString(),
      sortOption(),
    ],
    queryFn: () =>
      fetchVehicles(
        currentPage(),
        pageSize(),
        searchQuery(),
        buildFilterString(),
        sortOption()
      ),
    keepPreviousData: false,
  }));

  return (
    <div class="bg-white">
      <main>
        <div class="pt-24">
          <VehicleDisplayArea
            vehiclesQuery={vehiclesQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedFilters={selectedFilters}
          />
        </div>
      </main>
    </div>
  );
}
