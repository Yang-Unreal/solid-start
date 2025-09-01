// src/routes/dashboard/vehicles/[id]/edit.tsx
import { createSignal, Show, createEffect } from "solid-js";
import { useNavigate, useParams, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/solid-query";
import type { Vehicle } from "~/db/schema";
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
  maintenance_booklet: z.boolean().default(false),
  powertrain_type: z.enum(["Gasoline", "Hybrid", "Electric"]),
  general_description: z.string().trim().optional(),
  specification_description: z.string().trim().optional(),
  appearance_title: z.string().trim().optional(),
  appearance_description: z.string().trim().optional(),
  feature_description: z.string().trim().optional(),
});

type VehicleFormValues = z.infer<typeof EditVehicleFormSchema>;
type UpdateVehicleDBData = Partial<VehicleFormValues>;

interface ApiResponse {
  data: Vehicle[];
}

async function updateVehicleInDB(
  updatedVehicle: UpdateVehicleDBData & { id: string }
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
    staleTime: 5 * 60 * 1000,
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

  createEffect(() => {
    const vehicle = existingVehicle();
    if (vehicle) {
      setBrand(vehicle.brand ?? "");
      setModel(vehicle.model ?? "");
      setPrice(vehicle.price ?? "");
      setDateOfManufacture(vehicle.date_of_manufacture?.toString() ?? "");
      setMileage(vehicle.mileage?.toString() ?? "");
      setHorsepower(vehicle.horsepower?.toString() ?? "");
      setTopSpeedKph(vehicle.top_speed_kph?.toString() ?? "");
      setAcceleration(vehicle.acceleration_0_100_sec ?? "");
      setTransmission(vehicle.transmission ?? "");
      setWeightKg(vehicle.weight_kg?.toString() ?? "");
      setExterior(vehicle.exterior ?? "");
      setInterior(vehicle.interior ?? "");
      setSeating(vehicle.seating?.toString() ?? "");
      setWarranty(vehicle.warranty ?? "");
      setMaintenanceBooklet(vehicle.maintenance_booklet ?? false);
      setPowertrainType(vehicle.powertrain_type ?? "Gasoline");
      setGeneralDescription(vehicle.general_description ?? "");
      setSpecificationDescription(vehicle.specification_description ?? "");
      setAppearanceTitle(vehicle.appearance_title ?? "");
      setAppearanceDescription(vehicle.appearance_description ?? "");
      setFeatureDescription(vehicle.feature_description ?? "");
    }
  });

  const vehicleUpdateMutation: UseMutationResult<
    Vehicle,
    Error,
    UpdateVehicleDBData & { id: string }
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
      maintenance_booklet: maintenance_booklet(),
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

    vehicleUpdateMutation.mutate({
      id: vehicleId()!,
      ...validationResult.data,
    });
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

            {/* --- Image Upload Placeholder --- */}
            <div class="pt-4 border-t">
              <h2 class="text-xl font-semibold text-neutral-700">Images</h2>
              <div class="mt-2 w-full h-32 border-2 border-dashed border-neutral-300 rounded-md flex items-center justify-center text-neutral-500">
                Image editing feature will be added here.
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
                  vehicleUpdateMutation.isPending
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={(e) => {
                  if (vehicleUpdateMutation.isPending) e.preventDefault();
                }}
              >
                Cancel
              </A>
              <button
                type="submit"
                disabled={vehicleUpdateMutation.isPending}
                class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {vehicleUpdateMutation.isPending
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
