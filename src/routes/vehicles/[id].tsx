import { For, Show, createResource, createSignal } from "solid-js";
import HoverableButton from "~/components/HoverableButton";
import { useParams } from "@solidjs/router";
import {
  type Vehicle,
  type Photo,
  type EngineDetail,
  type ElectricDetail,
} from "~/db/schema";
import VehicleImage from "~/components/vehicle/VehicleImage";

type VehicleWithRelations = Vehicle & {
  photos: Photo[];
  engineDetails: EngineDetail | null;
  electricDetails: ElectricDetail | null;
};

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
    return result.data[0] as VehicleWithRelations;
  });

  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
  const [touchStartX, setTouchStartX] = createSignal(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartX() || !e.touches[0]) return;

    const currentTouchX = e.touches[0].clientX;
    const diff = touchStartX() - currentTouchX;

    if (Math.abs(diff) > 50) {
      // Threshold for a swipe
      const v = vehicleData();
      if (!v?.photos || v.photos.length === 0) return;

      let newIndex = currentImageIndex();
      const totalImages = v.photos.length;
      if (diff > 0) {
        // Swiped left, go to next image
        newIndex = (newIndex + 1) % totalImages;
      } else {
        // Swiped right, go to previous image
        newIndex = (newIndex - 1 + totalImages) % totalImages;
      }
      setCurrentImageIndex(newIndex);
      setTouchStartX(0); // Reset touch start to prevent multiple swipes
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(0);
  };

  const [showThumbnails, setShowThumbnails] = createSignal(false);

  return (
    <main class="min-h-screen container-padding pt-25">
      <div class="px-1.5 md:px-3">
        <h1 class="items-center justify-center w-full text-center font-extrabold text-3xl md:text-5xl pb-12">
          VEHICLE DETAIL
        </h1>
        <div class="h-[1px] bg-gray-300 w-full mb-5"></div>
        <Show when={vehicleData()} fallback={<p>Vehicle not found.</p>}>
          {(v) => (
            <div class="md:flex md:space-x-8">
              <div class="md:w-3/5 flex flex-col">
                {/* Main Image */}
                <div
                  class="relative aspect-video overflow-hidden"
                  onMouseEnter={() => setShowThumbnails(true)}
                  onMouseLeave={() => setShowThumbnails(false)}
                >
                  <VehicleImage
                    photoUrl={v().photos?.[currentImageIndex()]?.photo_url}
                    alt={v().model}
                    class="w-full h-full object-cover rounded-lg"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                  {/* Image Index for Mobile */}
                  <Show when={v().photos && v().photos.length > 0}>
                    <div class="absolute top-2 right-3 bg-black bg-opacity-30 text-white text-xs px-2 py-0.5 rounded-full md:hidden">
                      {currentImageIndex() + 1} / {v().photos.length}
                    </div>
                  </Show>
                  {/* Dots and Thumbnails for image navigation */}
                  <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center w-full">
                    {/* Thumbnails row */}
                    <div
                      class="mb-2 flex space-x-2 overflow-x-auto pb-2 transition-opacity duration-300"
                      classList={{
                        "opacity-0 pointer-events-none": !showThumbnails(),
                        "opacity-100": showThumbnails(),
                      }}
                    >
                      <For each={v().photos}>
                        {(photo, index) => (
                          <VehicleImage
                            photoUrl={photo.photo_url}
                            alt={`${v().model} thumbnail ${index() + 1}`}
                            class={`w-20 aspect-video object-cover cursor-pointer rounded-md transition-all duration-200 hover:opacity-100 ${
                              currentImageIndex() === index()
                                ? "opacity-100 border-2 border-blue-500"
                                : "opacity-50"
                            }`}
                            onClick={() => setCurrentImageIndex(index())}
                          />
                        )}
                      </For>
                    </div>
                    {/* Dots */}
                    <div class="hidden md:flex justify-center space-x-2">
                      <For each={v().photos}>
                        {(_, index) => (
                          <span
                            class="w-2 h-2 bg-gray-300 rounded-full cursor-pointer"
                            classList={{
                              "bg-gray-800": currentImageIndex() === index(),
                            }}
                            onClick={() => {
                              setCurrentImageIndex(index());
                            }}
                          ></span>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details (Right Column) */}
              <div class="w-full md:w-2/5 mt-8 md:mt-0">
                <h1 class="text-3xl font-bold text-gray-900">
                  {v().brand} {v().model}
                </h1>
                <p class="mt-2 text-xl text-gray-700">${v().price}</p>
                <p class="mt-6 text-gray-700 leading-relaxed">
                  {v().general_description}
                </p>

                <div class="mt-8">
                  <HoverableButton
                    as="button"
                    enableHoverCircle
                    applyOverflowHidden
                    hoverCircleColor="	hsl(0, 0%, 0%)"
                    class="w-1/2 border rounded-full px-5 py-3 text-lg font-semibold transition-colors duration-300 hover:border-transparent hover:text-white"
                  >
                    Contact Seller
                  </HoverableButton>
                </div>

                <div class="mt-10 border-t border-gray-200 pt-8">
                  <h2 class="text-xl font-semibold text-gray-800">
                    Vehicle Details
                  </h2>
                  <ul class="mt-4 text-gray-700 space-y-2">
                    <li>
                      <strong class="font-medium">Brand:</strong> {v().brand}
                    </li>
                    <li>
                      <strong class="font-medium">Model:</strong> {v().model}
                    </li>
                    <li>
                      <strong class="font-medium">Year:</strong>{" "}
                      {v().date_of_manufacture}
                    </li>
                    <li>
                      <strong class="font-medium">Mileage:</strong>{" "}
                      {v().mileage} km
                    </li>
                    <li>
                      <strong class="font-medium">Horsepower:</strong>{" "}
                      {v().horsepower} HP
                    </li>
                    <li>
                      <strong class="font-medium">Transmission:</strong>{" "}
                      {v().transmission}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>
    </main>
  );
}
