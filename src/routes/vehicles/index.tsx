// src/routes/vehicles/index.tsx

import { MetaProvider } from "@solidjs/meta";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import VehicleDisplayArea from "~/components/product/VehicleDisplayArea";
import { useSearch } from "~/context/SearchContext";
import type { Vehicle } from "~/db/schema";

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

const VEHICLES_QUERY_KEY_PREFIX = "vehicles";
const FIXED_PAGE_SIZE = 30;

export default function VehiclesPage() {
	const {
		searchQuery,
		selectedBrands,
		selectedFuelTypes,
		selectedPowertrainTypes,
		currentPage,
		setCurrentPage,
	} = useSearch();
	const pageSize = () => FIXED_PAGE_SIZE;

	const buildFilterString = () => {
		const filters: string[] = [];
		if (selectedBrands().length > 0) {
			const brandList = selectedBrands()
				.map((b) => `"${b}"`)
				.join(", ");
			filters.push(`brand IN [${brandList}]`);
		}
		if (selectedFuelTypes().length > 0) {
			const fuelList = selectedFuelTypes()
				.map((f) => `"${f}"`)
				.join(", ");
			filters.push(`fuel_type IN [${fuelList}]`);
		}
		if (selectedPowertrainTypes().length > 0) {
			const powertrainList = selectedPowertrainTypes()
				.map((p) => `"${p}"`)
				.join(", ");
			filters.push(`powertrain_type IN [${powertrainList}]`);
		}
		return filters.join(" AND ");
	};

	const fetchVehiclesQueryFn = async (context: {
		queryKey: readonly [
			string,
			{ page: number; size: number; q?: string; filter: string },
		];
	}): Promise<ApiResponse> => {
		const [_key, { page, size, q, filter }] = context.queryKey;
		let baseUrl = "";
		if (import.meta.env.SSR) {
			baseUrl =
				import.meta.env.VITE_INTERNAL_API_ORIGIN ||
				`http://localhost:${process.env.PORT || 3000}`;
		}
		const params = new URLSearchParams({
			page: page.toString(),
			pageSize: size.toString(),
		});
		if (q) params.append("q", q);
		if (filter) params.append("filter", filter);
		const fetchUrl = `${baseUrl}/api/vehicles?${params.toString()}`;
		const response = await fetch(fetchUrl);
		if (!response.ok)
			throw new Error((await response.json()).error || `HTTP error!`);
		return response.json();
	};

	const vehiclesQuery: UseQueryResult<ApiResponse, Error> = useQuery<
		ApiResponse,
		Error,
		ApiResponse,
		readonly [
			string,
			{ page: number; size: number; q?: string; filter: string },
		]
	>(() => ({
		queryKey: [
			VEHICLES_QUERY_KEY_PREFIX,
			{
				page: currentPage(),
				size: pageSize(),
				q: searchQuery(),
				filter: buildFilterString(),
			},
		] as const,
		queryFn: fetchVehiclesQueryFn,
		staleTime: 10 * 1000,
		keepPreviousData: true,
	}));

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<MetaProvider>
			<main class="pt-18 md:pt-26 bg-white pb-4 sm:pb-6 lg:pb-8 min-h-screen ">
				<div class="px-1.5 md:px-3 z-10">
					<div class="container-padding">
						<div class="h-[1px] bg-gray-300 w-full mb-5 "></div>
						<div class="mx-auto w-full max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none ">
							<div class="flex flex-col md:flex-row">
								{/* Main content area */}
								<div class="flex-grow">
									<VehicleDisplayArea
										vehiclesQuery={vehiclesQuery}
										handlePageChange={handlePageChange}
										pageSize={pageSize}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</MetaProvider>
	);
}
