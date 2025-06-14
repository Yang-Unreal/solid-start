// src/routes/products/new.tsx
import { createSignal, Show, createEffect } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
// Import the new types from your schema definition if they are exported
import type { Product, ProductImages } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod/v4";

const PRODUCTS_QUERY_KEY_PREFIX = "products";

// Use the new schema types, excluding server-generated fields
type CreateProductDBData = Omit<Product, "id" | "createdAt" | "updatedAt">;

// Updated Zod schema with new fields
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
  // Add new required fields
  brand: z.string().trim().min(1, { message: "Brand is required." }),
  model: z.string().trim().min(1, { message: "Model is required." }),
  fuelType: z.string().trim().min(1, { message: "Fuel type is required." }),
});

type ProductFormValues = z.infer<typeof NewProductFormSchema>;

async function createProductInDB(
  newProduct: CreateProductDBData
): Promise<Product> {
  let baseUrl = "";
  if (import.meta.env.SSR && typeof window === "undefined") {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }
  const fetchUrl = `${baseUrl}/api/products`;

  const response = await fetch(fetchUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProduct),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to parse error response from server" }));
    throw new Error(
      errorData.error ||
        `Error creating product: ${response.status} ${response.statusText}`
    );
  }
  const responseData = await response.json();
  return responseData as Product;
}

const AddProductPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = createSignal(false);

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

  // Form state signals
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [priceInCentsInput, setPriceInCentsInput] = createSignal("");
  const [stockQuantityInput, setStockQuantityInput] = createSignal("");
  const [category, setCategory] = createSignal("");
  const [brand, setBrand] = createSignal("");
  const [model, setModel] = createSignal("");
  const [fuelType, setFuelType] = createSignal("");
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);

  // Error and status signals
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
      navigate("/dashboard"); // Navigate to dashboard or products list
    },
    onError: (error: Error) => {
      setFormErrors({
        _errors: [
          error.message ||
            "An unknown error occurred while creating the product entry.",
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

    // Validate all form fields including new ones
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

    // The form is now invalid if no file is selected
    if (!selectedFile()) {
      setFileUploadError("A product image is required.");
      return;
    }

    let uploadedImages: ProductImages | null = null;
    setIsUploadingImage(true);
    const imageFormData = new FormData();
    imageFormData.append("file", selectedFile()!); // Use 'file' to match server
    try {
      // Assuming /api/upload now processes the image and returns a ProductImages object
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
        uploadedImages = uploadResult.images;
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

    // Construct the final data object for the database
    const productDataForDB: CreateProductDBData = {
      name: validatedFormData.name,
      description: validatedFormData.description || null,
      priceInCents: validatedFormData.priceInCents,
      images: uploadedImages!, // The image object is now required
      category: validatedFormData.category || null,
      stockQuantity: validatedFormData.stockQuantity,
      brand: validatedFormData.brand,
      model: validatedFormData.model,
      fuelType: validatedFormData.fuelType,
    };
    productCreationMutation.mutate(productDataForDB);
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
          <Title>Add New Product</Title>
          <main class="bg-neutral-100 p-4 sm:p-6 lg:p-8 flex justify-center items-start min-h-screen">
            <div class="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8">
              <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-neutral-800">
                Create New Product
              </h1>
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
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
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
                    onInput={(e) => setPriceInCentsInput(e.currentTarget.value)}
                    class={inputBaseClasses}
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
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
                    Product Image <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="productImage"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                    class={fileInputClasses}
                    onChange={handleFileChange}
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
                    }
                  />
                  <Show when={selectedFile() && !fileUploadError()}>
                    <p class="mt-1 text-xs text-neutral-700">
                      Selected: {selectedFile()!.name} (
                      {(selectedFile()!.size / 1024).toFixed(2)} KB)
                    </p>
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
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
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
                      isUploadingImage() || productCreationMutation.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (
                        isUploadingImage() ||
                        productCreationMutation.isPending
                      )
                        e.preventDefault();
                    }}
                  >
                    Cancel
                  </A>
                  <button
                    type="submit"
                    disabled={
                      isUploadingImage() || productCreationMutation.isPending
                    }
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
          </main>
        </MetaProvider>
      </Show>
    </>
  );
};
export default AddProductPage;
