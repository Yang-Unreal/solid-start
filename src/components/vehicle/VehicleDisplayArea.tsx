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

const SkeletonLoader = () => (
  <div class="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
    <div class="relative h-56 overflow-hidden bg-gray-200 animate-pulse" />
    <div class="p-4">
      <div class="h-6 w-3/4 rounded bg-gray-200 animate-pulse mb-2" />
      <div class="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
      <div class="mt-4 flex items-center justify-between">
        <div class="h-6 w-1/4 rounded bg-gray-200 animate-pulse" />
        <div class="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  </div>
);

export default function VehicleDisplayArea(props: {
  vehiclesQuery: UseQueryResult<TransformedApiResponse, Error>;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
  selectedFilters: Accessor<Record<string, string[]>>;
}) {
  const vehicles = () => props.vehiclesQuery.data?.data || [];
  const pagination = () => props.vehiclesQuery.data?.pagination;

  const Pagination = () => {
    const pag = pagination();
    if (!pag || pag.totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= pag.totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav class="flex items-center justify-center space-x-2 mt-12">
        <button
          onClick={() => props.setCurrentPage(props.currentPage() - 1)}
          disabled={props.currentPage() === 1}
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <For each={pageNumbers}>
          {(pageNumber) => (
            <button
              onClick={() => props.setCurrentPage(pageNumber)}
              class={`px-4 py-2 text-sm font-medium border rounded-md ${
                props.currentPage() === pageNumber
                  ? "bg-black text-white border-black"
                  : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              {pageNumber}
            </button>
          )}
        </For>
        <button
          onClick={() => props.setCurrentPage(props.currentPage() + 1)}
          disabled={props.currentPage() === pag.totalPages}
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    );
  };

  return (
    <div class="flex flex-col md:flex-row">
      <FilterSidebar show={Object.keys(props.selectedFilters()).length > 0} />
      <div class="flex-grow px-1.5 md:px-3">
        <Show
          when={!props.vehiclesQuery.isLoading}
          fallback={
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <For each={Array(8).fill(0)}>{() => <SkeletonLoader />}</For>
            </div>
          }
        >
          <Show
            when={vehicles().length > 0}
            fallback={
              <div class="flex flex-col items-center justify-center h-96">
                <p class="text-lg text-gray-600">No vehicles found.</p>
                <p class="text-sm text-gray-500">
                  Try adjusting your search or filters.
                </p>
              </div>
            }
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <For each={vehicles()}>
                {(vehicle) => <VehicleListItem vehicle={vehicle} />}
              </For>
            </div>
          </Show>
        </Show>
        <Pagination />
      </div>
    </div>
  );
}
