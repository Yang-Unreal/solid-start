// src/components/ProductListItem.tsx
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { Pencil, Trash2, Square, CheckSquare } from "lucide-solid";
import type { Product } from "~/db/schema";
import ProductImage from "./ProductImage";

interface ProductListItemProps {
  product: Product;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (product: Product) => void;
}

const formatPrice = (priceInCents: number) =>
  `${(priceInCents / 100).toLocaleString("en-US")}`;

export default function ProductListItem(props: ProductListItemProps) {
  return (
    <div class="bg-white rounded-lg shadow p-3 flex items-center space-x-4">
      <div class="flex-shrink-0">
        <button
          onClick={() => props.onToggleSelect(props.product.id)}
          class="p-1 rounded-md text-black hover:bg-neutral-50 hover:text-neutral-800"
          aria-label={`Select ${props.product.name}`}
        >
          <Show when={props.isSelected} fallback={<Square size={20} />}>
            <CheckSquare size={20} />
          </Show>
        </button>
      </div>
      <A
        href={`/products/${props.product.id}`}
        class="flex-1 min-w-0 flex items-center space-x-4 group"
      >
        <div class="flex-shrink-0 w-24">
          <ProductImage
            imageBaseUrl={props.product.imageBaseUrl}
            index={0}
            size="thumbnail"
            alt={props.product.name}
            class="w-24 h-16 rounded-md object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-black truncate group-hover:text-indigo-600 transition-colors duration-200">
            {props.product.name}
          </p>
          <p class="text-sm font-semibold text-black mt-1">
            {formatPrice(props.product.priceInCents)}
          </p>
          <p class="text-xs text-black mt-1">
            Brand: {props.product.brand || "N/A"}
          </p>
          <p class="text-xs text-black">
            Category: {props.product.category || "N/A"}
          </p>
          <p class="text-xs text-black">Stock: {props.product.stockQuantity}</p>
        </div>
      </A>
      <div class="flex flex-col items-center space-y-2">
        <A
          href={`/dashboard/products/${props.product.id}/edit`}
          class="p-1 rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
          aria-label={`Edit ${props.product.name}`}
        >
          <Pencil size={18} />
        </A>
        <button
          onClick={() => props.onDelete(props.product)}
          disabled={props.isDeleting}
          class="p-1 rounded-md text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
          aria-label={`Delete ${props.product.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
