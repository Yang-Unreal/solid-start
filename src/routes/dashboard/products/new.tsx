// src/routes/dashboard/products/new.tsx
import { createSignal, Show, createEffect, For } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Product } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod/v4";

const PRODUCTS_QUERY_KEY_PREFIX = "products";
type CreateProductDBData = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "images"
> & { imageBaseUrl: string };

const NewProductFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Product name is required." }),
  description: z.string().trim().nullable().optional(),
  priceInCents: z.coerce
    .number({ message: "Price must be a number." })
    .int({ message: "Price must be a whole number (cents)." })
    .positive({ message: "Price must be a positive number." }),
  imageBaseUrl: z
    .string()
    .trim()
    .min(1, { message: "Product image is required." }),
  category: z.string().trim().nullable().optional(),
  stockQuantity: z.coerce
    .number({ message: "Stock quantity must be a number." })
    .int({ message: "Stock quantity must be an integer." })
    .min(0, { message: "Stock quantity cannot be negative." }),
  brand: z.string().trim().min(1, { message: "Brand is required." }),
  model: z.string().trim().min(1, { message: "Model is required." }),
  fuelType: z.string().trim().min(1, { message: "Fuel type is required." }),
});

type ProductFormValues = z.infer<typeof NewProductFormSchema>;

async function createProductInDB(
  newProduct: CreateProductDBData
): Promise<Product> {
  const fetchUrl = `/api/products`;
  const response = await fetch(fetchUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to parse error" }));
    throw new Error(errorData.error || `Error creating product`);
  }
  return response.json();
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = createSignal(false);

  createEffect(() => {
    const currentSession = session();
    if (!currentSession.isPending) {
      const user = currentSession.data?.user as { role?: string } | undefined;
      // This page is inside /dashboard, so the main layout already protects against non-logged-in users.
      // We just need to check the role here.
      if (user?.role === "admin") {
        setIsAuthorized(true);
      } else if (user) {
        // if user exists but is not admin
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

  const [imageFiles, setImageFiles] = createSignal<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = createSignal<string[]>([]);
  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<ProductFormValues> | null>(null);
  const [fileUploadError, setFileUploadError] = createSignal<string | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = createSignal(false);

  const productCreationMutation: UseMutationResult<
    Product,
    Error,
    CreateProductDBData
  > = useMutation(() => ({
    mutationFn: createProductInDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY_PREFIX] });
      navigate("/dashboard/products");
    },
    onError: (error: Error) => {
      setFormErrors({ _errors: [error.message] } as any);
    },
  }));

  const handleFileChange = (e: Event) => {
    const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
    if (files.length > 6) {
      setFileUploadError("You can upload a maximum of 6 images.");
      return;
    }
    setImageFiles(files);
    setImagePreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setFileUploadError(null); // Clear any previous file upload errors
  };

  // Clean up object URLs when component unmounts or imageFiles change
  createEffect(() => {
    const currentUrls = imagePreviewUrls();
    return () => {
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);
    setFileUploadError(null);

    if (imageFiles().length === 0) {
      setFileUploadError("At least one product image is required.");
      return;
    }

    setIsUploadingImage(true);
    let imageBaseUrl: string;
    try {
      const imageFormData = new FormData();
      imageFiles().forEach((file) => {
        imageFormData.append("files[]", file);
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });
      if (!uploadResponse.ok)
        throw new Error(
          (await uploadResponse.json()).error || "Image upload failed"
        );
      const uploadResult = (await uploadResponse.json()) as {
        imageBaseUrls: string[];
      };
      if (
        !uploadResult.imageBaseUrls ||
        uploadResult.imageBaseUrls.length === 0
      ) {
        throw new Error(
          "Image upload succeeded but no image URL was returned."
        );
      }
      imageBaseUrl = uploadResult.imageBaseUrls[0]!; // Get the single imageBaseUrl
    } catch (uploadError: any) {
      setFileUploadError(uploadError.message);
      setIsUploadingImage(false);
      return;
    }
    setIsUploadingImage(false);

    const validationResult = NewProductFormSchema.safeParse({
      name: name(),
      description: description(),
      priceInCents: priceInCentsInput(),
      category: category(),
      stockQuantity: stockQuantityInput(),
      brand: brand(),
      model: model(),
      fuelType: fuelType(),
      imageBaseUrl: imageBaseUrl, // Use the uploaded imageBaseUrl
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }

    const productDataForDB: CreateProductDBData = {
      ...validationResult.data,
      description: validationResult.data.description || null,
      category: validationResult.data.category || null,
    };

    productCreationMutation.mutate(productDataForDB);
  }; // Closing brace for handleSubmit

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
        <Title>Add New Product</Title>
      </MetaProvider>
      <div class="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8 mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-neutral-800">
          Create New Product
        </h1>
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
            />
            <Show when={fieldError("fuelType")}>
              <p class="mt-1 text-xs text-red-500">{fieldError("fuelType")}</p>
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
            />
            <Show when={fieldError("priceInCents")}>
              <p class="mt-1 text-xs text-red-500">
                {fieldError("priceInCents")}
              </p>
            </Show>
          </div>
          <div>
            <label class={labelBaseClasses}>
              Product Image <span class="text-red-500">*</span>
            </label>
            <div class="mt-2 space-y-4">
              <div class="grid grid-cols-3 gap-4">
                <Show
                  when={imagePreviewUrls().length > 0}
                  fallback={
                    <div class="col-span-3 w-full h-32 border-2 border-dashed border-neutral-300 rounded-md flex items-center justify-center text-neutral-500">
                      No Images
                    </div>
                  }
                >
                  <For each={imagePreviewUrls()}>
                    {(url, i) => (
                      <div class="relative w-full h-32">
                        <img
                          src={url}
                          alt={`Product Preview ${i() + 1}`}
                          class="w-full h-full object-cover rounded-md border border-neutral-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = imageFiles().filter(
                              (_, idx) => idx !== i()
                            );
                            setImageFiles(newFiles);
                            setImagePreviewUrls(
                              newFiles.map((file) => URL.createObjectURL(file))
                            );
                            setFileUploadError(null);
                          }}
                          class="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          aria-label={`Remove image ${i() + 1}`}
                          disabled={
                            isUploadingImage() ||
                            productCreationMutation.isPending
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </For>
                </Show>
              </div>
              <div class="flex items-center space-x-4">
                <label
                  for="productImage"
                  class={`flex-1 text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300 ${
                    isUploadingImage() || productCreationMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {imageFiles().length > 0
                    ? "Add/Change Images"
                    : "Upload Images"}
                  <input
                    id="productImage"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                    multiple
                    class="hidden"
                    onChange={handleFileChange}
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
                    }
                  />
                </label>
                <Show when={imageFiles().length > 0}>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFiles([]);
                      setImagePreviewUrls([]);
                      setFileUploadError(null);
                    }}
                    class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Remove all images"
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </Show>
              </div>
            </div>
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
            />
            <Show when={fieldError("category")}>
              <p class="mt-1 text-xs text-red-500">{fieldError("category")}</p>
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
              disabled={isUploadingImage() || productCreationMutation.isPending}
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
                isUploadingImage() || productCreationMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={(e) => {
                if (isUploadingImage() || productCreationMutation.isPending)
                  e.preventDefault();
              }}
            >
              Cancel
            </A>
            <button
              type="submit"
              disabled={isUploadingImage() || productCreationMutation.isPending}
              class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploadingImage()
                ? "Uploading Image..."
                : productCreationMutation.isPending
                ? "Adding Product..."
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </Show>
  );
}
