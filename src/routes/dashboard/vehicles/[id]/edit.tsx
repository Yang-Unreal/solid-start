// src/routes/dashboard/vehicles/[id]/edit.tsx
import { createSignal, Show, createEffect, For } from "solid-js";
import { useNavigate, useParams, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Vehicle, Photo } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod";

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

const EditVehicleFormSchema = z.object({
  brand: z.string().trim().min(1, { message: "Brand is required." }),
  model: z.string().trim().min(1, { message: "Model is required." }),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a positive number.",
    }),
  date_of_manufacture: z.coerce
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later." }),
  mileage: z.coerce
    .number()
    .int()
    .min(0, { message: "Mileage cannot be negative." }),
  horsepower: z.coerce.number().int().positive(),
  top_speed_kph: z.coerce.number().int().positive(),
  acceleration_0_100_sec: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0),
  transmission: z.string().trim().min(1),
  weight_kg: z.coerce.number().int().positive(),
  exterior: z.string().trim().min(1),
  interior: z.string().trim().min(1),
  seating: z.coerce.number().int().positive(),
  warranty: z.string().trim().optional(),
  maintenance_booklet: z.string().optional(),
  powertrain_type: z.enum(["Gasoline", "Hybrid", "Electric"]),
  general_description: z.string().trim().optional(),
  specification_description: z.string().trim().optional(),
  appearance_title: z.string().trim().optional(),
  appearance_description: z.string().trim().optional(),
  feature_description: z.string().trim().optional(),
});

type VehicleFormValues = z.infer<typeof EditVehicleFormSchema>;
type UpdateVehicleDBData = Partial<z.infer<typeof EditVehicleFormSchema>>;

interface ApiResponse {
  data: (Vehicle & { photos: Photo[] })[];
}

