import { For, Show, createResource, createSignal } from "solid-js";
import HoverableButton from "~/components/HoverableButton";
import { useParams, A } from "@solidjs/router";
import { type Vehicle, type Photo } from "~/db/schema";
import VehicleImage from "~/components/product/VehicleImage";

interface FullVehicleData extends Vehicle {
  photos: Photo[];
  gasoline_powertrain?: any;
  electric_powertrain?: any;
  hybrid_powertrain?: any;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = () => params.id;

  const [vehicleData] = createResource(vehicleId, async (id) => {
    if (!id) {
      return null;
    }

    let baseUrl = "";
    if (import.meta.env.SSR) {
      baseUrl =
        import.meta.env.VITE_INTERNAL_API_ORIGIN ||
        `http://localhost:${process.env.PORT || 3000}`;
    }
    const fetchUrl = `${baseUrl}/api/vehicles?id=${id}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch vehicle");
    }
    const result = await response.json();
    return result.data[0] as FullVehicleData;
  });

  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);

  return (
    <main class="min-h-screen container-padding pt-25">
      <div class="px-1.5 md:px-3">
        <div class="flex items-center justify-between mb-8">
          <A
            href="/vehicles"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            ← Back to Vehicles
          </A>
          <h1 class="text-center font-extrabold text-3xl md:text-5xl">
            VEHICLE DETAIL
          </h1>
          <div></div> {/* Spacer for centering */}
        </div>
        <div class="h-[1px] bg-gray-300 w-full mb-5"></div>
        <Show when={vehicleData()} fallback={<p>Vehicle not found.</p>}>
          {(v) => (
            <div class="md:flex md:space-x-8">
              <div class="md:w-3/5 flex flex-col">
                {/* Main Image */}
                <div class="relative aspect-video overflow-hidden">
                  <VehicleImage
                    vehicleId={v().vehicle_id}
                    index={currentImageIndex()}
                    size="detail"
                    alt={`${v().brand} ${v().model}`}
                    class="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {/* Thumbnails */}
                <div class="mt-4 grid grid-cols-6 gap-2">
                  <For
                    each={v()
                      .photos?.filter((p) => p.photo_url !== null)
                      .sort(
                        (a, b) =>
                          (a.display_order ?? 0) - (b.display_order ?? 0)
                      )}
                  >
                    {(photo, index) => (
                      <img
                        src={photo.photo_url!}
                        alt={`photo ${index()}`}
                        class="w-full h-auto cursor-pointer"
                        onClick={() => setCurrentImageIndex(index())}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Vehicle Details (Right Column) */}
              <div class="w-full md:w-2/5 mt-8 md:mt-0">
                <h1 class="text-3xl font-bold text-gray-900">
                  {v().brand} {v().model}
                </h1>
                <p class="mt-2 text-xl text-gray-700">
                  $
                  {(() => {
                    const price = v().price;
                    if (
                      price &&
                      typeof price === "string" &&
                      !isNaN(parseFloat(price))
                    ) {
                      return parseFloat(price).toLocaleString("en-US");
                    }
                    return "Price not available";
                  })()}
                </p>

                <div class="mt-10 border-t border-gray-200 pt-8">
                  <h2 class="text-xl font-semibold text-gray-800">
                    Vehicle Details
                  </h2>
                  <ul class="mt-4 text-gray-700 space-y-2">
                    <li>
                      <strong>Brand:</strong> {v().brand || "N/A"}
                    </li>
                    <li>
                      <strong>Model:</strong> {v().model || "N/A"}
                    </li>
                    <li>
                      <strong>Year:</strong> {v().date_of_manufacture || "N/A"}
                    </li>
                    <li>
                      <strong>Mileage:</strong>{" "}
                      {v().mileage
                        ? Number(v().mileage).toLocaleString("en-US")
                        : "N/A"}{" "}
                      km
                    </li>
                    <li>
                      <strong>Horsepower:</strong> {v().horsepower || "N/A"} hp
                    </li>
                    <li>
                      <strong>Top Speed:</strong> {v().top_speed_kph || "N/A"}{" "}
                      kph
                    </li>
                    <li>
                      <strong>0-100km/h:</strong>{" "}
                      {v().acceleration_0_100_sec || "N/A"}s
                    </li>
                    <li>
                      <strong>Transmission:</strong> {v().transmission || "N/A"}
                    </li>
                    <li>
                      <strong>Weight:</strong> {v().weight_kg || "N/A"} kg
                    </li>
                    <li>
                      <strong>Exterior:</strong> {v().exterior || "N/A"}
                    </li>
                    <li>
                      <strong>Interior:</strong> {v().interior || "N/A"}
                    </li>
                    <li>
                      <strong>Seating:</strong> {v().seating || "N/A"}
                    </li>
                    <li>
                      <strong>Warranty:</strong> {v().warranty || "N/A"}
                    </li>
                    <li>
                      <strong>Maintenance Booklet:</strong>{" "}
                      {v().maintenance_booklet ? "Yes" : "No"}
                    </li>
                  </ul>
                </div>

                {/* Powertrain Details */}
                <Show when={v().powertrain_type}>
                  <div class="mt-10 border-t border-gray-200 pt-8">
                    <h2 class="text-xl font-semibold text-gray-800">
                      Powertrain Details
                    </h2>
                    <ul class="mt-4 text-gray-700 space-y-2">
                      <li>
                        <strong>Powertrain Type:</strong> {v().powertrain_type}
                      </li>
                      <Show
                        when={
                          v().powertrain_type === "Gasoline" &&
                          v().gasoline_powertrain
                        }
                      >
                        <li>
                          <strong>Cylinder Amount:</strong>{" "}
                          {v().gasoline_powertrain?.cylinder_amount || "N/A"}
                        </li>
                        <li>
                          <strong>Cylinder Capacity:</strong>{" "}
                          {v().gasoline_powertrain?.cylinder_capacity_cc ||
                            "N/A"}{" "}
                          cc
                        </li>
                        <li>
                          <strong>Fuel Type:</strong>{" "}
                          {v().gasoline_powertrain?.fuel_type || "N/A"}
                        </li>
                      </Show>
                      <Show
                        when={
                          v().powertrain_type === "Electric" &&
                          v().electric_powertrain
                        }
                      >
                        <li>
                          <strong>Battery Capacity:</strong>{" "}
                          {v().electric_powertrain?.battery_capacity_kwh
                            ? parseFloat(
                                v().electric_powertrain.battery_capacity_kwh
                              ).toLocaleString("en-US")
                            : "N/A"}{" "}
                          kWh
                        </li>
                        <li>
                          <strong>Electric Range:</strong>{" "}
                          {v().electric_powertrain?.electric_range_km || "N/A"}{" "}
                          km
                        </li>
                      </Show>
                      <Show
                        when={
                          v().powertrain_type === "Hybrid" &&
                          v().hybrid_powertrain
                        }
                      >
                        <li>
                          <strong>Electric Motor Power:</strong>{" "}
                          {v().hybrid_powertrain?.electric_motor_power_kw ||
                            "N/A"}{" "}
                          kW
                        </li>
                        <li>
                          <strong>Combustion Engine Power:</strong>{" "}
                          {v().hybrid_powertrain?.combustion_engine_power_hp ||
                            "N/A"}{" "}
                          HP
                        </li>
                      </Show>
                    </ul>
                  </div>
                </Show>

                <Show when={v().appearance_title || v().appearance_description}>
                  <div class="mt-10 border-t border-gray-200 pt-8">
                    <h2 class="text-xl font-semibold text-gray-800">
                      {v().appearance_title || "Appearance"}
                    </h2>
                    <p>
                      {v().appearance_description ||
                        "No appearance description available."}
                    </p>
                  </div>
                </Show>

                <Show when={v().specification_description}>
                  <div class="mt-10 border-t border-gray-200 pt-8">
                    <h2 class="text-xl font-semibold text-gray-800">
                      Specifications
                    </h2>
                    <p>
                      {v().specification_description ||
                        "No specifications available."}
                    </p>
                  </div>
                </Show>

                <Show when={v().feature_description}>
                  <div class="mt-10 border-t border-gray-200 pt-8">
                    <h2 class="text-xl font-semibold text-gray-800">
                      Features
                    </h2>
                    <p>{v().feature_description || "No features available."}</p>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </Show>
      </div>
    </main>
  );
}
