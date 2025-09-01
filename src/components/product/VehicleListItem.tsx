// src/components/VehicleListItem.tsx
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { Pencil, Trash2, Square, CheckSquare } from "lucide-solid";
import type { Vehicle } from "~/db/schema";
import VehicleImage from "./VehicleImage";

interface VehicleListItemProps {
  vehicle: Vehicle;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const formatPrice = (price: string | number | null | undefined) => {
  if (price === null || price === undefined) return "N/A";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "N/A";
  return `${numPrice.toLocaleString("en-US")}`;
};

export default function VehicleListItem(props: VehicleListItemProps) {
  return (
    <div class="bg-white rounded-lg shadow p-3 flex items-center space-x-4">
      <div class="flex-shrink-0">
        <button
          onClick={() => props.onToggleSelect(props.vehicle.vehicle_id)}
          class="p-1 rounded-md text-black hover:bg-neutral-50 hover:text-neutral-800"
          aria-label={`Select ${props.vehicle.brand} ${props.vehicle.model}`}
        >
          <Show when={props.isSelected} fallback={<Square size={20} />}>
            <CheckSquare size={20} />
          </Show>
        </button>
      </div>
      <A
        href={`/vehicles/${props.vehicle.vehicle_id}`}
        class="flex-1 min-w-0 flex items-center space-x-4 group"
      >
        <div class="flex-shrink-0 w-24">
          <VehicleImage
            vehicleId={props.vehicle.vehicle_id}
            index={0}
            size="thumbnail"
            alt={`${props.vehicle.brand} ${props.vehicle.model}`}
            class="w-24 h-16 rounded-md object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-black truncate group-hover:text-indigo-600 transition-colors duration-200">
            {props.vehicle.brand} {props.vehicle.model}
          </p>
          <p class="text-sm font-semibold text-black mt-1">
            ${formatPrice(props.vehicle.price)}
          </p>
          <p class="text-xs text-black mt-1">
            Mileage: {props.vehicle.mileage?.toLocaleString("en-US") || "N/A"}{" "}
            km
          </p>
        </div>
      </A>
      <div class="flex flex-col items-center space-y-2">
        <A
          href={`/dashboard/vehicles/${props.vehicle.vehicle_id}/edit`}
          class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
          aria-label={`Edit ${props.vehicle.brand} ${props.vehicle.model}`}
        >
          <Pencil size={18} />
        </A>
        <button
          onClick={() => props.onDelete(props.vehicle)}
          disabled={props.isDeleting}
          class="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
          aria-label={`Delete ${props.vehicle.brand} ${props.vehicle.model}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
