import { For, Show, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import type { Vehicle } from "~/db/schema";
import type { QueryObserverResult } from "@tanstack/solid-query";
import VehicleImage from "~/components/product/VehicleImage";

// --- Interface Definitions ---
interface PaginationInfo {
	currentPage: number;
	pageSize: number;
	totalVehicles: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface ApiResponse {
	data: Vehicle[];
	pagination: PaginationInfo;
	error?: string;
}

interface VehicleDisplayAreaProps {
	vehiclesQuery: QueryObserverResult<ApiResponse, Error>;
	handlePageChange: (newPage: number) => void;
	pageSize: () => number;
}

// --- Helper Functions ---
const formatPrice = (price: number | string | null | undefined) => {
	if (price === null || price === undefined) return "N/A";
	const numPrice = typeof price === "string" ? parseFloat(price) : price;
	if (isNaN(numPrice)) return "N/A";
	return `$${numPrice.toLocaleString("en-US")}`;
};

// --- Main Component ---
const VehicleDisplayArea = (props: VehicleDisplayAreaProps) => {
	const memoizedVehicles = createMemo(
		() => props.vehiclesQuery.data?.data || [],
	);
	const pagination = () => props.vehiclesQuery.data?.pagination || null;
	const error = () => props.vehiclesQuery.error;

	const isLoading = () => props.vehiclesQuery.isLoading;

	return (
		<>
			<Show when={error()}>
				<div class="text-center py-10">
					<p class="text-xl text-red-600">
						Error: {error()?.message || "An unknown error occurred."}
					</p>
					<button
						onClick={() => props.vehiclesQuery.refetch()}
						class="ml-2 text-sky-600 underline"
					>
						Retry
					</button>
				</div>
			</Show>

			<div class="relative">
				<div
					class={`vehicle-grid-container justify-center gap-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4`}
				>
					<Show
						when={!isLoading() && !error() && memoizedVehicles().length > 0}
					>
						<For each={memoizedVehicles()}>
							{(vehicle) => (
								<A
									href={`/vehicles/${vehicle.vehicle_id}`}
									class="card-content-host flex flex-col bg-white overflow-hidden"
								>
									<div class="w-full aspect-video bg-neutral-100 overflow-hidden">
										<VehicleImage
											vehicleId={vehicle.vehicle_id}
											index={0}
											size="card"
											alt={`${vehicle.brand || ""} ${
												vehicle.model || ""
											}`.trim()}
											class="w-full h-full object-cover"
										/>
									</div>
									<div class=" flex flex-col flex-grow">
										<h2
											class="text-md font-semibold text-neutral-800 truncate mb-4"
											title={`${vehicle.brand || ""} ${
												vehicle.model || ""
											}`.trim()}
										>
											{vehicle.brand || ""} {vehicle.model || ""}
										</h2>
										<p class="text-sm mt-2 mb-4 text-neutral-700 flex-grow">
											{formatPrice(vehicle.price)}
										</p>
									</div>
								</A>
							)}
						</For>
					</Show>
				</div>

				<Show
					when={
						!isLoading() &&
						!error() &&
						pagination() &&
						pagination()!.totalPages > 1
					}
				>
					<div class="mt-10 flex justify-center items-center space-x-2 sm:space-x-3">
						<button
							onClick={() => props.handlePageChange(1)}
							disabled={!pagination()!.hasPreviousPage}
							class="pagination-button"
						>
							First
						</button>
						<button
							onClick={() =>
								props.handlePageChange(pagination()!.currentPage - 1)
							}
							disabled={!pagination()!.hasPreviousPage}
							class="pagination-button"
						>
							Previous
						</button>
						<span class="text-neutral-700 font-medium text-sm px-2">
							Page {pagination()!.currentPage} of {pagination()!.totalPages}
						</span>
						<button
							onClick={() =>
								props.handlePageChange(pagination()!.currentPage + 1)
							}
							disabled={!pagination()!.hasNextPage}
							class="pagination-button"
						>
							Next
						</button>
						<button
							onClick={() => props.handlePageChange(pagination()!.totalPages)}
							disabled={!pagination()!.hasNextPage}
							class="pagination-button"
						>
							Last
						</button>
					</div>
				</Show>
			</div>
		</>
	);
};

export default VehicleDisplayArea;
