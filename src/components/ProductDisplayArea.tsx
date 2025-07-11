import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import type { Product } from "~/db/schema";
import type { QueryObserverResult } from "@tanstack/solid-query";

// --- Interface Definitions (reverted to include full pagination info) ---
interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  data: Product[];
  pagination: PaginationInfo;
  error?: string;
}

interface ProductDisplayAreaProps {
  productsQuery: QueryObserverResult<ApiResponse, Error>;
  handlePageChange: (newPage: number) => void; // Re-added
  pageSize: () => number;
}

// --- Helper Functions (unchanged) ---
const formatPrice = (priceInCents: number) =>
  `$${(priceInCents / 100).toLocaleString("en-US")}`;

const paginationButtonClasses = `w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[100px] sm:px-4 sm:py-2`;

// --- Main Component (Updated Logic) ---
const ProductDisplayArea = (props: ProductDisplayAreaProps) => {
  const products = () => props.productsQuery.data?.data || [];
  const pagination = () => props.productsQuery.data?.pagination || null;
  const error = () => props.productsQuery.error;

  const isLoading = () => props.productsQuery.isLoading;

  return (
    <>
      {/* State 1: Error occurred */}
      <Show when={error()}>
        <div class="text-center py-10">
          <p class="text-xl text-red-600">
            Error: {error()?.message || "An unknown error occurred."}
          </p>
          <p class="text-neutral-700 mt-2">
            Please try refreshing.{" "}
            <button
              onClick={() => props.productsQuery.refetch()}
              class="ml-2 text-sky-600 underline"
              aria-label="Retry fetching products"
            >
              Retry
            </button>
          </p>
        </div>
      </Show>

      <div class="relative">
        {/* --- Product Grid Container (Always rendered for hydration stability) --- */}
        <div
          class={`product-grid-container justify-center grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
        >
          {/* Only show products if not loading and no error, and products exist */}
          <Show when={!isLoading() && !error() && products().length > 0}>
            <For each={products()}>
              {(product) => (
                <A
                  href={`/products/${product.id}`}
                  class="card-content-host flex flex-col bg-white shadow-lg rounded-xl overflow-hidden group"
                >
                  <div class="w-full aspect-video bg-neutral-100 overflow-hidden">
                    <picture>
                      <source
                        srcset={product.images.thumbnail.avif}
                        type="image/avif"
                      />
                      <source
                        srcset={product.images.thumbnail.webp}
                        type="image/webp"
                      />
                      <img
                        src={product.images.thumbnail.jpeg}
                        alt={product.name}
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fetchpriority="high"
                        width="640"
                        height="360"
                      />
                    </picture>
                  </div>
                  <div class="p-5 flex flex-col flex-grow">
                    <h2
                      class="text-lg font-semibold text-neutral-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h2>
                    <p class="text-xl mt-2 mb-4 text-neutral-700 flex-grow">
                      {formatPrice(product.priceInCents)}
                    </p>
                    <div class="mt-auto pt-2 border-t border-neutral-100">
                      <p class="text-xs text-neutral-600">
                        Brand: {product.brand || "N/A"}
                      </p>
                      <p class="text-xs text-neutral-600">
                        Category: {product.category || "N/A"}
                      </p>
                      <p class="text-xs text-neutral-600">
                        Stock: {product.stockQuantity}
                      </p>
                    </div>
                  </div>
                </A>
              )}
            </For>
          </Show>
        </div>

        {/* --- Pagination Controls (Only show if not loading, no error, and pagination exists) --- */}
        <Show
          when={
            !isLoading() &&
            !error() &&
            pagination() &&
            pagination()!.totalPages > 1
          }
        >
          <div class="mt-10 flex justify-center items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => props.handlePageChange(1)}
              disabled={!pagination()!.hasPreviousPage}
              class={paginationButtonClasses}
              aria-label="First page"
            >
              <span class="hidden sm:inline">First</span>
              <span class="sm:hidden" aria-hidden="true">
                «
              </span>
            </button>
            <button
              onClick={() =>
                props.handlePageChange(pagination()!.currentPage - 1)
              }
              disabled={!pagination()!.hasPreviousPage}
              class={paginationButtonClasses}
              aria-label="Previous page"
            >
              <span class="hidden sm:inline">Previous</span>
              <span class="sm:hidden" aria-hidden="true">
                ‹
              </span>
            </button>
            <span class="text-neutral-700 font-medium text-sm px-2">
              Page {pagination()!.currentPage} of {pagination()!.totalPages}
            </span>
            <button
              onClick={() =>
                props.handlePageChange(pagination()!.currentPage + 1)
              }
              disabled={!pagination()!.hasNextPage}
              class={paginationButtonClasses}
              aria-label="Next page"
            >
              <span class="hidden sm:inline">Next</span>
              <span class="sm:hidden" aria-hidden="true">
                ›
              </span>
            </button>
            <button
              onClick={() => props.handlePageChange(pagination()!.totalPages)}
              disabled={!pagination()!.hasNextPage}
              class={paginationButtonClasses}
              aria-label="Last page"
            >
              <span class="hidden sm:inline">Last</span>
              <span class="sm:hidden" aria-hidden="true">
                »
              </span>
            </button>
          </div>
        </Show>
      </div>
    </>
  );
};

export default ProductDisplayArea;