async function updateVehicleInDB(
  updatedVehicle: UpdateVehicleDBData & {
    id: string;
    photosToDelete?: number[];
    newPhotoUrls?: string[];
  }
): Promise<Vehicle> {
  const { photosToDelete, newPhotoUrls, ...vehicleData } = updatedVehicle;
  const fetchUrl = `/api/vehicles?id=${updatedVehicle.id}`;
  const response = await fetch(fetchUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...vehicleData,
      photosToDelete,
      newPhotoUrls,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // If there are specific validation issues, format them
    if (errorData.issues) {
      const issueMessages = Object.entries(errorData.issues)
        .map(([field, errors]: [string, any]) => {
          if (errors && errors._errors && errors._errors.length > 0) {
            return `${field}: ${errors._errors.join(", ")}`;
          }
          return null;
        })
        .filter(Boolean)
        .join("; ");
      throw new Error(
        issueMessages || errorData.error || `Error updating vehicle`
      );
    }

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

      const fetchUrl = `${baseUrl}/api/vehicles?id=${id}&fresh=true`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Failed to fetch vehicle for editing.");
      return (await response.json()) as ApiResponse;
    },
    enabled: !!vehicleId(),
    staleTime: 0, // Disable caching for real-time data
    cacheTime: 0, // Don't cache the data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus for edit page
  }));

  const existingVehicle = () => vehicleQuery.data?.data?.[0];

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

  // Form state signals
  const [brand, setBrand] = createSignal("");
  const [model, setModel] = createSignal("");
  const [price, setPrice] = createSignal("");
  const [date_of_manufacture, setDateOfManufacture] = createSignal("");
  const [mileage, setMileage] = createSignal("");
  const [horsepower, setHorsepower] = createSignal("");
  const [top_speed_kph, setTopSpeedKph] = createSignal("");
  const [acceleration_0_100_sec, setAcceleration] = createSignal("");
  const [transmission, setTransmission] = createSignal("");
  const [weight_kg, setWeightKg] = createSignal("");
  const [exterior, setExterior] = createSignal("");
  const [interior, setInterior] = createSignal("");
  const [seating, setSeating] = createSignal("");
  const [warranty, setWarranty] = createSignal("");
  const [maintenance_booklet, setMaintenanceBooklet] = createSignal(false);
  const [powertrain_type, setPowertrainType] = createSignal<
    "Gasoline" | "Hybrid" | "Electric"
  >("Gasoline");
  const [general_description, setGeneralDescription] = createSignal("");
  const [specification_description, setSpecificationDescription] =
    createSignal("");
  const [appearance_title, setAppearanceTitle] = createSignal("");
  const [appearance_description, setAppearanceDescription] = createSignal("");
  const [feature_description, setFeatureDescription] = createSignal("");

  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<VehicleFormValues> | null>(null);

  // Image management state
  const [currentPhotos, setCurrentPhotos] = createSignal<Photo[]>([]);
  const [newFiles, setNewFiles] = createSignal<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = createSignal<number[]>([]);
  const [isUploading, setIsUploading] = createSignal(false);

  createEffect(() => {
    const vehicle = existingVehicle();
    if (vehicle) {
      setBrand(vehicle.brand || "");
      setModel(vehicle.model || "");
      const priceValue = vehicle.price
        ? parseFloat(vehicle.price.toString())
        : 0;
      setPrice(priceValue > 0 ? vehicle.price!.toString() : "10000");
      const dateValue = vehicle.date_of_manufacture || 0;
      setDateOfManufacture(
        dateValue >= 1900 ? vehicle.date_of_manufacture!.toString() : "2020"
      );
      const mileageValue = vehicle.mileage || 0;
      setMileage(mileageValue >= 0 ? vehicle.mileage!.toString() : "0");
      const hpValue = vehicle.horsepower || 0;
      setHorsepower(hpValue > 0 ? vehicle.horsepower!.toString() : "100");
      const speedValue = vehicle.top_speed_kph || 0;
      setTopSpeedKph(
        speedValue > 0 ? vehicle.top_speed_kph!.toString() : "200"
      );
      const accelValue = vehicle.acceleration_0_100_sec
        ? parseFloat(vehicle.acceleration_0_100_sec.toString())
        : 0;
      setAcceleration(
        accelValue > 0 ? vehicle.acceleration_0_100_sec!.toString() : "5.0"
      );
      setTransmission(vehicle.transmission || "");
      const weightValue = vehicle.weight_kg || 0;
      setWeightKg(weightValue > 0 ? vehicle.weight_kg!.toString() : "1000");
      setExterior(vehicle.exterior || "");
      setInterior(vehicle.interior || "");
      const seatingValue = vehicle.seating || 0;
      setSeating(seatingValue > 0 ? vehicle.seating!.toString() : "4");
      setWarranty(vehicle.warranty || "");
      setMaintenanceBooklet(vehicle.maintenance_booklet ?? false);
      setPowertrainType(vehicle.powertrain_type || "Gasoline");
      setGeneralDescription(vehicle.general_description || "");
      setSpecificationDescription(vehicle.specification_description || "");
      setAppearanceTitle(vehicle.appearance_title || "");
      setAppearanceDescription(vehicle.appearance_description || "");
      setFeatureDescription(vehicle.feature_description || "");
      setCurrentPhotos(vehicle.photos || []);
    }
  });

  const vehicleUpdateMutation: UseMutationResult<
    Vehicle,
    Error,
    UpdateVehicleDBData & {
      id: string;
      photosToDelete?: number[];
      newPhotoUrls?: string[];
    }
  > = useMutation(() => ({
    mutationFn: updateVehicleInDB,
    onSuccess: (updatedVehicle) => {
      // Invalidate any cached queries that might exist
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

  // Image management functions
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const markPhotoForDeletion = (photoId: number) => {
    setPhotosToDelete((prev) => [...prev, photoId]);
    setCurrentPhotos((prev) => prev.filter((p) => p.photo_id !== photoId));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (newFiles().length === 0) return [];

    const formData = new FormData();
    newFiles().forEach((file) => {
      formData.append("photos", file);
    });

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload images");
    }

    const result = await response.json();
    return result.imageUrls || [];
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);

    const validationResult = EditVehicleFormSchema.safeParse({
      brand: brand(),
      model: model(),
      price: price(),
      date_of_manufacture: date_of_manufacture(),
      mileage: mileage(),
      horsepower: horsepower(),
      top_speed_kph: top_speed_kph(),
      acceleration_0_100_sec: acceleration_0_100_sec(),
      transmission: transmission(),
      weight_kg: weight_kg(),
      exterior: exterior(),
      interior: interior(),
      seating: seating(),
      warranty: warranty(),
      maintenance_booklet: maintenance_booklet() ? "true" : "false",
      powertrain_type: powertrain_type(),
      general_description: general_description(),
      specification_description: specification_description(),
      appearance_title: appearance_title(),
      appearance_description: appearance_description(),
      feature_description: feature_description(),
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }

    try {
      setIsUploading(true);

      // Upload new images first
      const uploadedUrls = await uploadImages();

      // Update vehicle data with photo operations
      const updateData = {
        ...validationResult.data,
        photosToDelete: photosToDelete(),
        newPhotoUrls: uploadedUrls,
      };

      vehicleUpdateMutation.mutate({
        id: vehicleId()!,
        ...updateData,
      });
    } catch (error) {
      setFormErrors({ _errors: [(error as Error).message] } as any);
    } finally {
      setIsUploading(false);
    }
  };

  const inputBaseClasses = `block w-full mt-1 py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-black`;
  const labelBaseClasses = `block text-sm font-medium text-neutral-700`;
  const fieldError = (fieldName: keyof VehicleFormValues) =>
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
        <Title>Edit Vehicle</Title>
      </MetaProvider>
      <div class="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8 mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 text-center">
          Edit Vehicle
        </h1>
        <Show when={vehicleQuery.isLoading}>
          <p class="text-center">Loading vehicle...</p>
        </Show>
        <Show when={vehicleQuery.isError}>
          <p class="text-center text-red-500">
            Error: {vehicleQuery.error?.message}
          </p>
        </Show>
        <Show when={vehicleQuery.isSuccess && existingVehicle()}>
          <form onSubmit={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  disabled={vehicleUpdateMutation.isPending}
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
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("model")}>
                  <p class="mt-1 text-xs text-red-500">{fieldError("model")}</p>
                </Show>
              </div>
              <div>
                <label for="price" class={labelBaseClasses}>
                  Price <span class="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={price()}
                  onInput={(e) => setPrice(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("price")}>
                  <p class="mt-1 text-xs text-red-500">{fieldError("price")}</p>
                </Show>
              </div>
              <div>
                <label for="date_of_manufacture" class={labelBaseClasses}>
                  Year of Manufacture <span class="text-red-500">*</span>
                </label>
                <input
                  id="date_of_manufacture"
                  type="text"
                  inputMode="numeric"
                  value={date_of_manufacture()}
                  onInput={(e) => setDateOfManufacture(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("date_of_manufacture")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("date_of_manufacture")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="mileage" class={labelBaseClasses}>
                  Mileage <span class="text-red-500">*</span>
                </label>
                <input
                  id="mileage"
                  type="text"
                  inputMode="numeric"
                  value={mileage()}
                  onInput={(e) => setMileage(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("mileage")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("mileage")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="horsepower" class={labelBaseClasses}>
                  Horsepower <span class="text-red-500">*</span>
                </label>
                <input
                  id="horsepower"
                  type="text"
                  inputMode="numeric"
                  value={horsepower()}
                  onInput={(e) => setHorsepower(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("horsepower")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("horsepower")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="top_speed_kph" class={labelBaseClasses}>
                  Top Speed (KPH) <span class="text-red-500">*</span>
                </label>
                <input
                  id="top_speed_kph"
                  type="text"
                  inputMode="numeric"
                  value={top_speed_kph()}
                  onInput={(e) => setTopSpeedKph(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("top_speed_kph")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("top_speed_kph")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="acceleration_0_100_sec" class={labelBaseClasses}>
                  0-100 kph (sec) <span class="text-red-500">*</span>
                </label>
                <input
                  id="acceleration_0_100_sec"
                  type="text"
                  inputMode="decimal"
                  value={acceleration_0_100_sec()}
                  onInput={(e) => setAcceleration(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("acceleration_0_100_sec")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("acceleration_0_100_sec")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="transmission" class={labelBaseClasses}>
                  Transmission <span class="text-red-500">*</span>
                </label>
                <input
                  id="transmission"
                  type="text"
                  value={transmission()}
                  onInput={(e) => setTransmission(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("transmission")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("transmission")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="weight_kg" class={labelBaseClasses}>
                  Weight (KG) <span class="text-red-500">*</span>
                </label>
                <input
                  id="weight_kg"
                  type="text"
                  inputMode="numeric"
                  value={weight_kg()}
                  onInput={(e) => setWeightKg(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("weight_kg")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("weight_kg")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="exterior" class={labelBaseClasses}>
                  Exterior <span class="text-red-500">*</span>
                </label>
                <input
                  id="exterior"
                  type="text"
                  value={exterior()}
                  onInput={(e) => setExterior(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("exterior")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("exterior")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="interior" class={labelBaseClasses}>
                  Interior <span class="text-red-500">*</span>
                </label>
                <input
                  id="interior"
                  type="text"
                  value={interior()}
                  onInput={(e) => setInterior(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("interior")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("interior")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="seating" class={labelBaseClasses}>
                  Seating <span class="text-red-500">*</span>
                </label>
                <input
                  id="seating"
                  type="text"
                  inputMode="numeric"
                  value={seating()}
                  onInput={(e) => setSeating(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("seating")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("seating")}
                  </p>
                </Show>
              </div>
              <div>
                <label for="powertrain_type" class={labelBaseClasses}>
                  Powertrain <span class="text-red-500">*</span>
                </label>
                <select
                  id="powertrain_type"
                  value={powertrain_type()}
                  onChange={(e) =>
                    setPowertrainType(e.currentTarget.value as any)
                  }
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                <Show when={fieldError("powertrain_type")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("powertrain_type")}
                  </p>
                </Show>
              </div>
              <div class="md:col-span-2">
                <label for="warranty" class={labelBaseClasses}>
                  Warranty
                </label>
                <input
                  id="warranty"
                  type="text"
                  value={warranty()}
                  onInput={(e) => setWarranty(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
                <Show when={fieldError("warranty")}>
                  <p class="mt-1 text-xs text-red-500">
                    {fieldError("warranty")}
                  </p>
                </Show>
              </div>
              <div class="md:col-span-2 flex items-center gap-2">
                <input
                  id="maintenance_booklet"
                  type="checkbox"
                  checked={maintenance_booklet()}
                  onChange={(e) =>
                    setMaintenanceBooklet(e.currentTarget.checked)
                  }
                  class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  disabled={vehicleUpdateMutation.isPending}
                />
                <label
                  for="maintenance_booklet"
                  class="text-sm text-neutral-700"
                >
                  Maintenance Booklet Included
                </label>
              </div>
            </div>

            {/* Description Fields */}
            <div class="space-y-4 pt-4 border-t">
              <h2 class="text-xl font-semibold text-neutral-700">
                Descriptions
              </h2>
              <div>
                <label for="general_description" class={labelBaseClasses}>
                  General Description
                </label>
                <textarea
                  id="general_description"
                  value={general_description()}
                  onInput={(e) => setGeneralDescription(e.currentTarget.value)}
                  class={`${inputBaseClasses} min-h-[100px]`}
                  disabled={vehicleUpdateMutation.isPending}
                />
              </div>
              <div>
                <label for="specification_description" class={labelBaseClasses}>
                  Specification Description
                </label>
                <textarea
                  id="specification_description"
                  value={specification_description()}
                  onInput={(e) =>
                    setSpecificationDescription(e.currentTarget.value)
                  }
                  class={`${inputBaseClasses} min-h-[100px]`}
                  disabled={vehicleUpdateMutation.isPending}
                />
              </div>
              <div>
                <label for="appearance_title" class={labelBaseClasses}>
                  Appearance Title
                </label>
                <input
                  id="appearance_title"
                  type="text"
                  value={appearance_title()}
                  onInput={(e) => setAppearanceTitle(e.currentTarget.value)}
                  class={inputBaseClasses}
                  disabled={vehicleUpdateMutation.isPending}
                />
              </div>
              <div>
                <label for="appearance_description" class={labelBaseClasses}>
                  Appearance Description
                </label>
                <textarea
                  id="appearance_description"
                  value={appearance_description()}
                  onInput={(e) =>
                    setAppearanceDescription(e.currentTarget.value)
                  }
                  class={`${inputBaseClasses} min-h-[100px]`}
                  disabled={vehicleUpdateMutation.isPending}
                />
              </div>
              <div>
                <label for="feature_description" class={labelBaseClasses}>
                  Feature Description
                </label>
                <textarea
                  id="feature_description"
                  value={feature_description()}
                  onInput={(e) => setFeatureDescription(e.currentTarget.value)}
                  class={`${inputBaseClasses} min-h-[100px]`}
                  disabled={vehicleUpdateMutation.isPending}
                />
              </div>
            </div>

            {/* --- Image Management --- */}
            <div class="pt-4 border-t">
              <h2 class="text-xl font-semibold text-neutral-700 mb-4">
                Images
              </h2>

              {/* Current Images */}
              <div class="mb-6">
                <h3 class="text-lg font-medium text-neutral-600 mb-3">
                  Current Images
                </h3>
                <Show
                  when={currentPhotos().length > 0}
                  fallback={
                    <p class="text-neutral-500">No images uploaded yet.</p>
                  }
                >
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <For each={currentPhotos()}>
                      {(photo, index) => (
                        <div class="relative group">
                          <img
                            src={photo.photo_url}
                            alt={`Vehicle image ${index() + 1}`}
                            class="w-full h-24 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() => markPhotoForDeletion(photo.photo_id)}
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete image"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* New Images to Upload */}
              <div class="mb-6">
                <h3 class="text-lg font-medium text-neutral-600 mb-3">
                  Add New Images
                </h3>
                <div class="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    class="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800"
                    disabled={isUploading()}
                  />

                  <Show when={newFiles().length > 0}>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <For each={newFiles()}>
                        {(file, index) => (
                          <div class="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New image ${index() + 1}`}
                              class="w-full h-24 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewFile(index())}
                              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>
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
                href="/dashboard/vehicles"
                class={`min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300 ${
                  vehicleUpdateMutation.isPending || isUploading()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (vehicleUpdateMutation.isPending || isUploading())
                    e.preventDefault();
                }}
              >
                Cancel
              </A>
              <button
                type="submit"
                disabled={vehicleUpdateMutation.isPending || isUploading()}
                class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {vehicleUpdateMutation.isPending || isUploading()
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
