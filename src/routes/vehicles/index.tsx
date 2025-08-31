// src/routes/vehicles/index.tsx
import { Suspense } from "solid-js";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
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
  data: Vehicle[];
  pagination: PaginationInfo;
  error?: string;
}

// Define a type for the transformed data, including pagination
interface TransformedApiResponse {
  data: VehicleWithPhotos[];
  pagination: PaginationInfo;
  error?: string;
}

const VEHICLES_QUERY_KEY_PREFIX = "vehicles_public";

export default function VehiclesPage() {
  const {
    searchQuery,
    selectedFilters,
    currentPage,
    setCurrentPage,
    sortOption,
  } = useSearch();

  const pageSize = () => 12; // Public page might show more items

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
      { page: number; size: number; q?: string; filter: string; sort: string }
    ];
  }): Promise<ApiResponse> => {
    const [_key, { page, size, q, filter, sort }] = context.queryKey;

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
    if (sort) params.append("sort", sort);

    const fetchUrl = `${baseUrl}/api/vehicles?${params.toString()}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  };

  const vehiclesQuery: UseQueryResult<TransformedApiResponse, Error> = useQuery<
    ApiResponse,
    Error,
    TransformedApiResponse,
    readonly [
      string,
      { page: number; size: number; q?: string; filter: string; sort: string }
    ]
  >(() => ({
    queryKey: [
      VEHICLES_QUERY_KEY_PREFIX,
      {
        page: currentPage(),
        size: pageSize(),
        q: searchQuery(),
        filter: buildFilterString(),
        sort: sortOption(),
      },
    ] as const,
    queryFn: fetchVehiclesQueryFn,
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
