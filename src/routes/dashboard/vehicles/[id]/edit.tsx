// src/routes/dashboard/vehicles/[id]/edit.tsx
import {
  createSignal,
  Show,
  createEffect,
  For,
  Index,
  createResource,
} from "solid-js";
import { useNavigate, useParams, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Vehicle, Photo, Feature } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod";
import { powertrainTypeEnum } from "~/db/schema";

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

// Using the same schema as the `new` page, but all fields are optional for update
const EditVehicleFormSchema = z
  .object({
    brand: z.string().trim().min(1, "Brand is required."),
    model: z.string().trim().min(1, "Model is required."),
    price: z.coerce.number().positive("Price must be a positive number."),
    date_of_manufacture: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1),
    mileage: z.coerce.number().int().nonnegative("Mileage cannot be negative."),
    horsepower: z.coerce
      .number()
      .int()
      .positive("Horsepower must be positive."),
    top_speed_kph: z.coerce
      .number()
      .int()
      .positive("Top speed must be positive."),
    acceleration_0_100_sec: z.coerce
      .number()
      .positive("Acceleration must be positive."),
    transmission: z.string().trim().min(1, "Transmission type is required."),
    weight_kg: z.coerce.number().int().positive("Weight must be positive."),
    exterior: z.string().trim().min(1, "Exterior description is required."),
    interior: z.string().trim().min(1, "Interior description is required."),
    seating: z.coerce
      .number()
      .int()
      .positive("Seating capacity must be positive."),
    warranty: z.string().trim().min(1, "Warranty details are required."),
    maintenance_booklet: z.boolean(),
    powertrain_type: z.enum(powertrainTypeEnum.enumValues),
    general_description: z.string().trim().optional(),
    specification_description: z.string().trim().optional(),
    appearance_title: z.string().trim().optional(),
    appearance_description: z.string().trim().optional(),
    feature_description: z.string().trim().optional(),
  })
  .partial();

type VehicleFormValues = z.infer<typeof EditVehicleFormSchema>;

// This will be a more complex type now
interface FullVehicleData extends Vehicle {
  photos: Photo[];
  gasoline_powertrain?: any;
  electric_powertrain?: any;
  hybrid_powertrain?: any;
  features?: { feature: Feature }[];
}

interface ApiResponse {
  data: FullVehicleData[];
}

