// src/components/VehicleTableRow.tsx
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { Pencil, Trash2, Square, CheckSquare } from "lucide-solid";
import type { Vehicle } from "~/db/schema";
import VehicleImage from "./VehicleImage";

interface VehicleTableRowProps {
	vehicle: Vehicle;
	isSelected: boolean;
	isDeleting: boolean;
	onToggleSelect: (id: string) => void;
	onDelete: (vehicle: Vehicle) => void;
}

const formatPrice = (price: number | null | undefined) => {
	if (price === null || price === undefined) return "N/A";
	return `$${price.toLocaleString("en-US")}`;
};

export default function VehicleTableRow(props: VehicleTableRowProps) {
	return (
		<tr>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
				<button
					onClick={() => props.onToggleSelect(props.vehicle.vehicle_id)}
					class="p-1 rounded-md text-black hover:bg-neutral-50 hover:text-neutral-800"
					aria-label={`Select ${props.vehicle.brand} ${props.vehicle.model}`}
				>
					<Show when={props.isSelected} fallback={<Square size={20} />}>
						<CheckSquare size={20} />
					</Show>
				</button>
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
				<VehicleImage
					vehicleId={props.vehicle.vehicle_id}
					index={0}
					size="thumbnail"
					alt={`${props.vehicle.brand} ${props.vehicle.model}`}
					class="h-10 w-16 rounded-md object-cover"
				/>
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
				<div>
					{props.vehicle.brand} {props.vehicle.model}
				</div>
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
				{props.vehicle.brand || "N/A"}
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
				{props.vehicle.model || "N/A"}
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
				{formatPrice(
					props.vehicle.price ? parseFloat(props.vehicle.price) : null,
				)}
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-black">
				{props.vehicle.mileage?.toLocaleString("en-US") || "N/A"}
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
				<A
					href={`/dashboard/vehicles/${props.vehicle.vehicle_id}/edit`}
					class="text-sky-600 hover:text-sky-900 mr-4"
				>
					<Pencil size={16} class="inline-block mr-1" />
					Edit
				</A>
				<button
					onClick={() => props.onDelete(props.vehicle)}
					disabled={props.isDeleting}
					class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Trash2 size={16} class="inline-block mr-1" />
					{props.isDeleting ? "Deleting..." : "Delete"}
				</button>
			</td>
		</tr>
	);
}
