// src/components/vehicle/VehicleDisplayArea.tsx
import { For, Show, type Accessor, type Setter } from "solid-js";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { VehicleWithPhotos } from "~/routes/vehicles";
import VehicleListItem from "./VehicleListItem";
import FilterSidebar from "../filter/FilterSidebar";

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface TransformedApiResponse {
  data: VehicleWithPhotos[];
  pagination: PaginationInfo;
  error?: string;
}

export default function VehicleDisplayArea(props: {
  vehiclesQuery: UseQueryResult<TransformedApiResponse, Error>;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
}) {
  const vehicles = () => props.vehiclesQuery.data?.data || [];
  const pagination = () => props.vehiclesQuery.data?.pagination;

  return (
    <div class="flex flex-col md:flex-row">
      <FilterSidebar show={true} />
      <div class="flex-grow px-1.5 md:px-3">
        <Show
          when={!props.vehiclesQuery.isLoading}
          fallback={<div>Loading vehicles...</div>}
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <For each={vehicles()}>
              {(vehicle) => <VehicleListItem vehicle={vehicle} />}
            </For>
          </div>
        </Show>
        <div class="flex justify-center mt-8">
          <Show when={pagination() && pagination()!.totalPages > 1}>
            <nav class="flex items-center space-x-2">
              <button
                onClick={() => props.setCurrentPage(props.currentPage() - 1)}
                disabled={props.currentPage() === 1}
                class="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <For each={Array.from({ length: pagination()!.totalPages })}>
                {(_, i) => (
                  <button
                    onClick={() => props.setCurrentPage(i() + 1)}
                    class={`px-3 py-1 border rounded ${
                      props.currentPage() === i() + 1
                        ? "bg-black text-white"
                        : ""
                    }`}
                  >
                    {i() + 1}
                  </button>
                )}
              </For>
              <button
                onClick={() => props.setCurrentPage(props.currentPage() + 1)}
                disabled={props.currentPage() === pagination()!.totalPages}
                class="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </Show>
        </div>
      </div>
    </div>
  );
}
