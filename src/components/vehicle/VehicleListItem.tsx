// src/components/vehicle/VehicleListItem.tsx
import { A } from "@solidjs/router";
import type { VehicleWithPhotos } from "~/routes/vehicles";

export default function VehicleListItem(props: { vehicle: VehicleWithPhotos }) {
  // Get the first photo URL if available
  const firstPhotoUrl = () => {
    if (props.vehicle.photos && props.vehicle.photos.length > 0) {
      return props.vehicle.photos[0]?.photo_url;
    }
    return null;
  };

  return (
    <A
      href={`/vehicles/${props.vehicle.vehicle_id}`}
      class="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div class="h-48 overflow-hidden">
        {firstPhotoUrl() ? (
          <img
            src={firstPhotoUrl()!}
            alt={`${props.vehicle.brand} ${props.vehicle.model}`}
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div class="bg-gray-200 h-full flex items-center justify-center">
            <span class="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg">
          {props.vehicle.brand} {props.vehicle.model}
        </h3>
        <p class="text-gray-600">${props.vehicle.price}</p>
        <p class="text-sm text-gray-500 mt-1">
          {props.vehicle.date_of_manufacture}
        </p>
      </div>
    </A>
  );
}
