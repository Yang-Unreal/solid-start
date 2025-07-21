import {
  For,
  Show,
  createResource,
  createSignal,
  createEffect,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { type Product } from "~/db/schema";

const getTransformedImageUrl = (
  originalUrl: string | undefined,
  width: number,
  height: number,
  format: string
) => {
  if (!originalUrl) return `https://via.placeholder.com/${width}x${height}`;
  return `/api/images/transform?url=${encodeURIComponent(
    originalUrl
  )}&w=${width}&h=${height}&f=${format}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = () => params.id;

  const [productData] = createResource(productId, async (id) => {
    if (!id) {
      return null;
    }

    let baseUrl = "";
    if (import.meta.env.SSR) {
      baseUrl =
        import.meta.env.VITE_INTERNAL_API_ORIGIN ||
        `http://localhost:${process.env.PORT || 3000}`;
    }
    const fetchUrl = `${baseUrl}/api/products?id=${id}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const result = await response.json();
    return result.data[0] as Product;
  });

  const [activeImage, setActiveImage] = createSignal<string>();
  const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
  const [touchStartX, setTouchStartX] = createSignal(0);

  createEffect(() => {
    const p = productData();
    if (p?.images && p.images.length > 0) {
      // Set initial active image to a transformed version (e.g., large webp)
      setActiveImage(getTransformedImageUrl(p.images[0], 1280, 720, "webp"));
      setCurrentImageIndex(0);
    }
  });

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
      const p = productData();
      if (!p?.images || p.images.length === 0) return;

      let newIndex = currentImageIndex();
      if (diff > 0) {
        // Swiped left, go to next image
        newIndex = (newIndex + 1) % p.images.length;
      } else {
        // Swiped right, go to previous image
        newIndex = (newIndex - 1 + p.images.length) % p.images.length;
      }
      // Update active image to a transformed version
      setActiveImage(
        getTransformedImageUrl(p.images[newIndex], 1280, 720, "webp")
      );
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
      <h1 class="items-center justify-center w-full text-center font-extrabold text-3xl md:text-5xl pb-12">
        PRODUCT DETAIL
      </h1>
      <div class="h-[1px] bg-gray-300 w-full mb-5"></div>
      <Show when={productData()} fallback={<p>Product not found.</p>}>
        {(p) => (
          <div class="md:flex md:space-x-8">
            <div class="md:w-3/5 flex flex-col">
              {/* Main Image */}
              <div class="relative aspect-video overflow-hidden">
                <picture>
                  <source
                    srcset={getTransformedImageUrl(
                      p().images[currentImageIndex()],
                      1280,
                      720,
                      "avif"
                    )}
                    type="image/avif"
                  />
                  <source
                    srcset={getTransformedImageUrl(
                      p().images[currentImageIndex()],
                      1280,
                      720,
                      "webp"
                    )}
                    type="image/webp"
                  />
                  <img
                    src={activeImage()} // activeImage is already a transformed URL
                    alt={p().name}
                    class="w-full h-full object-cover"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                </picture>
                {/* Image Index for Mobile */}
                <Show when={p().images && p().images.length > 0}>
                  <div class="absolute top-2 right-3 bg-black bg-opacity-30 text-white text-xs px-2 py-0.5 rounded-full md:hidden">
                    {currentImageIndex() + 1} / {p().images.length}
                  </div>
                </Show>
                {/* Dots and Thumbnails for image navigation */}
                <div
                  class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center w-full"
                  onMouseEnter={() => setShowThumbnails(true)}
                  onMouseLeave={() => setShowThumbnails(false)}
                >
                  {/* Thumbnails row */}
                  <Show when={showThumbnails()}>
                    <div class="mb-2 flex space-x-2 overflow-x-auto pb-2">
                      <For each={p().images}>
                        {(image, index) => (
                          <picture>
                            <source
                              srcset={getTransformedImageUrl(
                                image,
                                80,
                                45,
                                "avif"
                              )}
                              type="image/avif"
                            />
                            <source
                              srcset={getTransformedImageUrl(
                                image,
                                80,
                                45,
                                "webp"
                              )}
                              type="image/webp"
                            />
                            <img
                              src={getTransformedImageUrl(
                                image,
                                80,
                                45,
                                "jpeg"
                              )}
                              alt={`thumbnail ${index() + 1}`}
                              class="w-20 aspect-video object-cover cursor-pointer rounded-md border-2 border-transparent hover:border-primary-accent transition-all duration-200 hover:opacity-100"
                              classList={{
                                "opacity-50": index() !== currentImageIndex(),
                                "opacity-100": index() === currentImageIndex(),
                              }}
                              onClick={() => {
                                setActiveImage(
                                  getTransformedImageUrl(
                                    image,
                                    1280,
                                    720,
                                    "webp"
                                  )
                                );
                                setCurrentImageIndex(index());
                              }}
                            />
                          </picture>
                        )}
                      </For>
                    </div>
                  </Show>
                  {/* Dots */}
                  <div class="hidden md:flex justify-center space-x-2">
                    <For each={p().images}>
                      {(image, index) => (
                        <span
                          class="w-2 h-2 bg-gray-400 rounded-full cursor-pointer"
                          classList={{
                            "bg-primary-accent":
                              index() === currentImageIndex(),
                          }}
                          onClick={() => {
                            setActiveImage(
                              getTransformedImageUrl(image, 1280, 720, "webp")
                            );
                            setCurrentImageIndex(index());
                          }}
                        ></span>
                      )}
                    </For>
                  </div>
                </div>
              </div>
              {/* The original "Thumbnails" div (mt-4 relative) is now removed as its content has been moved. */}
            </div>

            {/* Product Details (Right Column) */}
            <div class="w-full md:w-2/5 mt-8 md:mt-0">
              <h1 class="text-3xl font-bold text-gray-900">{p().name}</h1>
              <p class="mt-2 text-xl text-gray-700">
                ${(p().priceInCents / 100).toFixed(2)}
              </p>
              <div class="mt-4">
                <span class="text-sm text-gray-600">
                  In Stock: {p().stockQuantity}
                </span>
              </div>

              <p class="mt-6 text-gray-700 leading-relaxed">
                {p().description}
              </p>

              <div class="mt-8">
                <button class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 text-lg font-semibold">
                  Add to Cart
                </button>
              </div>

              <div class="mt-10 border-t border-gray-200 pt-8">
                <h2 class="text-xl font-semibold text-gray-800">
                  Product Details
                </h2>
                <ul class="mt-4 text-gray-700 space-y-2">
                  <Show when={p().brand}>
                    <li>
                      <strong class="font-medium">Brand:</strong> {p().brand}
                    </li>
                  </Show>
                  <Show when={p().model}>
                    <li>
                      <strong class="font-medium">Model:</strong> {p().model}
                    </li>
                  </Show>
                  <Show when={p().fuelType}>
                    <li>
                      <strong class="font-medium">Fuel Type:</strong>{" "}
                      {p().fuelType}
                    </li>
                  </Show>
                  <Show when={!p().brand && !p().model && !p().fuelType}>
                    <li>No additional details available.</li>
                  </Show>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Show>
      <div
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center mt-20"
        style="background-image: url('/heroBackground.webp');"
      ></div>{" "}
      <div
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center"
        style="background-image: url('/heroBackground.webp');"
      ></div>{" "}
      <div
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center"
        style="background-image: url('/heroBackground.webp');"
      ></div>
    </main>
  );
}
