// src/routes/dashboard/vehicles/new.tsx
import { createSignal, Show, createEffect, For } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Vehicle } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod";

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

// Matches the expected structure for the API POST request
const NewVehicleFormSchema = z.object({
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
  maintenance_booklet: z.boolean().default(false),
  powertrain_type: z.enum(["Gasoline", "Hybrid", "Electric"]),
  general_description: z.string().trim().optional(),
  specification_description: z.string().trim().optional(),
  appearance_title: z.string().trim().optional(),
  appearance_description: z.string().trim().optional(),
  feature_description: z.string().trim().optional(),
  photos: z.array(z.instanceof(File)).optional(),
});

type VehicleFormValues = z.infer<typeof NewVehicleFormSchema>;
type CreateVehicleDBData = VehicleFormValues;

async function createVehicleInDB(
  newVehicle: CreateVehicleDBData
): Promise<Vehicle> {
  // When creating, we send FormData, not JSON
  const formData = new FormData();

  // Append all standard fields
  Object.entries(newVehicle).forEach(([key, value]) => {
    if (key !== "photos" && value !== undefined && value !== null) {
      // Special handling for boolean fields that need to be sent as strings
      if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Append photos if they exist and there are any
  if (newVehicle.photos && newVehicle.photos.length > 0) {
    newVehicle.photos.forEach((photo) => {
      formData.append("photos", photo);
    });
  }

  const fetchUrl = `/api/vehicles`;
  const response = await fetch(fetchUrl, {
    method: "POST",
    body: formData, // No 'Content-Type' header, browser sets it for FormData
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to parse error" }));
    throw new Error(errorData.error || `Error creating vehicle`);
  }
  return response.json();
}

export default function AddVehiclePage() {
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
  const [photos, setPhotos] = createSignal<File[]>([]);

  const [formErrors, setFormErrors] =
    createSignal<z.ZodFormattedError<VehicleFormValues> | null>(null);

  const vehicleCreationMutation: UseMutationResult<
    Vehicle,
    Error,
    CreateVehicleDBData
  > = useMutation(() => ({
    mutationFn: createVehicleInDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY_PREFIX] });
      navigate("/dashboard/vehicles");
    },
    onError: (error: Error) => {
      setFormErrors({ _errors: [error.message] } as any);
    },
  }));

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormErrors(null);

    const validationResult = NewVehicleFormSchema.safeParse({
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
      maintenance_booklet: maintenance_booklet(),
      powertrain_type: powertrain_type(),
      general_description: general_description(),
      specification_description: specification_description(),
      appearance_title: appearance_title(),
      appearance_description: appearance_description(),
      feature_description: feature_description(),
      photos: photos(),
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      return;
    }

    vehicleCreationMutation.mutate(validationResult.data);
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
        <Title>Add New Vehicle</Title>
      </MetaProvider>
      <div class="w-full max-w-4xl bg-white shadow-xl rounded-lg p-6 sm:p-8 my-8 mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-neutral-800">
          Create New Vehicle
        </h1>
        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
              />
              <Show when={fieldError("mileage")}>
                <p class="mt-1 text-xs text-red-500">{fieldError("mileage")}</p>
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
              />
              <Show when={fieldError("seating")}>
                <p class="mt-1 text-xs text-red-500">{fieldError("seating")}</p>
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                onChange={(e) => setMaintenanceBooklet(e.currentTarget.checked)}
                class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                disabled={vehicleCreationMutation.isPending}
              />
              <label for="maintenance_booklet" class="text-sm text-neutral-700">
                Maintenance Booklet Included
              </label>
            </div>
          </div>

          {/* Description Fields */}
          <div class="space-y-4 pt-4 border-t">
            <h2 class="text-xl font-semibold text-neutral-700">Descriptions</h2>
            <div>
              <label for="general_description" class={labelBaseClasses}>
                General Description
              </label>
              <textarea
                id="general_description"
                value={general_description()}
                onInput={(e) => setGeneralDescription(e.currentTarget.value)}
                class={`${inputBaseClasses} min-h-[100px]`}
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
              />
            </div>
            <div>
              <label for="appearance_description" class={labelBaseClasses}>
                Appearance Description
              </label>
              <textarea
                id="appearance_description"
                value={appearance_description()}
                onInput={(e) => setAppearanceDescription(e.currentTarget.value)}
                class={`${inputBaseClasses} min-h-[100px]`}
                disabled={vehicleCreationMutation.isPending}
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
                disabled={vehicleCreationMutation.isPending}
              />
            </div>
          </div>

          {/* --- Image Upload Section --- */}
          <div class="pt-4 border-t">
            <h2 class="text-xl font-semibold text-neutral-700">Images</h2>
            <div class="mt-2">
              <label
                for="photo-upload"
                class="block w-full cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-neutral-500 hover:border-neutral-400 hover:bg-neutral-100"
              >
                <span>Click to upload photos</span>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  class="sr-only"
                  onChange={(e) => {
                    if (e.currentTarget.files) {
                      setPhotos((prev) => [
                        ...prev,
                        ...Array.from(e.currentTarget.files!),
                      ]);
                    }
                  }}
                  disabled={vehicleCreationMutation.isPending}
                />
              </label>
            </div>
            <Show when={photos().length > 0}>
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <For each={photos()}>
                  {(photo, i) => (
                    <div class="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${i() + 1}`}
                        class="h-full w-full object-cover rounded-md"
                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} // Clean up object URLs
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((prev) =>
                            prev.filter((_, idx) => idx !== i())
                          )
                        }
                        class="absolute top-1 right-1 h-6 w-6 rounded-full bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        aria-label="Remove photo"
                        disabled={vehicleCreationMutation.isPending}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </For>
              </div>
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
              href="/dashboard/vehicles"
              class={`min-w-[100px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-neutral-200 text-neutral-800 hover:bg-neutral-300 ${
                vehicleCreationMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={(e) => {
                if (vehicleCreationMutation.isPending) e.preventDefault();
              }}
            >
              Cancel
            </A>
            <button
              type="submit"
              disabled={vehicleCreationMutation.isPending}
              class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {vehicleCreationMutation.isPending
                ? "Adding Vehicle..."
                : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </Show>
  );
}
