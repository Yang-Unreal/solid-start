// src/routes/dashboard/vehicles/new.tsx
import {
	createSignal,
	Show,
	createEffect,
	For,
	Index,
	createResource,
	createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, A } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import {
	useMutation,
	useQueryClient,
	type UseMutationResult,
} from "@tanstack/solid-query";
import type { Vehicle, Feature } from "~/db/schema";
import { authClient } from "~/lib/auth-client";
import { z } from "zod";
import { powertrainTypeEnum, featureCategoryEnum } from "~/db/schema";

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";

const NewVehicleFormSchema = z.object({
	brand: z.string().trim().min(1, "Brand is required."),
	model: z.string().trim().min(1, "Model is required."),
	price: z.coerce.number().positive("Price must be a positive number."),
	date_of_manufacture: z.coerce
		.number()
		.int()
		.min(1900)
		.max(new Date().getFullYear() + 1),
	mileage: z.coerce.number().int().nonnegative("Mileage cannot be negative."),
	horsepower: z.coerce.number().int().positive("Horsepower must be positive."),
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
});

type VehicleFormValues = z.infer<typeof NewVehicleFormSchema>;

type CreateVehicleDBData = VehicleFormValues & {
	photos: { photo_url: string; display_order: number }[];
	features: { name: string; category: string }[];
	// Powertrain specific fields
	cylinder_amount?: number;
	cylinder_capacity_cc?: number;
	fuel_type?: string;
	battery_capacity_kwh?: number;
	electric_range_km?: number;
	electric_motor_power_kw?: number;
	combustion_engine_power_hp?: number;
};

