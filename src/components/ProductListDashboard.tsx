// src/components/ProductListDashboard.tsx
import { For, Show, createSignal, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import {
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/solid-query";
import type { Accessor, Setter } from "solid-js";
import {
  PlusCircle,
  Trash2,
  Pencil,
  Square,
  CheckSquare,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-solid";
import type { Product } from "~/db/schema";
import ProductListItem from "./ProductListItem";
import ProductTableRow from "./ProductTableRow";

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

const PRODUCTS_QUERY_KEY_PREFIX = "products";
const FIXED_PAGE_SIZE = 10;

async function deleteProductApi(
  productId: string
): Promise<{ message: string; product: Product }> {
  const response = await fetch(`/api/products?id=${productId}`, {
    method: "DELETE",
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).error || "Failed to delete product"
    );
  return response.json();
}
async function bulkDeleteProductsApi(
  productIds: string[]
): Promise<{ message: string; deletedCount: number }> {
  const response = await fetch("/api/products/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: productIds }),
  });
  if (!response.ok)
    throw new Error(
      (await response.json()).error || "Failed to bulk delete products"
    );
  return response.json();
}

export default function ProductListDashboard(props: {
  productsQuery: UseQueryResult<ApiResponse, Error>;
  currentPage: Accessor<number>;
  setCurrentPage: Setter<number>;
  pageSize: Accessor<number>;
}) {
  const tanstackQueryClient = useQueryClient();
  const [selectedProductIds, setSelectedProductIds] = createSignal<Set<string>>(
    new Set()
  );
  const [deleteError, setDeleteError] = createSignal<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = createSignal<
    string | null
  >(null);

  const products = () => props.productsQuery.data?.data || [];
  const pagination = () => props.productsQuery.data?.pagination || null;

  const deleteProductMutation = useMutation(() => ({
    mutationFn: deleteProductApi,
    onSuccess: (data: { product: Product }) => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });
      setShowSuccessMessage(`Product "${data.product.name}" deleted.`);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => setDeleteError(err.message),
  }));

  const bulkDeleteProductsMutation = useMutation(() => ({
    mutationFn: bulkDeleteProductsApi,
    onSuccess: (data: { deletedCount: number }) => {
      tanstackQueryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });
      setSelectedProductIds(new Set<string>());
      setShowSuccessMessage(`${data.deletedCount} products deleted.`);
      setTimeout(() => setShowSuccessMessage(null), 3000);
    },
    onError: (err: Error) => setDeleteError(err.message),
  }));

  const toggleProductSelection = (productId: string) =>
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  const isProductSelected = (productId: string) =>
    selectedProductIds().has(productId);
  const isAllSelected = createMemo(() => {
    const p = products();
    return (
      p.length > 0 &&
      p.every((prod: Product) => selectedProductIds().has(prod.id))
    );
  });
  const toggleSelectAll = () => {
    if (isAllSelected()) {
      setSelectedProductIds(new Set<string>());
    } else {
      setSelectedProductIds(new Set(products().map((p: Product) => p.id)));
    }
  };
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Delete "${product.name}"?`))
      deleteProductMutation.mutate(product.id);
  };
  const handleBulkDelete = () => {
    const ids = Array.from(selectedProductIds());
    if (ids.length > 0 && window.confirm(`Delete ${ids.length} products?`))
      bulkDeleteProductsMutation.mutate(ids);
  };
  const handlePageChange = (newPage: number) => {
    props.setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const paginationButtonClasses = `h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-300 text-neutral-700 hover:bg-neutral-400 disabled:bg-neutral-200 disabled:text-neutral-500`;

  return (
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="w-full max-w-xs">
          <h2 class="text-2xl font-bold text-black">Products List</h2>
        </div>
        <div class="flex items-center space-x-2">
          <A
            href="/dashboard/products/new"
            class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800"
          >
            <PlusCircle size={18} class="mr-2" /> Add Product
          </A>
          <Show when={selectedProductIds().size > 0}>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteProductsMutation.isPending}
              class="flex items-center min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} class="mr-2" />{" "}
              {bulkDeleteProductsMutation.isPending
                ? "Deleting..."
                : `Delete Selected (${selectedProductIds().size})`}
            </button>
          </Show>
        </div>
      </div>

      <Show when={showSuccessMessage()}>
        <div class="mb-4 p-3 rounded-md bg-green-100 text-green-700">
          {showSuccessMessage()}
        </div>
      </Show>
      <Show when={deleteError()}>
        <div class="mb-4 p-3 rounded-md bg-red-100 text-red-700">
          {deleteError()}
        </div>
      </Show>
      <Show when={props.productsQuery.error}>
        <p class="text-red-500">Error: {props.productsQuery.error?.message}</p>
      </Show>

      <div class="block md:hidden space-y-3">
        <Show
          when={products().length > 0}
          fallback={
            <p class="text-center text-neutral-700 py-10">No products found.</p>
          }
        >
          <For each={products()}>
            {(product) => (
              <ProductListItem
                product={product}
                isSelected={isProductSelected(product.id)}
                isDeleting={false}
                onToggleSelect={toggleProductSelection}
                onDelete={handleDeleteProduct}
              />
            )}
          </For>
        </Show>
      </div>

      <div class="hidden md:block overflow-x-auto bg-white shadow-md rounded-lg">
        <Show
          when={products().length > 0}
          fallback={
            <p class="text-center text-neutral-700 py-10">No products found.</p>
          }
        >
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left">
                  <button onClick={toggleSelectAll} class="p-1 text-black">
                    <Show
                      when={isAllSelected()}
                      fallback={<Square size={20} />}
                    >
                      <CheckSquare size={20} />
                    </Show>
                  </button>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Image
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <For each={products()}>
                {(product) => (
                  <ProductTableRow
                    product={product}
                    isSelected={isProductSelected(product.id)}
                    isDeleting={
                      deleteProductMutation.isPending &&
                      deleteProductMutation.variables === product.id
                    }
                    onToggleSelect={toggleProductSelection}
                    onDelete={handleDeleteProduct}
                  />
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>

      <Show when={pagination() && pagination()!.totalPages > 1}>
        <div class="mt-4 flex flex-wrap justify-center items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination()!.currentPage === 1}
            class={paginationButtonClasses}
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage - 1)}
            disabled={!pagination()!.hasPreviousPage}
            class={paginationButtonClasses}
          >
            <ChevronLeft size={18} />
          </button>
          <span class="text-neutral-700 font-medium text-sm px-2 py-1">
            Page {pagination()!.currentPage} of {pagination()!.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination()!.currentPage + 1)}
            disabled={!pagination()!.hasNextPage}
            class={paginationButtonClasses}
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => handlePageChange(pagination()!.totalPages)}
            disabled={pagination()!.currentPage === pagination()!.totalPages}
            class={paginationButtonClasses}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </Show>
    </div>
  );
}
