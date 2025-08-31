import { A } from "@solidjs/router";
import type { VehicleWithPhotos } from "~/routes/vehicles";
import { Show } from "solid-js";

export default function VehicleListItem(props: { vehicle: VehicleWithPhotos }) {
  const firstPhotoUrl = () => {
    if (props.vehicle.photos && props.vehicle.photos.length > 0) {
      return props.vehicle.photos[0]?.photo_url;
    }
    return null;
  };

  return (
    <A
      href={`/vehicles/${props.vehicle.vehicle_id}`}
      class="group block overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out"
    >
      <div class="relative h-56 overflow-hidden">
        <Show
          when={firstPhotoUrl()}
          fallback={
            <div class="flex h-full w-full items-center justify-center bg-gray-100">
              <span class="text-sm text-gray-500">No Image Available</span>
            </div>
          }
        >
          <img
            src={firstPhotoUrl()!}
            alt={`${props.vehicle.brand} ${props.vehicle.model}`}
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </Show>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div class="absolute bottom-0 p-4">
          <h3 class="text-xl font-bold text-white">
            {props.vehicle.brand} {props.vehicle.model}
          </h3>
          <p class="text-sm text-gray-200">
            {props.vehicle.date_of_manufacture}
          </p>
        </div>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <p class="text-lg font-semibold text-gray-800">
            ${Number(props.vehicle.price).toLocaleString()}
          </p>
          <p class="text-sm font-medium text-gray-600">
            {props.vehicle.mileage.toLocaleString()} km
          </p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div class="flex items-center">
            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m0-10v2m0 6v2M6 12H4m16 0h-2m-10 0h2m6 0h2M9 15l-2 2m10-10l-2 2m0 6l2 2m-10-6l2-2"></path></svg>
            <span>{props.vehicle.horsepower} HP</span>
          </div>
          <div class="flex items-center">
            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            <span>{props.vehicle.transmission}</span>
          </div>
        </div>
      </div>
    </A>
  );
}