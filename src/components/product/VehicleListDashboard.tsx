// src/components/VehicleListDashboard.tsx
import { For, Show, createSignal, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import {
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/solid-query";
import type { Accessor, Setter } from "solid-js";
import {
  PlusCircle,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Square,
  CheckSquare,
} from "lucide-solid";
import type { Vehicle } from "~/db/schema";
import VehicleListItem from "./VehicleListItem";
import VehicleTableRow from "./VehicleTableRow";

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalVehicles: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
interface ApiResponse {
  data: Vehicle[];
  pagination: PaginationInfo;
  error?: string;
}

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

async function deleteVehicleApi(
  vehicleId: string
): Promise<{ message: string; vehicle: Vehicle }> {
  const response = await fetch(`/api/vehicles?id=${vehicleId}`, {
    method: "DELETE",
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).error || "Failed to delete vehicle"
    );
  return response.json();
}
async function bulkDeleteVehiclesApi(
  vehicleIds: string[]
): Promise<{ message: string; deletedIds: string[] }> {
  const response = await fetch("/api/vehicles/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: vehicleIds }),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).error || "Failed to bulk delete vehicles"
    );
  return response.json();
}

export default function VehicleListDashboard(props: {
  vehiclesQuery: UseQueryResult<ApiResponse, Error>;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
  pageSize: Accessor<number>;
}) {
  const tanstackQueryClient = useQueryClient();
  const [selectedVehicleIds, setSelectedVehicleIds] = createSignal<Set<string>>(
    new Set()
  );
  const [deleteError, setDeleteError] = createSignal<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = createSignal<
    string | null
  >(null);

  const vehicles = () => props.vehiclesQuery.data?.data || [];
  const pagination = () => props.vehiclesQuery.data?.pagination || null;

  const deleteVehicleMutation = useMutation(() => ({
    mutationFn: deleteVehicleApi,
    onSuccess: (data: { vehicle: Vehicle }) => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [VEHICLES_QUERY_KEY_PREFIX],
      });
      setShowSuccessMessage(
        `Vehicle "${data.vehicle.brand} ${data.vehicle.model}" deleted.`
      );
      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => setDeleteError(err.message),
  }));

  const bulkDeleteVehiclesMutation = useMutation(() => ({
    mutationFn: bulkDeleteVehiclesApi,
    onSuccess: (data: { deletedIds: string[] }) => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [VEHICLES_QUERY_KEY_PREFIX],
      });
      setSelectedVehicleIds(new Set<string>());
      setShowSuccessMessage(`${data.deletedIds.length} vehicles deleted.`);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => setDeleteError(err.message),
  }));

  const toggleVehicleSelection = (vehicleId: string) =>
    setSelectedVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  const isVehicleSelected = (vehicleId: string) =>
    selectedVehicleIds().has(vehicleId);
  const isAllSelected = createMemo(() => {
    const v = vehicles();
    return (
      v.length > 0 &&
      v.every((vehicle: Vehicle) =>
        selectedVehicleIds().has(vehicle.vehicle_id)
      )
    );
  });
  const toggleSelectAll = () => {
    if (isAllSelected()) {
      setSelectedVehicleIds(new Set<string>());
    } else {
      setSelectedVehicleIds(
        new Set(vehicles().map((v: Vehicle) => v.vehicle_id))
      );
    }
  };
  const handleDeleteVehicle = (vehicle: Vehicle) => {
    if (window.confirm(`Delete "${vehicle.brand} ${vehicle.model}"?`))
      deleteVehicleMutation.mutate(vehicle.vehicle_id);
  };
  const handleBulkDelete = () => {
    const ids = Array.from(selectedVehicleIds());
    if (ids.length > 0 && window.confirm(`Delete ${ids.length} vehicles?`))
      bulkDeleteVehiclesMutation.mutate(ids);
  };
  const handlePageChange = (newPage: number) => {
    props.setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const paginationButtonClasses = `h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-300 text-neutral-700 hover:bg-neutral-400 disabled:bg-neutral-200 disabled:text-neutral-500`;

  return (
    <div>
      <div class="flex justify-between items-center mb-4">
        <div class="w-full max-w-xs">
          <h2 class="text-2xl font-bold text-black">Vehicles List</h2>
        </div>
        <div class="flex items-center space-x-2">
          <A
            href="/dashboard/vehicles/new"
            class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800"
          >
            <PlusCircle size={18} class="mr-2" /> Add Vehicle
          </A>
          <Show when={selectedVehicleIds().size > 0}>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteVehiclesMutation.isPending}
              class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} class="mr-2" />{" "}
              {bulkDeleteVehiclesMutation.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedVehicleIds().size})`}
            </button>
          </Show>
        </div>
      </div>

      <Show when={showSuccessMessage()}>
        <div class="mb-4 p-3 rounded-md bg-green-100 text-green-700">
          {showSuccessMessage()}
        </div>
      </Show>
      <Show when={deleteError()}>
        <div class="mb-4 p-3 rounded-md bg-red-100 text-red-700">
          {deleteError()}
        </div>
      </Show>
      <Show when={props.vehiclesQuery.error}>
        <p class="text-red-500">Error: {props.vehiclesQuery.error?.message}</p>
      </Show>

      <div class="flex space-x-4">
        <div class="flex-1">
          <div class="block md:hidden space-y-3">
            <Show
              when={vehicles().length > 0}
              fallback={
                <p class="text-center text-neutral-700 py-10">
                  No vehicles found.
                </p>
              }
            >
              <For each={vehicles()}>
                {(vehicle) => (
                  <VehicleListItem
                    vehicle={vehicle}
                    isSelected={isVehicleSelected(vehicle.vehicle_id)}
                    isDeleting={false}
                    onToggleSelect={toggleVehicleSelection}
                    onDelete={handleDeleteVehicle}
                  />
                )}
              </For>
            </Show>
          </div>

          <div class="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg">
            <Show
              when={vehicles().length > 0}
              fallback={
                <p class="text-center text-neutral-700 py-10">
                  No vehicles found.
                </p>
              }
            >
              <table class="min-w-full divide-y divide-neutral-200">
                <thead class="bg-neutral-50">
                  <tr>
                    <th class="px-6 py-3 text-left">
                      <button onClick={toggleSelectAll} class="p-1 text-black">
                        <Show
                          when={isAllSelected()}
                          fallback={<Square size={20} />}
                        >
                          <CheckSquare size={20} />
                        </Show>
                      </button>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Mileage
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-neutral-200">
                  <For each={vehicles()}>
                    {(vehicle) => (
                      <VehicleTableRow
                        vehicle={vehicle}
                        isSelected={isVehicleSelected(vehicle.vehicle_id)}
                        isDeleting={
                          deleteVehicleMutation.isPending &&
                          deleteVehicleMutation.variables === vehicle.vehicle_id
                        }
                        onToggleSelect={toggleVehicleSelection}
                        onDelete={handleDeleteVehicle}
                      />
                    )}
                  </For>
                </tbody>
              </table>
            </Show>
          </div>
        </div>
      </div>

      <Show when={pagination() && pagination()!.totalPages > 1}>
        <div class="mt-4 flex flex-wrap justify-center items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination()!.currentPage === 1}
            class={paginationButtonClasses}
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage - 1)}
            disabled={!pagination()!.hasPreviousPage}
            class={paginationButtonClasses}
          >
            <ChevronLeft size={18} />
          </button>
          <span class="text-neutral-700 font-medium text-sm px-2 py-1">
            Page {pagination()!.currentPage} of {pagination()!.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage + 1)}
            disabled={!pagination()!.hasNextPage}
            class={paginationButtonClasses}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.totalPages)}
            disabled={pagination()!.currentPage === pagination()!.totalPages}
            class={paginationButtonClasses}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </Show>
    </div>
  );
}
