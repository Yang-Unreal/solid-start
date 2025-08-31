import { A } from "@solidjs/router";
import type { Vehicle, Photo } from "~/db/schema";
import VehicleImage from "~/components/vehicle/VehicleImage";

type VehicleWithRelations = Vehicle & {
  photos: Photo[];
};

interface VehicleTableRowProps {
  vehicle: VehicleWithRelations;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDelete: (vehicle: VehicleWithRelations) => void;
  isDeleting: boolean;
}

export default function VehicleTableRow(props: VehicleTableRowProps) {
  return (
    <tr class={`hover:bg-gray-50 ${props.isSelected ? "bg-blue-50" : ""}`}>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => props.onToggleSelect(props.vehicle.vehicle_id)}
        />
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <VehicleImage
          photoUrl={props.vehicle.photos?.[0]?.photo_url}
          alt={props.vehicle.model}
          class="h-10 w-16 rounded-md object-cover"
        />
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {props.vehicle.brand} {props.vehicle.model}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${props.vehicle.price}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {props.vehicle.date_of_manufacture}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <A
          href={`/dashboard/vehicles/${props.vehicle.vehicle_id}/edit`}
          class="text-indigo-600 hover:text-indigo-900"
        >
          Edit
        </A>
        <button
          onClick={() => props.onDelete(props.vehicle)}
          disabled={props.isDeleting}
          class="text-red-600 hover:text-red-900 ml-4 disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
