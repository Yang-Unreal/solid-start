import { For, Show, createResource } from "solid-js";
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
    <main class="h-screen container-padding pt-15">
      <Show when={productData()} fallback={<p>Product not found.</p>}>
        {(p) => (
          <div class="bg-white overflow-hidden md:flex">
            <div class="w-full md:w-1/2 flex flex-col items-center">
              <Show when={p().images && p().images.length > 0}>
                <img
                  class="w-full aspect-video object-cover mb-4"
                  src={getOptimizedImageUrl(p().images[0] || {})}
                  alt={p().name}
                />
                <div class="flex space-x-2 overflow-x-auto pb-2">
                  <For each={p().images}>
                    {(image, index) => (
                      <img
                        src={getOptimizedImageUrl(image)}
                        alt={`${p().name} - Image ${index() + 1}`}
                        class="w-24 h-24 object-cover cursor-pointer rounded-md border border-neutral-200 hover:border-neutral-400"
                        // You might add a click handler here to change the main image
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>
            <div class="w-full md:w-1/2 lg:px-30">
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
