// src/routes/products.tsx
import { createSignal, For, Show, createEffect } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  imageUrl: string | null;
  category: string | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

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

const ProductsPage = () => {
  const [products, setProducts] = createSignal<Product[]>([]);
  const [pagination, setPagination] = createSignal<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const getSearchParamString = (
    paramValue: string | string[] | undefined,
    defaultValue: string
  ): string => {
    if (Array.isArray(paramValue)) {
      return paramValue[0] || defaultValue;
    }
    return paramValue || defaultValue;
  };

  const currentPage = () => {
    const pageStr = getSearchParamString(searchParams.page, "1");
    return parseInt(pageStr, 10);
  };

  const pageSize = () => {
    const pageSizeStr = getSearchParamString(searchParams.pageSize, "12"); // Default to 12
    return parseInt(pageSizeStr, 10);
  };

  const fetchProducts = async (page: number, size: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/products?page=${page}&pageSize=${size}`
      );
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errorMsg = errData.error || errData.message || errorMsg;
          } else {
            const textError = await response.text();
            errorMsg = textError || errorMsg;
          }
        } catch (e) {
          /* ignore parsing error */
        }
        throw new Error(errorMsg);
      }
      const data: ApiResponse = await response.json();
      if (data.error) {
        setError(data.error);
        setProducts([]);
        setPagination(null);
      } else {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (e: any) {
      console.error("Failed to fetch products:", e);
      setError(e.message || "An unknown error occurred.");
      setProducts([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(() => {
    fetchProducts(currentPage(), pageSize());
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      page: newPage.toString(),
      pageSize: pageSize().toString(),
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const paginationButtonClasses = `
    min-w-[100px] text-center
    rounded-lg
    px-4 py-2
    text-sm
    font-medium
    transition-colors duration-150 ease-in-out
    bg-[#c2fe0c]
    text-black
    hover:bg-[#a8e00a]
    active:bg-[#8ab40a]
    focus:outline-none
    focus:ring-2
    focus:ring-[#c2fe0c]
    focus:ring-offset-2
    focus:ring-offset-neutral-100
    dark:focus:ring-offset-black 
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <MetaProvider>
      <Title>Our Products</Title>
      <main class="bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
        <h1 class="text-3xl font-bold mb-8 text-center text-neutral-800 dark:text-neutral-200">
          Our Products
        </h1>

        <Show when={isLoading()}>
          <p class="text-center text-xl text-neutral-700 dark:text-neutral-300 py-10">
            Loading products...
          </p>
        </Show>

        <Show when={error()}>
          <div class="text-center py-10">
            <p class="text-xl text-red-600 dark:text-red-400">
              Error: {error()}
            </p>
            <p class="text-neutral-600 dark:text-neutral-400 mt-2">
              Please try refreshing the page or check back later.
            </p>
          </div>
        </Show>

        <Show when={!isLoading() && !error() && products().length > 0}>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <For each={products()}>
              {(product) => (
                <div class="card-content-host flex flex-col">
                  <Show when={product.imageUrl}>
                    <img
                      src={product.imageUrl!}
                      alt={product.name}
                      class="w-full h-56 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </Show>
                  <div class="p-5 flex flex-col flex-grow">
                    <h2
                      class="text-lg font-semibold mb-1 text-neutral-800 dark:text-neutral-200 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </h2>
                    <p class="text-xl mb-3 text-neutral-700 dark:text-neutral-300">
                      {formatPrice(product.priceInCents)}
                    </p>
                    <Show when={product.description}>
                      <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-grow min-h-[40px]">
                        {product.description!.length > 100
                          ? product.description!.substring(0, 97) + "..."
                          : product.description}
                      </p>
                    </Show>
                    <div class="mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">
                        Category: {product.category || "N/A"}
                      </p>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">
                        Stock: {product.stockQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>

          <Show when={pagination() && pagination()!.totalPages > 1}>
            <div class="mt-10 flex justify-center items-center space-x-3">
              <button
                onClick={() => handlePageChange(pagination()!.currentPage - 1)}
                disabled={!pagination()!.hasPreviousPage}
                class={paginationButtonClasses}
              >
                Previous
              </button>
              <span class="text-neutral-700 dark:text-neutral-300 font-medium text-sm">
                Page {pagination()!.currentPage} of {pagination()!.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination()!.currentPage + 1)}
                disabled={!pagination()!.hasNextPage}
                class={paginationButtonClasses}
              >
                Next
              </button>
            </div>
          </Show>
        </Show>

        <Show when={!isLoading() && !error() && products().length === 0}>
          <p class="text-center text-xl text-neutral-700 dark:text-neutral-300 py-10">
            No products found.
          </p>
        </Show>
      </main>
    </MetaProvider>
  );
};

export default ProductsPage;
