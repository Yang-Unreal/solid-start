// src/routes/dashboard/products/[id]/edit.tsx
import { createSignal, Show, createEffect, For } from "solid-js";
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

const getTransformedImageUrl = (
  originalUrl: string | undefined,
  width: number,
  height: number,
  format: string
) => {
  if (!originalUrl) return `https://via.placeholder.com/${width}x${height}`;
  return `/api/images/transform?url=${encodeURIComponent(
    originalUrl
  )}&w=${width}&h=${height}&f=${format}`;
};

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

  type ImageInForm = {
    id: string; // Unique ID for the image in the form
    file?: File; // File object if newly selected/replaced
    previewUrl: string; // URL for display (object URL for new, MinIO URL for existing)
    isExisting: boolean; // True if this image came from the database
    originalMinioUrl?: string; // The original MinIO URL if it's an existing image
  };
  const [imagesInForm, setImagesInForm] = createSignal<ImageInForm[]>([]);

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

      // Populate imagesInForm with existing product images
      if (product.images && product.images.length > 0) {
        const existingImages: ImageInForm[] = product.images.map((url) => ({
          id: crypto.randomUUID(), // Assign a unique ID for form management
          previewUrl: getTransformedImageUrl(url, 96, 64, "jpeg"), // Use transformed URL for preview
          isExisting: true,
          originalMinioUrl: url, // Store original URL for submission
        }));
        setImagesInForm(existingImages);
      }
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
    const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
    const currentImages = imagesInForm();
    const newImages: ImageInForm[] = [];

    if (currentImages.length + files.length > 6) {
      setFileUploadError("You can upload a maximum of 6 product images.");
      return;
    }

    files.forEach((file) => {
      const id = crypto.randomUUID(); // Generate a unique ID for each image
      const previewUrl = URL.createObjectURL(file);
      newImages.push({ id, file, previewUrl, isExisting: false });
    });

    setImagesInForm([...currentImages, ...newImages]);
    setFileUploadError(null); // Clear any previous file upload errors
  };

  const handleDeleteImage = (id: string) => {
    setImagesInForm((prev) => {
      const imageToDelete = prev.find((img) => img.id === id);
      if (imageToDelete && imageToDelete.file) {
        URL.revokeObjectURL(imageToDelete.previewUrl); // Clean up the object URL for new files
      }
      return prev.filter((img) => img.id !== id);
    });
    setFileUploadError(null); // Clear error if images are now valid count
  };

  const handleReplaceImage = (idToReplace: string, e: Event) => {
    const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
    if (files.length === 0) return;

    const newFile = files[0];
    if (!newFile) return; // Ensure newFile is not undefined

    setImagesInForm((prev) => {
      return prev.map((img) => {
        if (img.id === idToReplace) {
          if (img.file) URL.revokeObjectURL(img.previewUrl); // Clean up old object URL if it was a new file
          return {
            id: img.id,
            file: newFile,
            previewUrl: URL.createObjectURL(newFile),
            isExisting: false, // This is now a new file
            originalMinioUrl: undefined,
          };
        }
        return img;
      });
    });
    setFileUploadError(null);
  };

  // Clean up object URLs when component unmounts
  createEffect(() => {
    return () => {
      imagesInForm().forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.previewUrl);
      });
    };
  });

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
    if (imagesInForm().length === 0) {
      setFileUploadError(
        "At least one product image is required (1-6 images)."
      );
      return;
    }
    if (imagesInForm().length > 6) {
      setFileUploadError("You can upload a maximum of 6 product images.");
      return;
    }

    setIsUploadingImage(true);
    let finalImageUrls: ProductImages = [];

    try {
      const filesToUpload = imagesInForm().filter(
        (img) => !img.isExisting || img.file
      );
      const existingUrls = imagesInForm()
        .filter((img) => img.isExisting && !img.file)
        .map((img) => img.originalMinioUrl!);

      if (filesToUpload.length > 0) {
        const imageFormData = new FormData();
        filesToUpload.forEach((img) => {
          if (img.file) imageFormData.append("files[]", img.file);
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
        finalImageUrls = [...existingUrls, ...uploadResult.images];
      } else {
        finalImageUrls = existingUrls;
      }
    } catch (uploadError: any) {
      setFileUploadError(uploadError.message);
      return;
    } finally {
      setIsUploadingImage(false);
    }

    if (finalImageUrls.length === 0) {
      setFileUploadError("Product image is required.");
      return;
    }

    productUpdateMutation.mutate({
      id: productId()!,
      ...validationResult.data,
      images: finalImageUrls,
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
              <label class={labelBaseClasses}>
                Product Images (1-6) <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                <For each={imagesInForm()}>
                  {(image) => (
                    <div class="relative group">
                      <picture>
                        <source
                          srcset={getTransformedImageUrl(
                            image.originalMinioUrl || image.previewUrl,
                            96,
                            64,
                            "avif"
                          )}
                          type="image/avif"
                        />
                        <source
                          srcset={getTransformedImageUrl(
                            image.originalMinioUrl || image.previewUrl,
                            96,
                            64,
                            "webp"
                          )}
                          type="image/webp"
                        />
                        <img
                          src={getTransformedImageUrl(
                            image.originalMinioUrl || image.previewUrl,
                            96,
                            64,
                            "jpeg"
                          )}
                          alt="Product Preview"
                          class="w-full h-32 object-cover rounded-md border border-neutral-300"
                        />
                      </picture>
                      <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors mr-2"
                          aria-label="Delete image"
                          disabled={
                            isUploadingImage() ||
                            productUpdateMutation.isPending
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
                            productUpdateMutation.isPending
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
                              productUpdateMutation.isPending
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </For>
                <Show when={imagesInForm().length < 6}>
                  <label
                    for="productImage"
                    class={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-neutral-50 hover:bg-neutral-100 transition-colors duration-150 ease-in-out ${
                      isUploadingImage() || productUpdateMutation.isPending
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
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                  </label>
                </Show>
              </div>
              <Show when={fileUploadError()}>
                <p class="mt-1 text-xs text-red-500">{fileUploadError()}</p>
              </Show>
              <Show when={imagesInForm().length > 0}>
                <p class="mt-1 text-xs text-neutral-700">
                  Total selected: {imagesInForm().length} image(s) (
                  {(
                    imagesInForm().reduce(
                      (sum, img) => sum + (img.file?.size || 0),
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
