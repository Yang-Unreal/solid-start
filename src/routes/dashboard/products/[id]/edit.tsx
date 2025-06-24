// src/routes/dashboard/products/[id]/edit.tsx
import { createSignal, Show, createEffect } from "solid-js";
import { useNavigate, A, useParams } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQueryClient,
  useQuery,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Product, ProductImages } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod/v4";

const PRODUCTS_QUERY_KEY_PREFIX = "products";
type CreateProductDBData = Omit<Product, "id" | "createdAt" | "updatedAt">;

const EditProductFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Product name is required." }),
  description: z.string().trim().optional(),
  priceInCents: z.coerce.number().int().positive(),
  category: z.string().trim().optional(),
  stockQuantity: z.coerce.number().int().min(0),
  brand: z.string().trim().min(1, { message: "Brand is required." }),
  model: z.string().trim().min(1, { message: "Model is required." }),
  fuelType: z.string().trim().min(1, { message: "Fuel type is required." }),
});

type ProductFormValues = z.infer<typeof EditProductFormSchema>;

interface ApiResponse {
  data: Product[];
}

async function updateProductInDB(
  updatedProduct: Partial<CreateProductDBData> & { id: string }
): Promise<Product> {
  const fetchUrl = `/api/products?id=${updatedProduct.id}`;
  const response = await fetch(fetchUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProduct),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error updating product`);
  }
  return (await response.json()).product as Product;
}

export default function EditProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const params = useParams();
  const productId = () => params.id;
  const [isAuthorized, setIsAuthorized] = createSignal(false);

  const productQuery = useQuery(() => ({
    queryKey: ["product", productId()] as const,
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      if (!id) return null;

      // THE FIX: Construct the full URL for the server
      let baseUrl = "";
      if (import.meta.env.SSR) {
        baseUrl =
          import.meta.env.VITE_INTERNAL_API_ORIGIN ||
          `http://localhost:${process.env.PORT || 3000}`;
      }

      const fetchUrl = `${baseUrl}/api/products?id=${id}`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Failed to fetch product for editing.");
      return (await response.json()) as ApiResponse;
    },
    enabled: !!productId(),
    staleTime: 5 * 60 * 1000,
  }));

  const existingProduct = () => productQuery.data?.data?.[0];

  createEffect(() => {
    const currentSession = session();
    if (!currentSession.isPending) {
      const user = currentSession.data?.user as { role?: string } | undefined;
      if (user?.role === "admin") {
        setIsAuthorized(true);
      } else if (user) {
        navigate("/dashboard", { replace: true });
      }
    }
  });

  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [priceInCentsInput, setPriceInCentsInput] = createSignal("");
  const [stockQuantityInput, setStockQuantityInput] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [brand, setBrand] = createSignal("");
  const [model, setModel] = createSignal("");
  const [fuelType, setFuelType] = createSignal("");
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);

  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<ProductFormValues> | null>(null);
  const [fileUploadError, setFileUploadError] = createSignal<string | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = createSignal(false);

  createEffect(() => {
    const product = existingProduct();
    if (product) {
      setName(product.name ?? "");
      setDescription(product.description || "");
      setPriceInCentsInput((product.priceInCents ?? "").toString());
      setStockQuantityInput((product.stockQuantity ?? "").toString());
      setCategory(product.category || "");
      setBrand(product.brand ?? "");
      setModel(product.model ?? "");
      setFuelType(product.fuelType ?? "");
    }
  });

  const productUpdateMutation: UseMutationResult<
    Product,
    Error,
    Partial<CreateProductDBData> & { id: string }
  > = useMutation(() => ({
    mutationFn: updateProductInDB,
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY_PREFIX] });
      queryClient.setQueryData(["product", productId()], {
        data: [updatedProduct],
      });
      navigate("/dashboard/products");
    },
    onError: (error: Error) => {
      setFormErrors({ _errors: [error.message] } as any);
    },
  }));

  const handleFileChange = (e: Event) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileUploadError(null);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);
    setFileUploadError(null);

    const validationResult = EditProductFormSchema.safeParse({
      name: name(),
      description: description(),
      priceInCents: priceInCentsInput(),
      category: category(),
      stockQuantity: stockQuantityInput(),
      brand: brand(),
      model: model(),
      fuelType: fuelType(),
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }

    let imagesToSave: ProductImages | undefined = existingProduct()?.images;
    if (selectedFile()) {
      setIsUploadingImage(true);
      try {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedFile()!);
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });
        if (!uploadResponse.ok)
          throw new Error(
            (await uploadResponse.json()).error || "Image upload failed"
          );
        imagesToSave = (await uploadResponse.json()).images;
      } catch (uploadError: any) {
        setFileUploadError(uploadError.message);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    if (!imagesToSave) {
      setFileUploadError("Product image is required.");
      return;
    }

    productUpdateMutation.mutate({
      id: productId()!,
      ...validationResult.data,
      images: imagesToSave,
      description: validationResult.data.description || null,
      category: validationResult.data.category || null,
    });
  };

  const inputBaseClasses = `block w-full mt-1 py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black`;
  const labelBaseClasses = `block text-sm font-medium text-neutral-700`;
  const fileInputClasses = `mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed`;
  const fieldError = (fieldName: keyof ProductFormValues) =>
    formErrors()?.[fieldName]?._errors[0];

  return (
    <Show
      when={isAuthorized()}
      fallback={
        <div class="flex justify-center items-center min-h-screen">
          <p>Authorizing...</p>
        </div>
      }
    >
      <MetaProvider>
        <Title>Edit Product</Title>
      </MetaProvider>
      <div class="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8 mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Edit Product
        </h1>
        <Show when={productQuery.isLoading}>
          <p class="text-center">Loading product...</p>
        </Show>
        <Show when={productQuery.isError}>
          <p class="text-center text-red-500">
            Error: {productQuery.error?.message}
          </p>
        </Show>
        <Show when={productQuery.isSuccess && existingProduct()}>
          <form onSubmit={handleSubmit} class="space-y-5">
            <div>
              <label for="name" class={labelBaseClasses}>
                Product Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("name")}>
                <p class="mt-1 text-xs text-red-500">{fieldError("name")}</p>
              </Show>
            </div>
            <div>
              <label for="brand" class={labelBaseClasses}>
                Brand <span class="text-red-500">*</span>
              </label>
              <input
                id="brand"
                type="text"
                value={brand()}
                onInput={(e) => setBrand(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("brand")}>
                <p class="mt-1 text-xs text-red-500">{fieldError("brand")}</p>
              </Show>
            </div>
            <div>
              <label for="model" class={labelBaseClasses}>
                Model <span class="text-red-500">*</span>
              </label>
              <input
                id="model"
                type="text"
                value={model()}
                onInput={(e) => setModel(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("model")}>
                <p class="mt-1 text-xs text-red-500">{fieldError("model")}</p>
              </Show>
            </div>
            <div>
              <label for="fuelType" class={labelBaseClasses}>
                Fuel Type <span class="text-red-500">*</span>
              </label>
              <input
                id="fuelType"
                type="text"
                value={fuelType()}
                onInput={(e) => setFuelType(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("fuelType")}>
                <p class="mt-1 text-xs text-red-500">
                  {fieldError("fuelType")}
                </p>
              </Show>
            </div>
            <div>
              <label for="description" class={labelBaseClasses}>
                Description
              </label>
              <textarea
                id="description"
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                class={`${inputBaseClasses} min-h-[100px]`}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
            </div>
            <div>
              <label for="price" class={labelBaseClasses}>
                Price (in Cents) <span class="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="text"
                inputMode="numeric"
                value={priceInCentsInput()}
                onInput={(e) => setPriceInCentsInput(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("priceInCents")}>
                <p class="mt-1 text-xs text-red-500">
                  {fieldError("priceInCents")}
                </p>
              </Show>
            </div>
            <div>
              <label for="productImage" class={labelBaseClasses}>
                Product Image
              </label>
              <input
                id="productImage"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                class={fileInputClasses}
                onChange={handleFileChange}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={existingProduct()?.images}>
                <div class="mt-2">
                  <p class="text-xs">Current:</p>
                  <img
                    src={existingProduct()!.images.thumbnail.jpeg}
                    class="w-24 h-auto rounded-md mt-1"
                  />
                </div>
              </Show>
              <Show when={selectedFile() && !fileUploadError()}>
                <p class="mt-1 text-xs">New: {selectedFile()!.name}</p>
              </Show>
              <Show when={fileUploadError()}>
                <p class="mt-1 text-xs text-red-500">{fileUploadError()}</p>
              </Show>
            </div>
            <div>
              <label for="category" class={labelBaseClasses}>
                Category
              </label>
              <input
                id="category"
                type="text"
                value={category()}
                onInput={(e) => setCategory(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("category")}>
                <p class="mt-1 text-xs text-red-500">
                  {fieldError("category")}
                </p>
              </Show>
            </div>
            <div>
              <label for="stockQuantity" class={labelBaseClasses}>
                Stock Quantity <span class="text-red-500">*</span>
              </label>
              <input
                id="stockQuantity"
                type="text"
                inputMode="numeric"
                value={stockQuantityInput()}
                onInput={(e) => setStockQuantityInput(e.currentTarget.value)}
                class={inputBaseClasses}
                disabled={isUploadingImage() || productUpdateMutation.isPending}
              />
              <Show when={fieldError("stockQuantity")}>
                <p class="mt-1 text-xs text-red-500">
                  {fieldError("stockQuantity")}
                </p>
              </Show>
            </div>
            <Show
              when={formErrors()?._errors?.length && formErrors()?._errors[0]}
            >
              <p class="text-sm text-red-700 bg-red-50 p-3 rounded-md text-center">
                {formErrors()?._errors[0]}
              </p>
            </Show>
            <div class="flex items-center justify-end space-x-4 pt-3">
              <A
                href="/dashboard/products"
                class={`min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300 ${
                  isUploadingImage() || productUpdateMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (isUploadingImage() || productUpdateMutation.isPending)
                    e.preventDefault();
                }}
              >
                Cancel
              </A>
              <button
                type="submit"
                disabled={isUploadingImage() || productUpdateMutation.isPending}
                class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploadingImage()
                  ? "Uploading..."
                  : productUpdateMutation.isPending
                  ? "Updating Product..."
                  : "Update Product"}
              </button>
            </div>
          </form>
        </Show>
      </div>
    </Show>
  );
}
