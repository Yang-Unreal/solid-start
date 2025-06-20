// src/routes/products/edit.tsx
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

// This interface is needed for the manual cache update
interface ApiResponse {
  data: Product[];
  pagination: unknown; // The exact pagination type doesn't matter for this fix
}

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

async function updateProductInDB(
  updatedProduct: Partial<CreateProductDBData> & { id: string }
): Promise<Product> {
  let baseUrl = "";
  if (typeof window !== "undefined") {
    baseUrl = window.location.origin;
  } else {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }
  const fetchUrl = `${baseUrl}/api/products?id=${updatedProduct.id}`;

  const response = await fetch(fetchUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProduct),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to parse error response from server" }));
    throw new Error(
      errorData.error ||
        `Error updating product: ${response.status} ${response.statusText}`
    );
  }
  const responseData = await response.json();
  return responseData.product as Product;
}

const EditProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();

  const [isAuthorized, setIsAuthorized] = createSignal(false);

  const params = useParams();
  const productId = () => params.id;

  const productQuery = useQuery(() => ({
    queryKey: ["product", productId()] as const,
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      if (!id) return null;
      const response = await fetch(`/api/products?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product for editing.");
      }
      const data = await response.json();
      return data.data as Product;
    },
    enabled: !!productId(),
    staleTime: 5 * 60 * 1000,
  }));

  const existingProduct = () => productQuery.data;

  createEffect(() => {
    const currentSession = session();
    if (!currentSession.isPending) {
      const user = currentSession.data?.user as { role?: string } | undefined;
      if (!user) {
        navigate("/login", { replace: true });
      } else if (user.role === "admin") {
        setIsAuthorized(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  });

  createEffect(() => {
    if (existingProduct()) {
      const product = existingProduct()!;
      setName(product.name);
      setDescription(product.description || "");
      setPriceInCentsInput(product.priceInCents.toString());
      setStockQuantityInput(product.stockQuantity.toString());
      setCategory(product.category || "");
      setBrand(product.brand);
      setModel(product.model);
      setFuelType(product.fuelType);
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

  const productUpdateMutation: UseMutationResult<
    Product,
    Error,
    Partial<CreateProductDBData> & { id: string }
  > = useMutation(() => ({
    mutationFn: updateProductInDB,
    // --- FIX START ---
    onSuccess: (updatedProduct) => {
      // Invalidate all queries starting with PRODUCTS_QUERY_KEY_PREFIX
      // to ensure the product list is refetched and up-to-date.
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY_PREFIX],
      });

      // Also manually update the specific cache entry for this product's detail view
      queryClient.setQueryData(["product", productId()], updatedProduct);

      // Now, navigate. The dashboard will render instantly with the correct data,
      // avoiding any network race conditions.
      navigate("/dashboard");
    },
    // --- FIX END ---
    onError: (error: Error) => {
      setFormErrors({
        _errors: [
          error.message ||
            "An unknown error occurred while updating the product entry.",
        ],
      } as any);
    },
  }));

  const handleFileChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileUploadError(null);
    } else {
      setSelectedFile(null);
    }
    setFormErrors(null);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);
    setFileUploadError(null);

    const formDataToValidate = {
      name: name(),
      description: description(),
      priceInCents: priceInCentsInput(),
      category: category(),
      stockQuantity: stockQuantityInput(),
      brand: brand(),
      model: model(),
      fuelType: fuelType(),
    };

    const validationResult = NewProductFormSchema.safeParse(formDataToValidate);

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }
    const validatedFormData = validationResult.data;

    let imagesToSave: ProductImages | undefined;

    if (selectedFile()) {
      setIsUploadingImage(true);
      const imageFormData = new FormData();
      imageFormData.append("file", selectedFile()!);
      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });
        if (!uploadResponse.ok) {
          const errData = await uploadResponse.json().catch(() => ({
            error: "Failed to parse image upload error response",
          }));
          throw new Error(
            errData.error || `Image upload failed: ${uploadResponse.status}`
          );
        }
        const uploadResult = (await uploadResponse.json()) as {
          images: ProductImages;
        };
        if (uploadResult.images) {
          imagesToSave = uploadResult.images;
        } else {
          throw new Error(
            "Image uploaded, but the image URL structure was not returned."
          );
        }
      } catch (uploadError: any) {
        setFileUploadError(uploadError.message || "Image upload failed.");
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
      }
    } else if (existingProduct()?.images) {
      // If no new file is selected, but there's an existing product with images,
      // use the existing images.
      imagesToSave = existingProduct()!.images;
    }

    const productDataForDB: Partial<CreateProductDBData> = {
      name: validatedFormData.name,
      description: validatedFormData.description || null,
      priceInCents: validatedFormData.priceInCents,
      category: validatedFormData.category || null,
      stockQuantity: validatedFormData.stockQuantity,
      brand: validatedFormData.brand,
      model: validatedFormData.model,
      fuelType: validatedFormData.fuelType,
      images: imagesToSave, // Assign the determined imagesToSave
    };

    // Ensure images is not undefined if it's a required field in the schema
    if (!productDataForDB.images) {
      setFormErrors({
        _errors: ["Product image is required."],
      } as any);
      return;
    }

    productUpdateMutation.mutate({ id: productId()!, ...productDataForDB });
  };

  const inputBaseClasses = `block w-full mt-1 py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black`;
  const labelBaseClasses = `block text-sm font-medium text-neutral-700`;
  const fileInputClasses = `mt-1 block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed`;

  const fieldError = (fieldName: keyof ProductFormValues) =>
    formErrors()?.[fieldName]?._errors[0];

  return (
    <>
      <Show when={session().isPending && !isAuthorized()}>
        <div class="flex justify-center items-center min-h-screen">
          <p class="text-xl">Loading session...</p>
        </div>
      </Show>
      <Show when={!session().isPending && isAuthorized()}>
        <MetaProvider>
          <Title>Edit Product</Title>
          <main class="bg-neutral-100 p-4 sm:p-6 lg:p-8 flex justify-center items-start min-h-screen">
            <div class="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8">
              <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-neutral-800">
                Edit Product
              </h1>
              <Show when={productQuery.isLoading}>
                <p class="text-center text-neutral-600">
                  Loading product data...
                </p>
              </Show>
              <Show when={productQuery.isError}>
                <p class="text-center text-red-500">
                  Error: {productQuery.error?.message}
                </p>
              </Show>
              <Show when={productQuery.isSuccess && !existingProduct()}>
                <p class="text-center text-neutral-600">
                  Product not found or invalid ID.
                </p>
              </Show>
              <Show when={productQuery.isSuccess && existingProduct()}>
                <form onSubmit={handleSubmit} class="space-y-5">
                  {/* --- Standard Fields --- */}
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={fieldError("name")}>
                      <p class="mt-1 text-xs text-red-500">
                        {fieldError("name")}
                      </p>
                    </Show>
                  </div>

                  {/* --- New Fields --- */}
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={fieldError("brand")}>
                      <p class="mt-1 text-xs text-red-500">
                        {fieldError("brand")}
                      </p>
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={fieldError("model")}>
                      <p class="mt-1 text-xs text-red-500">
                        {fieldError("model")}
                      </p>
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
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
                      onInput={(e) =>
                        setPriceInCentsInput(e.currentTarget.value)
                      }
                      class={inputBaseClasses}
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={fieldError("priceInCents")}>
                      <p class="mt-1 text-xs text-red-500">
                        {fieldError("priceInCents")}
                      </p>
                    </Show>
                  </div>

                  {/* --- Image Upload --- */}
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={existingProduct()?.images}>
                      {(images) => (
                        <div class="mt-2">
                          <p class="text-xs text-neutral-700">Current Image:</p>
                          <img
                            src={images().thumbnail.jpeg}
                            alt="Current Product"
                            class="w-24 h-auto rounded-md object-cover mt-1"
                          />
                        </div>
                      )}
                    </Show>
                    <Show when={selectedFile() && !fileUploadError()}>
                      <p class="mt-1 text-xs text-neutral-700">
                        Selected: {selectedFile()!.name} (
                        {(selectedFile()!.size / 1024).toFixed(2)} KB)
                      </p>
                    </Show>
                    <Show when={fileUploadError()}>
                      <p class="mt-1 text-xs text-red-500">
                        {fileUploadError()}
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
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
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
                      onInput={(e) =>
                        setStockQuantityInput(e.currentTarget.value)
                      }
                      class={inputBaseClasses}
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                    />
                    <Show when={fieldError("stockQuantity")}>
                      <p class="mt-1 text-xs text-red-500">
                        {fieldError("stockQuantity")}
                      </p>
                    </Show>
                  </div>

                  {/* --- Form-level Error --- */}
                  <Show
                    when={
                      formErrors()?._errors?.length && formErrors()?._errors[0]
                    }
                  >
                    <p class="text-sm text-red-700 bg-red-50 p-3 rounded-md text-center">
                      {formErrors()?._errors[0]}
                    </p>
                  </Show>

                  {/* --- Action Buttons --- */}
                  <div class="flex items-center justify-end space-x-4 pt-3">
                    <A
                      href="/dashboard"
                      class={`min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300 ${
                        isUploadingImage() || productUpdateMutation.isPending
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={(e) => {
                        if (
                          isUploadingImage() ||
                          productUpdateMutation.isPending
                        )
                          e.preventDefault();
                      }}
                    >
                      Cancel
                    </A>
                    <button
                      type="submit"
                      disabled={
                        isUploadingImage() || productUpdateMutation.isPending
                      }
                      class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage()
                        ? "Uploading Image..."
                        : productUpdateMutation.isPending
                        ? "Updating Product..."
                        : "Update Product"}
                    </button>
                  </div>
                </form>
              </Show>
            </div>
          </main>
        </MetaProvider>
      </Show>
    </>
  );
};
export default EditProductPage;