async function updateVehicleInDB(
  updatedVehicle: Partial<VehicleFormValues> & {
    id: string;
    photos?: { photo_url: string; display_order: number }[];
    features?: { name: string; category: string }[];
  }
): Promise<Vehicle> {
  const fetchUrl = `/api/vehicles?id=${updatedVehicle.id}`;
  const response = await fetch(fetchUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedVehicle),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error updating vehicle`);
  }
  return (await response.json()).vehicle as Vehicle;
}

export default function EditVehiclePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const params = useParams();
  const vehicleId = () => params.id;
  const [isAuthorized, setIsAuthorized] = createSignal(false);

  const vehicleQuery = useQuery(() => ({
    queryKey: ["vehicle", vehicleId()] as const,
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey;
      if (!id) return null;

      let baseUrl = "";
      if (import.meta.env.SSR) {
        baseUrl =
          import.meta.env.VITE_INTERNAL_API_ORIGIN ||
          `http://localhost:${process.env.PORT || 3000}`;
      }

      const fetchUrl = `${baseUrl}/api/vehicles?id=${id}`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Failed to fetch vehicle for editing.");
      return (await response.json()) as ApiResponse;
    },
    enabled: !!vehicleId(),
  }));

  const existingVehicle = () => vehicleQuery.data?.data?.[0];

  const [formValues, setFormValues] = createSignal<Partial<VehicleFormValues>>(
    {}
  );
  const [powertrainSpecificValues, setPowertrainSpecificValues] =
    createSignal<any>({});
  const [imageFiles, setImageFiles] = createSignal<(File | null)[]>([]);
  const [imagePreviews, setImagePreviews] = createSignal<string[]>([]);
  const [newImageFiles, setNewImageFiles] = createSignal<File[]>([]);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = createSignal<string[]>(
    []
  );
  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<VehicleFormValues> | null>(null);
  const [fileUploadError, setFileUploadError] = createSignal<string | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = createSignal(false);

  const [featuresList, setFeaturesList] = createSignal<
    { name: string; category: string }[]
  >([]);

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

  createEffect(() => {
    const currentUrls = newImagePreviewUrls();
    return () => {
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  });

  createEffect(() => {
    const vehicle = existingVehicle();
    if (vehicle) {
      // Transform vehicle data to replace null with undefined for form compatibility
      const transformedVehicle: Partial<VehicleFormValues> = {
        brand: vehicle.brand ?? undefined,
        model: vehicle.model ?? undefined,
        price: vehicle.price ? Number(vehicle.price) : undefined,
        date_of_manufacture: vehicle.date_of_manufacture ?? undefined,
        mileage: vehicle.mileage ?? undefined,
        horsepower: vehicle.horsepower ?? undefined,
        top_speed_kph: vehicle.top_speed_kph ?? undefined,
        acceleration_0_100_sec: vehicle.acceleration_0_100_sec
          ? Number(vehicle.acceleration_0_100_sec)
          : undefined,
        transmission: vehicle.transmission ?? undefined,
        weight_kg: vehicle.weight_kg ?? undefined,
        exterior: vehicle.exterior ?? undefined,
        interior: vehicle.interior ?? undefined,
        seating: vehicle.seating ?? undefined,
        warranty: vehicle.warranty ?? undefined,
        maintenance_booklet: vehicle.maintenance_booklet ?? undefined,
        powertrain_type: vehicle.powertrain_type ?? undefined,
        general_description: vehicle.general_description ?? undefined,
        specification_description:
          vehicle.specification_description ?? undefined,
        appearance_title: vehicle.appearance_title ?? undefined,
        appearance_description: vehicle.appearance_description ?? undefined,
        feature_description: vehicle.feature_description ?? undefined,
      };
      setFormValues(transformedVehicle);
      // Set powertrain specific values
      if (
        vehicle.powertrain_type === "Gasoline" &&
        vehicle.gasoline_powertrain
      ) {
        setPowertrainSpecificValues(vehicle.gasoline_powertrain);
      } else if (
        vehicle.powertrain_type === "Electric" &&
        vehicle.electric_powertrain
      ) {
        setPowertrainSpecificValues(vehicle.electric_powertrain);
      } else if (
        vehicle.powertrain_type === "Hybrid" &&
        vehicle.hybrid_powertrain
      ) {
        setPowertrainSpecificValues(vehicle.hybrid_powertrain);
      }

      if (vehicle.photos) {
        const existingPhotos = vehicle.photos
          .filter((p) => p.photo_url !== null && p.display_order !== null)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

        setImagePreviews(existingPhotos.map((p) => p.photo_url!));
        // Initialize imageFiles array with null values for each existing image
        setImageFiles(new Array(existingPhotos.length).fill(null));
      }

      if (vehicle.features) {
        setFeaturesList(
          vehicle.features
            .filter(
              (vf) => vf.feature.feature_name && vf.feature.feature_category
            )
            .map((vf) => ({
              name: vf.feature.feature_name!,
              category: vf.feature.feature_category!,
            }))
        );
      }
    }
  });

  const vehicleUpdateMutation: UseMutationResult<
    Vehicle,
    Error,
    Partial<VehicleFormValues> & { id: string }
  > = useMutation(() => ({
    mutationFn: updateVehicleInDB,
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY_PREFIX] });
      queryClient.setQueryData(["vehicle", vehicleId()], {
        data: [updatedVehicle],
      });
      navigate("/dashboard/vehicles");
    },
    onError: (error: Error) => {
      setFormErrors({ _errors: [error.message] } as any);
    },
  }));

  const handleFileChange = (e: Event, index: number) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      const currentFiles = imageFiles();
      const currentPreviews = imagePreviews();

      // Ensure the arrays are long enough
      const newFiles = [...currentFiles];
      const newPreviews = [...currentPreviews];

      // Extend arrays if necessary
      while (newFiles.length <= index) {
        newFiles.push(null);
      }
      while (newPreviews.length <= index) {
        newPreviews.push("");
      }

      // Clean up previous blob URL if it exists
      if (newPreviews[index]?.startsWith("blob:")) {
        URL.revokeObjectURL(newPreviews[index]);
      }

      // Update with new file and preview
      newFiles[index] = file;
      newPreviews[index] = URL.createObjectURL(file);

      setImageFiles(newFiles);
      setImagePreviews(newPreviews);
      setFileUploadError(null);
    }
  };

  const handleNewFileChange = (e: Event) => {
    const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
    if (files.length > 0) {
      const currentNewFiles = newImageFiles();
      const currentNewUrls = newImagePreviewUrls();

      const newFiles = [...currentNewFiles, ...files];
      const newUrls = [
        ...currentNewUrls,
        ...files.map((file) => URL.createObjectURL(file)),
      ];

      setNewImageFiles(newFiles);
      setNewImagePreviewUrls(newUrls);
      setFileUploadError(null);
    }
  };

  const removeNewImage = (index: number) => {
    const currentFiles = newImageFiles();
    const currentUrls = newImagePreviewUrls();

    const newFiles = currentFiles.filter((_, i) => i !== index);
    const newUrls = currentUrls.filter((_, i) => i !== index);

    // Revoke the object URL to free memory
    if (currentUrls[index]) {
      URL.revokeObjectURL(currentUrls[index]);
    }

    setNewImageFiles(newFiles);
    setNewImagePreviewUrls(newUrls);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);
    setFileUploadError(null);

    const validationResult = EditVehicleFormSchema.safeParse(formValues());

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }

    let updatedPhotos =
      existingVehicle()
        ?.photos?.filter((p) => p.photo_url !== null)
        .map((p) => p.photo_url!) || [];

    // Handle replaced existing images
    const replacedFiles = imageFiles().filter((f) => f !== null);
    const newFiles = newImageFiles();

    const hasFilesToUpload = replacedFiles.length > 0 || newFiles.length > 0;

    if (hasFilesToUpload) {
      setIsUploadingImage(true);
      try {
        const imageFormData = new FormData();

        // Add replaced files
        replacedFiles.forEach((file) => {
          if (file) imageFormData.append("files[]", file);
        });

        // Add new files
        newFiles.forEach((file) => {
          imageFormData.append("files[]", file);
        });

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            (await uploadResponse.json()).error || "Image upload failed"
          );
        }
        const uploadResult = (await uploadResponse.json()) as {
          imageUrls: string[];
        };

        // Replace existing photos with new ones where files were provided
        const newUrls = uploadResult.imageUrls;
        let urlIndex = 0;

        // Update replaced images
        const finalPhotos = [...updatedPhotos];
        imageFiles().forEach((file, index) => {
          if (file && urlIndex < newUrls.length && newUrls[urlIndex]) {
            finalPhotos[index] = newUrls[urlIndex]!;
            urlIndex++;
          }
        });

        // Add new images
        while (urlIndex < newUrls.length && newUrls[urlIndex]) {
          finalPhotos.push(newUrls[urlIndex]!);
          urlIndex++;
        }

        updatedPhotos = finalPhotos;
      } catch (uploadError: any) {
        setFileUploadError(uploadError.message);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    const vehicleDataForDB = {
      id: vehicleId()!,
      ...validationResult.data,
      ...powertrainSpecificValues(),
      photos: updatedPhotos.map((url, i) => ({
        photo_url: url,
        display_order: i + 1,
      })),
      features: featuresList(),
    };

    vehicleUpdateMutation.mutate(vehicleDataForDB);
  };

  // ... JSX for the form, similar to new.tsx but populated with existing data
  // This part is getting very long, so I will omit the full JSX for brevity.
  // It will be almost identical to new.tsx, but using `vehicleQuery` to show data and loading/error states.

  const inputBaseClasses = `block w-full mt-1 py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black`;
  const labelBaseClasses = `block text-sm font-medium text-neutral-700`;

  return (
    <Show when={isAuthorized()} fallback={<div>Authorizing...</div>}>
      <MetaProvider>
        <Title>Edit Vehicle</Title>
      </MetaProvider>
      <div class="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8 mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Edit Vehicle
        </h1>
        <Show when={vehicleQuery.isLoading}>
          <p>Loading...</p>
        </Show>
        <Show when={vehicleQuery.isError}>
          <p>Error loading vehicle.</p>
        </Show>
        <Show when={existingVehicle()}>
          <form onSubmit={handleSubmit} class="space-y-5">
            {/* Core Vehicle Data */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="brand" class={labelBaseClasses}>
                  Brand <span class="text-red-500">*</span>
                </label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formValues().brand || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      brand: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.brand?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.brand?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="model" class={labelBaseClasses}>
                  Model <span class="text-red-500">*</span>
                </label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  value={formValues().model || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      model: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.model?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.model?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="price" class={labelBaseClasses}>
                  Price <span class="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formValues().price || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      price: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.price?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.price?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="date_of_manufacture" class={labelBaseClasses}>
                  Date of Manufacture <span class="text-red-500">*</span>
                </label>
                <input
                  id="date_of_manufacture"
                  name="date_of_manufacture"
                  type="number"
                  value={formValues().date_of_manufacture || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      date_of_manufacture: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.date_of_manufacture?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.date_of_manufacture?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="mileage" class={labelBaseClasses}>
                  Mileage <span class="text-red-500">*</span>
                </label>
                <input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formValues().mileage || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      mileage: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.mileage?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.mileage?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="horsepower" class={labelBaseClasses}>
                  Horsepower <span class="text-red-500">*</span>
                </label>
                <input
                  id="horsepower"
                  name="horsepower"
                  type="number"
                  value={formValues().horsepower || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      horsepower: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.horsepower?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.horsepower?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="top_speed_kph" class={labelBaseClasses}>
                  Top Speed (kph) <span class="text-red-500">*</span>
                </label>
                <input
                  id="top_speed_kph"
                  name="top_speed_kph"
                  type="number"
                  value={formValues().top_speed_kph || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      top_speed_kph: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.top_speed_kph?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.top_speed_kph?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="acceleration_0_100_sec" class={labelBaseClasses}>
                  Acceleration 0-100 (sec) <span class="text-red-500">*</span>
                </label>
                <input
                  id="acceleration_0_100_sec"
                  name="acceleration_0_100_sec"
                  type="number"
                  step="0.1"
                  value={formValues().acceleration_0_100_sec || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      acceleration_0_100_sec: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.acceleration_0_100_sec?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.acceleration_0_100_sec?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="transmission" class={labelBaseClasses}>
                  Transmission <span class="text-red-500">*</span>
                </label>
                <input
                  id="transmission"
                  name="transmission"
                  type="text"
                  value={formValues().transmission || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      transmission: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.transmission?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.transmission?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="weight_kg" class={labelBaseClasses}>
                  Weight (kg) <span class="text-red-500">*</span>
                </label>
                <input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  value={formValues().weight_kg || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      weight_kg: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.weight_kg?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.weight_kg?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="exterior" class={labelBaseClasses}>
                  Exterior <span class="text-red-500">*</span>
                </label>
                <input
                  id="exterior"
                  name="exterior"
                  type="text"
                  value={formValues().exterior || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      exterior: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.exterior?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.exterior?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="interior" class={labelBaseClasses}>
                  Interior <span class="text-red-500">*</span>
                </label>
                <input
                  id="interior"
                  name="interior"
                  type="text"
                  value={formValues().interior || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      interior: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.interior?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.interior?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="seating" class={labelBaseClasses}>
                  Seating <span class="text-red-500">*</span>
                </label>
                <input
                  id="seating"
                  name="seating"
                  type="number"
                  value={formValues().seating || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      seating: Number(e.currentTarget.value),
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.seating?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.seating?._errors[0]}
                  </p>
                </Show>
              </div>
              <div>
                <label for="warranty" class={labelBaseClasses}>
                  Warranty <span class="text-red-500">*</span>
                </label>
                <input
                  id="warranty"
                  name="warranty"
                  type="text"
                  value={formValues().warranty || ""}
                  onInput={(e) =>
                    setFormValues({
                      ...formValues(),
                      warranty: e.currentTarget.value,
                    })
                  }
                  class={inputBaseClasses}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
                <Show when={formErrors()?.warranty?._errors[0]}>
                  <p class="mt-1 text-xs text-red-500">
                    {formErrors()?.warranty?._errors[0]}
                  </p>
                </Show>
              </div>
            </div>

            {/* Powertrain Type */}
            <div>
              <label for="powertrain_type" class={labelBaseClasses}>
                Powertrain Type <span class="text-red-500">*</span>
              </label>
              <select
                id="powertrain_type"
                name="powertrain_type"
                class={inputBaseClasses}
                value={formValues().powertrain_type || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    powertrain_type: e.currentTarget.value as
                      | "Gasoline"
                      | "Electric"
                      | "Hybrid"
                      | undefined,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              >
                <option value="">Select Powertrain</option>
                <For each={powertrainTypeEnum.enumValues}>
                  {(pt) => <option value={pt}>{pt}</option>}
                </For>
              </select>
              <Show when={formErrors()?.powertrain_type?._errors[0]}>
                <p class="mt-1 text-xs text-red-500">
                  {formErrors()?.powertrain_type?._errors[0]}
                </p>
              </Show>
            </div>

            {/* Powertrain Specific Fields */}
            <Show when={formValues().powertrain_type === "Gasoline"}>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="cylinder_amount" class={labelBaseClasses}>
                    Cylinder Amount
                  </label>
                  <input
                    id="cylinder_amount"
                    name="cylinder_amount"
                    type="number"
                    value={powertrainSpecificValues().cylinder_amount || ""}
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        cylinder_amount: Number(e.currentTarget.value),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
                <div>
                  <label for="cylinder_capacity_cc" class={labelBaseClasses}>
                    Cylinder Capacity (cc)
                  </label>
                  <input
                    id="cylinder_capacity_cc"
                    name="cylinder_capacity_cc"
                    type="number"
                    value={
                      powertrainSpecificValues().cylinder_capacity_cc || ""
                    }
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        cylinder_capacity_cc: Number(e.currentTarget.value),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
                <div>
                  <label for="fuel_type" class={labelBaseClasses}>
                    Fuel Type
                  </label>
                  <input
                    id="fuel_type"
                    name="fuel_type"
                    type="text"
                    value={powertrainSpecificValues().fuel_type || ""}
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        fuel_type: e.currentTarget.value,
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
              </div>
            </Show>
            <Show when={formValues().powertrain_type === "Electric"}>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="battery_capacity_kwh" class={labelBaseClasses}>
                    Battery Capacity (kWh)
                  </label>
                  <input
                    id="battery_capacity_kwh"
                    name="battery_capacity_kwh"
                    type="number"
                    value={
                      powertrainSpecificValues().battery_capacity_kwh || ""
                    }
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        battery_capacity_kwh: Number(e.currentTarget.value),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
                <div>
                  <label for="electric_range_km" class={labelBaseClasses}>
                    Electric Range (km)
                  </label>
                  <input
                    id="electric_range_km"
                    name="electric_range_km"
                    type="number"
                    value={powertrainSpecificValues().electric_range_km || ""}
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        electric_range_km: Number(e.currentTarget.value),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
              </div>
            </Show>
            <Show when={formValues().powertrain_type === "Hybrid"}>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="electric_motor_power_kw" class={labelBaseClasses}>
                    Electric Motor Power (kW)
                  </label>
                  <input
                    id="electric_motor_power_kw"
                    name="electric_motor_power_kw"
                    type="number"
                    value={
                      powertrainSpecificValues().electric_motor_power_kw || ""
                    }
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        electric_motor_power_kw: Number(e.currentTarget.value),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
                <div>
                  <label
                    for="combustion_engine_power_hp"
                    class={labelBaseClasses}
                  >
                    Combustion Engine Power (HP)
                  </label>
                  <input
                    id="combustion_engine_power_hp"
                    name="combustion_engine_power_hp"
                    type="number"
                    value={
                      powertrainSpecificValues().combustion_engine_power_hp ||
                      ""
                    }
                    onInput={(e) =>
                      setPowertrainSpecificValues({
                        ...powertrainSpecificValues(),
                        combustion_engine_power_hp: Number(
                          e.currentTarget.value
                        ),
                      })
                    }
                    class={inputBaseClasses}
                    disabled={
                      vehicleUpdateMutation.isPending || isUploadingImage()
                    }
                  />
                </div>
              </div>
            </Show>

            {/* Maintenance Booklet */}
            <div class="flex items-center">
              <input
                id="maintenance_booklet"
                name="maintenance_booklet"
                type="checkbox"
                checked={formValues().maintenance_booklet || false}
                class="h-4 w-4 text-black border-neutral-300 rounded focus:ring-black"
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    maintenance_booklet: e.currentTarget.checked,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
              <label
                for="maintenance_booklet"
                class="ml-2 block text-sm text-neutral-900"
              >
                Maintenance Booklet Included
              </label>
              <Show when={formErrors()?.maintenance_booklet?._errors[0]}>
                <p class="mt-1 text-xs text-red-500">
                  {formErrors()?.maintenance_booklet?._errors[0]}
                </p>
              </Show>
            </div>

            {/* Descriptive Content */}
            <div>
              <label for="general_description" class={labelBaseClasses}>
                General Description
              </label>
              <textarea
                id="general_description"
                name="general_description"
                class={`${inputBaseClasses} min-h-[100px]`}
                value={formValues().general_description || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    general_description: e.currentTarget.value,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
            </div>
            <div>
              <label for="specification_description" class={labelBaseClasses}>
                Specification Description
              </label>
              <textarea
                id="specification_description"
                name="specification_description"
                class={`${inputBaseClasses} min-h-[100px]`}
                value={formValues().specification_description || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    specification_description: e.currentTarget.value,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
            </div>
            <div>
              <label for="appearance_title" class={labelBaseClasses}>
                Appearance Title
              </label>
              <input
                id="appearance_title"
                name="appearance_title"
                type="text"
                value={formValues().appearance_title || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    appearance_title: e.currentTarget.value,
                  })
                }
                class={inputBaseClasses}
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
            </div>
            <div>
              <label for="appearance_description" class={labelBaseClasses}>
                Appearance Description
              </label>
              <textarea
                id="appearance_description"
                name="appearance_description"
                class={`${inputBaseClasses} min-h-[100px]`}
                value={formValues().appearance_description || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    appearance_description: e.currentTarget.value,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
            </div>
            <div>
              <label for="feature_description" class={labelBaseClasses}>
                Feature Description
              </label>
              <textarea
                id="feature_description"
                name="feature_description"
                class={`${inputBaseClasses} min-h-[100px]`}
                value={formValues().feature_description || ""}
                onInput={(e) =>
                  setFormValues({
                    ...formValues(),
                    feature_description: e.currentTarget.value,
                  })
                }
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label class={labelBaseClasses}>Vehicle Images</label>

              {/* Existing Images */}
              <Show when={imagePreviews().length > 0}>
                <div class="mt-4">
                  <h4 class="text-sm font-medium text-neutral-700 mb-2">
                    Existing Images (Click to replace)
                  </h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <For each={imagePreviews()}>
                      {(url, index) => (
                        <div class="relative">
                          <img
                            src={url}
                            alt={`Existing ${index() + 1}`}
                            class="w-full h-32 object-cover rounded-lg border"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, index())}
                            class="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={
                              vehicleUpdateMutation.isPending ||
                              isUploadingImage()
                            }
                          />
                          <div class="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Click to replace
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Add New Images */}
              <div class="mt-4">
                <label class="block text-sm font-medium text-neutral-700 mb-2">
                  Add New Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewFileChange}
                  class={`${inputBaseClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800`}
                  disabled={
                    vehicleUpdateMutation.isPending || isUploadingImage()
                  }
                />
              </div>

              {/* New Images Preview */}
              <Show when={newImagePreviewUrls().length > 0}>
                <div class="mt-4">
                  <h4 class="text-sm font-medium text-neutral-700 mb-2">
                    New Images
                  </h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <For each={newImagePreviewUrls()}>
                      {(url, index) => (
                        <div class="relative">
                          <img
                            src={url}
                            alt={`New ${index() + 1}`}
                            class="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index())}
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            disabled={
                              vehicleUpdateMutation.isPending ||
                              isUploadingImage()
                            }
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <Show when={fileUploadError()}>
                <p class="mt-1 text-xs text-red-500">{fileUploadError()}</p>
              </Show>
            </div>

            {/* Features Input */}
            <div>
              <label class={labelBaseClasses}>Features</label>
              <div class="space-y-4">
                <Index each={featuresList()}>
                  {(feature, index) => (
                    <div class="flex gap-4 items-end">
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-neutral-700 mb-1">
                          Feature Name
                        </label>
                        <input
                          type="text"
                          value={feature().name || ""}
                          onInput={(e) => {
                            const newList = [...featuresList()];
                            newList[index] = {
                              name: e.currentTarget.value,
                              category: newList[index]!.category,
                            };
                            setFeaturesList(newList);
                          }}
                          class={inputBaseClasses}
                          placeholder="Enter feature name"
                          disabled={vehicleUpdateMutation.isPending}
                        />
                      </div>
                      <div class="flex-1">
                        <label class="block text-sm font-medium text-neutral-700 mb-1">
                          Category
                        </label>
                        <select
                          value={feature().category || ""}
                          onInput={(e) => {
                            const newList = [...featuresList()];
                            newList[index] = {
                              name: newList[index]!.name,
                              category: e.currentTarget.value,
                            };
                            setFeaturesList(newList);
                          }}
                          class={inputBaseClasses}
                          disabled={vehicleUpdateMutation.isPending}
                        >
                          <option value="">Select Category</option>
                          <option value="Comfort and convenience">
                            Comfort and convenience
                          </option>
                          <option value="Entertainment and Media">
                            Entertainment and Media
                          </option>
                          <option value="Safety and security">
                            Safety and security
                          </option>
                          <option value="Additional">Additional</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newList = featuresList().filter(
                            (_, i) => i !== index
                          );
                          setFeaturesList(newList);
                        }}
                        class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        disabled={vehicleUpdateMutation.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </Index>
                <button
                  type="button"
                  onClick={() => {
                    setFeaturesList([
                      ...featuresList(),
                      { name: "", category: "" },
                    ]);
                  }}
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={vehicleUpdateMutation.isPending}
                >
                  Add Feature
                </button>
              </div>
            </div>
            <div class="flex items-center justify-end space-x-4 pt-3">
              <A
                href="/dashboard/vehicles"
                class={`min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300`}
              >
                Cancel
              </A>
              <button
                type="submit"
                disabled={vehicleUpdateMutation.isPending || isUploadingImage()}
                class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploadingImage()
                  ? "Uploading Images..."
                  : vehicleUpdateMutation.isPending
                  ? "Updating Vehicle..."
                  : "Update Vehicle"}
              </button>
            </div>
          </form>
        </Show>
      </div>
    </Show>
  );
}
