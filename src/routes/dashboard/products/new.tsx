// src/routes/dashboard/products/new.tsx
import { createSignal, Show, createEffect, For } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Product, ProductImages } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod/v4";

const PRODUCTS_QUERY_KEY_PREFIX = "products";
type CreateProductDBData = Omit<Product, "id" | "createdAt" | "updatedAt">;

const NewProductFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Product name is required." }),
  description: z.string().trim().optional(),
  priceInCents: z.coerce
    .number({ message: "Price must be a number." })
    .int({ message: "Price must be a whole number (cents)." })
    .positive({ message: "Price must be a positive number." }),
  category: z.string().trim().optional(),
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

  type ImageWithPreview = {
    id: string; // Unique ID for the image in the form
    file: File;
    previewUrl: string;
  };
  const [imagesToUpload, setImagesToUpload] = createSignal<ImageWithPreview[]>(
    []
  );

  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<ProductFormValues> | null>(null);
  const [filesUploadError, setFilesUploadError] = createSignal<string | null>(
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
    const currentImages = imagesToUpload();
    const newImages: ImageWithPreview[] = [];

    if (currentImages.length + files.length > 6) {
      setFilesUploadError("You can upload a maximum of 6 product images.");
      return;
    }

    files.forEach((file) => {
      const id = crypto.randomUUID(); // Generate a unique ID for each image
      const previewUrl = URL.createObjectURL(file);
      newImages.push({ id, file, previewUrl });
    });

    setImagesToUpload([...currentImages, ...newImages]);
    setFilesUploadError(null); // Clear any previous file upload errors
  };

  const handleDeleteImage = (id: string) => {
    setImagesToUpload((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.previewUrl); // Clean up the object URL
      }
      return prev.filter((img) => img.id !== id);
    });
    setFilesUploadError(null); // Clear error if images are now valid count
  };

  const handleReplaceImage = (idToReplace: string, e: Event) => {
    const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
    if (files.length === 0) return;

    const newFile = files[0];
    if (!newFile) return; // Ensure newFile is not undefined

    setImagesToUpload((prev) => {
      return prev.map((img) => {
        if (img.id === idToReplace) {
          URL.revokeObjectURL(img.previewUrl); // Clean up old object URL
          return {
            id: img.id,
            file: newFile,
            previewUrl: URL.createObjectURL(newFile),
          };
        }
        return img;
      });
    });
    setFilesUploadError(null);
  };

  // Clean up object URLs when component unmounts
  createEffect(() => {
    return () => {
      imagesToUpload().forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);
    setFilesUploadError(null);

    const validationResult = NewProductFormSchema.safeParse({
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
    if (imagesToUpload().length === 0) {
      setFilesUploadError(
        "At least one product image is required (1-6 images)."
      );
      return;
    }
    if (imagesToUpload().length > 6) {
      setFilesUploadError("You can upload a maximum of 6 product images.");
      return;
    }
    setIsUploadingImage(true);
    let uploadedImages: ProductImages;
    try {
      const imageFormData = new FormData();
      imagesToUpload().forEach((img) => {
        imageFormData.append("files[]", img.file);
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
        images: ProductImages;
      };
      uploadedImages = uploadResult.images;
    } catch (uploadError: any) {
      setFilesUploadError(uploadError.message);
      setIsUploadingImage(false);
      return;
    }
    setIsUploadingImage(false);

    const productDataForDB: CreateProductDBData = {
      ...validationResult.data,
      images: uploadedImages,
      description: validationResult.data.description || null,
      category: validationResult.data.category || null,
    };
    productCreationMutation.mutate(productDataForDB);
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
              Product Images (1-6) <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              <For each={imagesToUpload()}>
                {(image) => (
                  <div class="relative group">
                    <img
                      src={image.previewUrl}
                      alt="Product Preview"
                      class="w-full h-32 object-cover rounded-md border border-neutral-300"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors mr-2"
                        aria-label="Delete image"
                        disabled={
                          isUploadingImage() ||
                          productCreationMutation.isPending
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
                      <label
                        for={`replace-image-${image.id}`}
                        class={`p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer ${
                          isUploadingImage() ||
                          productCreationMutation.isPending
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                        </svg>
                        <input
                          id={`replace-image-${image.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                          class="hidden"
                          onChange={(e) => handleReplaceImage(image.id, e)}
                          disabled={
                            isUploadingImage() ||
                            productCreationMutation.isPending
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
              </For>
              <Show when={imagesToUpload().length < 6}>
                <label
                  for="productImage"
                  class={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors duration-150 ease-in-out ${
                    isUploadingImage() || productCreationMutation.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : "border-neutral-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span class="mt-2 text-sm text-neutral-600">Add Image</span>
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
              </Show>
            </div>
            <Show when={filesUploadError()}>
              <p class="mt-1 text-xs text-red-500">{filesUploadError()}</p>
            </Show>
            <Show when={imagesToUpload().length > 0}>
              <p class="mt-1 text-xs text-neutral-700">
                Total selected: {imagesToUpload().length} image(s) (
                {(
                  imagesToUpload().reduce(
                    (sum, img) => sum + img.file.size,
                    0
                  ) / 1024
                ).toFixed(2)}{" "}
                KB)
              </p>
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
