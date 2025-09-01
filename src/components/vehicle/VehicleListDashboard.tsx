import {
  createSignal,
  For,
  Show,
  type Accessor,
  type Setter,
  type Resource,
} from "solid-js";
import {
  useQueryClient,
  useMutation,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/solid-query";
import { A } from "@solidjs/router";
import VehicleTableRow from "~/components/vehicle/VehicleTableRow";
import type { Vehicle } from "~/db/schema";
import type { VehicleWithPhotos } from "~/routes/dashboard/vehicles/index";

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

async function deleteVehicleApi(
  vehicleId: number
): Promise<{ message: string; vehicle: Vehicle }> {
  const response = await fetch(`/api/vehicles?id=${vehicleId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(
      (await response.json()).error || "Failed to delete vehicle"
    );
  }
  return response.json();
}

async function bulkDeleteVehiclesApi(
  vehicleIds: number[]
): Promise<{ message: string; deletedCount: number }> {
  const response = await fetch("/api/vehicles/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: vehicleIds }),
  });
  if (!response.ok) {
    throw new Error(
      (await response.json()).error || "Failed to bulk delete vehicles"
    );
  }
  return response.json();
}

export default function VehicleListDashboard(props: {
  vehiclesQuery: UseQueryResult<ApiResponse, Error>;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
  pageSize: Accessor<number>;
}) {
  const tanstackQueryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = createSignal<number[]>([]);
  const [isDeleting, setIsDeleting] = createSignal(false);

  const vehicles = () => {
    const data = props.vehiclesQuery.data?.data;
    return Array.isArray(data) ? data : [];
  };
  const pagination = () => props.vehiclesQuery.data?.pagination || null;

  const deleteMutation = useMutation(() => ({
    mutationFn: deleteVehicleApi,
    onSuccess: (data: { vehicle: Vehicle }) => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [VEHICLES_QUERY_KEY_PREFIX],
      });
      setSelectedIds((prev) =>
        prev.filter((id) => id !== data.vehicle.vehicle_id)
      );
    },
    onError: (error: Error) => {
      console.error("Error deleting vehicle:", error);
      alert(`Error: ${error.message}`);
    },
  }));

  const bulkDeleteMutation = useMutation(() => ({
    mutationFn: bulkDeleteVehiclesApi,
    onSuccess: () => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [VEHICLES_QUERY_KEY_PREFIX],
      });
      setSelectedIds([]);
    },
    onError: (error: Error) => {
      console.error("Error bulk deleting vehicles:", error);
      alert(`Error: ${error.message}`);
    },
  }));

  const handleDelete = async (vehicle: VehicleWithPhotos) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${vehicle.brand} ${vehicle.model}?`
      )
    ) {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(vehicle.vehicle_id);
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      selectedIds().length > 0 &&
      window.confirm(
        `Are you sure you want to delete ${
          selectedIds().length
        } selected vehicles?`
      )
    ) {
      setIsDeleting(true);
      await bulkDeleteMutation.mutateAsync(selectedIds());
      setIsDeleting(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds().length === vehicles().length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(vehicles().map((v) => v.vehicle_id));
    }
  };

  return (
    <div class="bg-white p-2 sm:p-4 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-xl sm:text-2xl font-bold">Vehicles</h1>
        <A
          href="/dashboard/vehicles/new"
          class="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Add Vehicle
        </A>
      </div>
      <div class="mb-4 flex items-center">
        <button
          onClick={handleBulkDelete}
          disabled={selectedIds().length === 0 || isDeleting()}
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          Delete Selected ({selectedIds().length})
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    vehicles().length > 0 &&
                    selectedIds().length === vehicles().length
                  }
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand & Model
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <Show
              when={!props.vehiclesQuery.isLoading}
              fallback={
                <tr>
                  <td colspan="6" class="text-center py-4">
                    Loading...
                  </td>
                </tr>
              }
            >
              <For each={vehicles()}>
                {(vehicle, index) => (
                  <VehicleTableRow
                    vehicle={vehicle}
                    isSelected={selectedIds().includes(vehicle.vehicle_id)}
                    onToggleSelect={toggleSelect}
                    onDelete={handleDelete}
                    isDeleting={isDeleting()}
                  />
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
