// src/routes/vehicles/index.tsx
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import { useSearch } from "~/context/SearchContext";
import type { Vehicle, Photo } from "~/db/schema";
import VehicleDisplayArea from "~/components/vehicle/VehicleDisplayArea";

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

  const res = await fetch(`/api/vehicles?${params.toString()}`);
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
    keepPreviousData: true,
  }));

  return (
    <div class="bg-white">
      <main>
        <div class="pt-24">
          <VehicleDisplayArea
            vehiclesQuery={vehiclesQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </main>
    </div>
  );
}
