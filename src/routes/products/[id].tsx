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

  return (
    <main class="min-h-screen">
      <Show when={productData()} fallback={<p>Product not found.</p>}>
        {(p) => (
          <div class="bg-white overflow-hidden md:flex pt-15">
            <div class="w-full md:w-2/3 flex">
              <Show when={p().images && p().images.length > 0}>
                <>
                  <div class="w-1/5 flex flex-col ">
                    <For each={p().images}>
                      {(image) => (
                        <img
                          src={getOptimizedImageUrl(image)}
                          alt="thumbnail"
                          class="w-full cursor-pointer aspect-video object-cover"
                          onMouseEnter={() =>
                            setActiveImage(getOptimizedImageUrl(image))
                          }
                        />
                      )}
                    </For>
                  </div>
                  <div class="w-4/5">
                    <img
                      src={activeImage()}
                      alt={p().name}
                      class="w-full aspect-video object-cover"
                    />
                  </div>
                </>
              </Show>
            </div>
            <div class="w-full md:w-1/3 lg:px-30">
              <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {p().category}
              </div>
              <h1 class="block mt-1 text-lg leading-tight font-medium text-black">
                {p().name}
              </h1>

              <div class="mt-4">
                <span class="text-xl font-bold text-gray-900">
                  ${(p().priceInCents / 100).toFixed(2)}
                </span>
                <span class="ml-2 text-sm text-gray-500">
                  (In Stock: {p().stockQuantity})
                </span>
              </div>
              <div class="mt-6">
                <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Add to Cart
                </button>
              </div>

              <p class="mt-2 text-gray-600">{p().description}</p>
              <div class="mt-8">
                <h2 class="text-lg font-semibold text-gray-800">
                  Product Details
                </h2>
                <ul class="mt-2 text-gray-600 list-disc list-inside">
                  <Show when={p().brand}>
                    <li>
                      <strong>Brand:</strong> {p().brand}
                    </li>
                  </Show>
                  <Show when={p().model}>
                    <li>
                      <strong>Model:</strong> {p().model}
                    </li>
                  </Show>
                  <Show when={p().fuelType}>
                    <li>
                      <strong>Fuel Type:</strong> {p().fuelType}
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
    </main>
  );
}
