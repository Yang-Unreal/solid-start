import { For, Show, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import type { Product } from "~/db/schema";
import type { QueryObserverResult } from "@tanstack/solid-query";
import ProductImage from "~/components/ProductImage";

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

// --- Main Component (Updated Logic) ---
const ProductDisplayArea = (props: ProductDisplayAreaProps) => {
  const memoizedProducts = createMemo(
    () => props.productsQuery.data?.data || []
  );
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
          class={`product-grid-container justify-center gap-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4`}
        >
          {/* Only show products if not loading and no error, and products exist */}
          <Show
            when={!isLoading() && !error() && memoizedProducts().length > 0}
          >
            <For each={memoizedProducts()}>
              {(product) => (
                <A
                  href={`/products/${product.id}`}
                  class="card-content-host flex flex-col bg-white overflow-hidden"
                >
                  <div class="w-full aspect-video bg-neutral-100 overflow-hidden">
                    <ProductImage
                      imageBaseUrl={product.imageBaseUrl}
                      index={0}
                      size="card"
                      alt={product.name}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class=" flex flex-col flex-grow">
                    <h2
                      class="text-lg font-semibold text-neutral-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h2>
                    <p class="text-xl mt-2 mb-4 text-neutral-700 flex-grow">
                      {formatPrice(product.priceInCents)}
                    </p>
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
              class="pagination-button"
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
              class="pagination-button"
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
              class="pagination-button"
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
              class="pagination-button"
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
