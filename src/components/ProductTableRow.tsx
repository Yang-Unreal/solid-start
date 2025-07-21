// src/components/ProductTableRow.tsx
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { Pencil, Trash2, Square, CheckSquare } from "lucide-solid";
import type { Product } from "~/db/schema";

interface ProductTableRowProps {
  product: Product;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (product: Product) => void;
}

const formatPrice = (priceInCents: number) =>
  `$${(priceInCents / 100).toLocaleString("en-US")}`;

const getOptimizedImageUrl = (image: {
  avif?: string;
  webp?: string;
  jpeg?: string;
}) => {
  if (image.avif) return image.avif;
  if (image.webp) return image.webp;
  if (image.jpeg) return image.jpeg;
  return "https://via.placeholder.com/64x40"; // Fallback placeholder for table row thumbnail size
};

export default function ProductTableRow(props: ProductTableRowProps) {
  return (
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
        <button
          onClick={() => props.onToggleSelect(props.product.id)}
          class="p-1 rounded-md text-black hover:bg-neutral-50 hover:text-neutral-800"
          aria-label={`Select ${props.product.name}`}
        >
          <Show when={props.isSelected} fallback={<Square size={20} />}>
            <CheckSquare size={20} />
          </Show>
        </button>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
        <img
          src={getOptimizedImageUrl(props.product.images[0] || {})}
          alt={props.product.name}
          class="h-10 w-16 rounded-md object-cover"
        />
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
        <div>{props.product.name}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-black">
        {props.product.category || "N/A"}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-black">
        {formatPrice(props.product.priceInCents)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-black">
        {props.product.stockQuantity}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-black">
        {new Date(props.product.createdAt).toLocaleDateString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
        {/* THE FIX IS HERE */}
        <A
          href={`/dashboard/products/${props.product.id}/edit`}
          class="text-sky-600 hover:text-sky-900 mr-4"
        >
          <Pencil size={16} class="inline-block mr-1" />
          Edit
        </A>
        <button
          onClick={() => props.onDelete(props.product)}
          disabled={props.isDeleting}
          class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} class="inline-block mr-1" />
          {props.isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}
