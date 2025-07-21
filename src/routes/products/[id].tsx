import {
  For,
  Show,
  createResource,
  createSignal,
  createEffect,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { type Product } from "~/db/schema";

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

  createEffect(() => {
    const p = productData();
    if (p && p.images && p.images.length > 0) {
      const firstImage = p.images[0];
      if (firstImage) {
        setActiveImage(getOptimizedImageUrl(firstImage));
      }
    }
  });

  const getOptimizedImageUrl = (image: {
    avif?: string;
    webp?: string;
    jpeg?: string;
  }) => {
    if (image.avif) return image.avif;
    if (image.webp) return image.webp;
    if (image.jpeg) return image.jpeg;
    return "https://via.placeholder.com/384"; // Fallback placeholder
  };

  const [showThumbnails, setShowThumbnails] = createSignal(false);

  return (
    <main class="min-h-screen container-padding pt-25">
      <h1 class="items-center justify-center w-full text-center font-extrabold text-3xl md:text-5xl pb-12">
        PRODUCTS
      </h1>
      <div class="h-[1px] bg-gray-300 w-full mb-5"></div>
      <Show when={productData()} fallback={<p>Product not found.</p>}>
        {(p) => (
          <div class="md:flex md:space-x-8">
            <div class="md:w-3/5 flex flex-col">
              {/* Main Image */}
              <div class="relative aspect-video overflow-hidden ">
                <img
                  src={activeImage()}
                  alt={p().name}
                  class="w-full h-full object-cover"
                />
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
                        {(image) => (
                          <img
                            src={getOptimizedImageUrl(image)}
                            alt="thumbnail"
                            class="w-20 aspect-video object-cover cursor-pointer rounded-md border-2 border-transparent hover:border-primary-accent transition-all duration-200 hover:opacity-100"
                            classList={{
                              "opacity-50":
                                activeImage() !== getOptimizedImageUrl(image),
                              "opacity-100":
                                activeImage() === getOptimizedImageUrl(image),
                            }}
                            onClick={() =>
                              setActiveImage(getOptimizedImageUrl(image))
                            }
                          />
                        )}
                      </For>
                    </div>
                  </Show>
                  {/* Dots */}
                  <div class="flex justify-center space-x-2">
                    <For each={p().images}>
                      {(image) => (
                        <span
                          class="w-2 h-2 bg-gray-400 rounded-full cursor-pointer"
                          classList={{
                            "bg-primary-accent":
                              getOptimizedImageUrl(image) === activeImage(),
                          }}
                          onClick={() =>
                            setActiveImage(getOptimizedImageUrl(image))
                          }
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
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center"
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
