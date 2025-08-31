// src/components/vehicle/VehicleListItem.tsx
import { A } from "@solidjs/router";
import type { VehicleWithPhotos } from "~/routes/vehicles";

export default function VehicleListItem(props: { vehicle: VehicleWithPhotos }) {
  return (
    <A
      href={`/vehicles/${props.vehicle.vehicle_id}`}
      class="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div class="bg-gray-200 h-48 flex items-center justify-center">
        <span class="text-gray-500">Image Placeholder</span>
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg">
          {props.vehicle.brand} {props.vehicle.model}
        </h3>
        <p class="text-gray-600">${props.vehicle.price}</p>
      </div>
    </A>
  );
}