async function createVehicleInDB(
	newVehicle: CreateVehicleDBData,
): Promise<Vehicle> {
	const fetchUrl = `/api/vehicles`;
	const response = await fetch(fetchUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newVehicle),
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
			if (user?.role === "admin") {
				setIsAuthorized(true);
			} else if (user) {
				navigate("/dashboard", { replace: true });
			}
		}
	});

	const [formValues, setFormValues] = createStore<Partial<VehicleFormValues>>({
		powertrain_type: undefined,
		maintenance_booklet: false,
	});
	const [powertrainSpecificValues, setPowertrainSpecificValues] =
		createSignal<any>({});

	const formFields = createMemo(() =>
		Object.keys(NewVehicleFormSchema.shape).filter(
			(key) =>
				!key.includes("description") &&
				!key.includes("title") &&
				key !== "powertrain_type" &&
				key !== "maintenance_booklet",
		),
	);

	const [imageFiles, setImageFiles] = createSignal<File[]>([]);
	const [imagePreviewUrls, setImagePreviewUrls] = createSignal<string[]>([]);
	const [formErrors, setFormErrors] =
		createSignal<z.ZodFormattedError<VehicleFormValues> | null>(null);
	const [fileUploadError, setFileUploadError] = createSignal<string | null>(
		null,
	);
	const [isUploadingImage, setIsUploadingImage] = createSignal(false);

	const [featuresList, setFeaturesList] = createSignal<
		{ name: string; category: string }[]
	>([]);

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

	const handleFileChange = (e: Event) => {
		const files = Array.from((e.currentTarget as HTMLInputElement).files || []);
		if (files.length > 6) {
			setFileUploadError("You can upload a maximum of 6 images.");
			return;
		}
		setImageFiles(files);
		setImagePreviewUrls(files.map((file) => URL.createObjectURL(file)));
		setFileUploadError(null);
	};

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

		const validationResult = NewVehicleFormSchema.safeParse(formValues);
		if (!validationResult.success) {
			setFormErrors(validationResult.error.format());
			return;
		}

		setIsUploadingImage(true);
		let photoUrls: string[];
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
					(await uploadResponse.json()).error || "Image upload failed",
				);
			const uploadResult = (await uploadResponse.json()) as {
				imageUrls: string[];
			};
			if (!uploadResult.imageUrls || uploadResult.imageUrls.length === 0) {
				throw new Error(
					"Image upload succeeded but no image URL was returned.",
				);
			}
			photoUrls = uploadResult.imageUrls;
		} catch (uploadError: any) {
			setFileUploadError(uploadError.message);
			setIsUploadingImage(false);
			return;
		}
		setIsUploadingImage(false);

		const vehicleDataForDB: CreateVehicleDBData = {
			...validationResult.data,
			...powertrainSpecificValues(),
			photos: photoUrls.map((url, index) => ({
				photo_url: url,
				display_order: index + 1,
			})),
			features: featuresList(),
		};

		vehicleCreationMutation.mutate(vehicleDataForDB);
	};

	const handleInputChange = (e: Event) => {
		const { name, value, type, checked } = e.currentTarget as HTMLInputElement;
		setFormValues(
			name as keyof VehicleFormValues,
			type === "checkbox" ? checked : value,
		);
	};

	const handlePowertrainInputChange = (e: Event) => {
		const { name, value } = e.currentTarget as HTMLInputElement;
		setPowertrainSpecificValues((prev) => ({ ...prev, [name]: value }));
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
				<form onSubmit={handleSubmit} class="space-y-5">
					{/* Core Vehicle Data */}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<For each={formFields()}>
							{(key) => {
								const fieldKey = key as keyof typeof NewVehicleFormSchema.shape;
								const fieldSchema = NewVehicleFormSchema.shape[fieldKey];
								const fieldName = key as keyof VehicleFormValues;
								const isRequired = !fieldSchema.isOptional();
								const inputType =
									"coerce" in fieldSchema._def ? "number" : "text";
								const fieldValue = () => formValues[fieldName];
								return (
									<div>
										<label for={key} class={labelBaseClasses}>
											{key.split("_").join(" ")}{" "}
											{isRequired && <span class="text-red-500">*</span>}
										</label>
										<input
											id={key}
											name={key}
											type={inputType}
											value={
												formValues[fieldName] !== undefined
													? String(formValues[fieldName])
													: ""
											}
											onInput={handleInputChange}
											class={inputBaseClasses}
											disabled={
												isUploadingImage() || vehicleCreationMutation.isPending
											}
										/>
										<Show when={fieldError(fieldName)}>
											<p class="mt-1 text-xs text-red-500">
												{fieldError(fieldName)}
											</p>
										</Show>
									</div>
								);
							}}
						</For>
					</div>

					{/* Powertrain Type */}
					<div>
						<label for="powertrain_type" class={labelBaseClasses}>
							Powertrain Type
						</label>
						<select
							id="powertrain_type"
							name="powertrain_type"
							class={inputBaseClasses}
							value={formValues.powertrain_type || ""}
							onInput={handleInputChange}
						>
							<option value="">Select Powertrain</option>
							<For each={powertrainTypeEnum.enumValues}>
								{(pt) => <option value={pt}>{pt}</option>}
							</For>
						</select>
						<Show when={fieldError("powertrain_type")}>
							<p class="mt-1 text-xs text-red-500">
								{fieldError("powertrain_type")}
							</p>
						</Show>
					</div>

					{/* Powertrain Specific Fields */}
					<Show when={formValues.powertrain_type === "Gasoline"}>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="cylinder_amount" class={labelBaseClasses}>
									Cylinder Amount
								</label>
								<input
									id="cylinder_amount"
									name="cylinder_amount"
									type="number"
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
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
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
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
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
								/>
							</div>
						</div>
					</Show>
					<Show when={formValues.powertrain_type === "Electric"}>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="battery_capacity_kwh" class={labelBaseClasses}>
									Battery Capacity (kWh)
								</label>
								<input
									id="battery_capacity_kwh"
									name="battery_capacity_kwh"
									type="number"
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
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
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
								/>
							</div>
						</div>
					</Show>
					<Show when={formValues.powertrain_type === "Hybrid"}>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="electric_motor_power_kw" class={labelBaseClasses}>
									Electric Motor Power (kW)
								</label>
								<input
									id="electric_motor_power_kw"
									name="electric_motor_power_kw"
									type="number"
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
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
									class={inputBaseClasses}
									onInput={handlePowertrainInputChange}
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
							checked={formValues.maintenance_booklet || false}
							class="h-4 w-4 text-black border-neutral-300 rounded focus:ring-black"
							onInput={handleInputChange}
						/>
						<label
							for="maintenance_booklet"
							class="ml-2 block text-sm text-neutral-900"
						>
							Maintenance Booklet Included
						</label>
						<Show when={fieldError("maintenance_booklet")}>
							<p class="mt-1 text-xs text-red-500">
								{fieldError("maintenance_booklet")}
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
							onInput={handleInputChange}
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
							onInput={handleInputChange}
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
							class={inputBaseClasses}
							onInput={handleInputChange}
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
							onInput={handleInputChange}
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
							onInput={handleInputChange}
						/>
					</div>

					{/* Image Upload */}
					<div>
						<label class={labelBaseClasses}>
							Vehicle Images <span class="text-red-500">*</span>
						</label>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleFileChange}
							class={`${inputBaseClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800`}
							disabled={isUploadingImage() || vehicleCreationMutation.isPending}
						/>
						<Show when={fileUploadError()}>
							<p class="mt-1 text-xs text-red-500">{fileUploadError()}</p>
						</Show>
						<Show when={imagePreviewUrls().length > 0}>
							<div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
								<For each={imagePreviewUrls()}>
									{(url, index) => (
										<div class="relative">
											<img
												src={url}
												alt={`Preview ${index() + 1}`}
												class="w-full h-32 object-cover rounded-lg border"
											/>
											<button
												type="button"
												onClick={() => {
													const newFiles = imageFiles().filter(
														(_, i) => i !== index(),
													);
													const newUrls = imagePreviewUrls().filter(
														(_, i) => i !== index(),
													);
													setImageFiles(newFiles);
													setImagePreviewUrls(newUrls);
												}}
												class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
												disabled={
													isUploadingImage() ||
													vehicleCreationMutation.isPending
												}
											>
												×
											</button>
										</div>
									)}
								</For>
							</div>
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
												disabled={vehicleCreationMutation.isPending}
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
												disabled={vehicleCreationMutation.isPending}
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
													(_, i) => i !== index,
												);
												setFeaturesList(newList);
											}}
											class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
											disabled={vehicleCreationMutation.isPending}
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
								disabled={vehicleCreationMutation.isPending}
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
							disabled={isUploadingImage() || vehicleCreationMutation.isPending}
							class="min-w-[130px] text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-in-out bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isUploadingImage()
								? "Uploading Images..."
								: vehicleCreationMutation.isPending
									? "Adding Vehicle..."
									: "Add Vehicle"}
						</button>
					</div>
				</form>
			</div>
		</Show>
	);
}
