// src/components/FilterSidebar.tsx
import { createMemo } from "solid-js";
import { useQuery } from "@tanstack/solid-query";

import FilterDropdown from "~/components/filter/FilterDropdowns";
import { useSearch } from "~/context/SearchContext";

interface FilterSidebarProps {
  show: boolean;
}

interface FilterOptionsResponse
  extends Record<string, Record<string, number>> {}

const FILTER_OPTIONS_QUERY_KEY = "filterOptions";

const fetchFilterOptionsQueryFn = async (): Promise<FilterOptionsResponse> => {
  let baseUrl = "";
  if (import.meta.env.SSR) {
    baseUrl =
      import.meta.env.VITE_INTERNAL_API_ORIGIN ||
      `http://localhost:${process.env.PORT || 3000}`;
  }
  const fetchUrl = `${baseUrl}/api/filter-options`;
  const response = await fetch(fetchUrl);
  if (!response.ok)
    throw new Error((await response.json()).error || `HTTP error!`);
  return response.json();
};

export default function FilterSidebar(props: FilterSidebarProps) {
  const {
    selectedBrands,
    setSelectedBrands,
    selectedFuelTypes,
    setSelectedFuelTypes,
    selectedPowertrainTypes, // Added
    setSelectedPowertrainTypes, // Added
  } = useSearch();

  const filterOptionsQuery = useQuery<FilterOptionsResponse, Error>(() => ({
    queryKey: [FILTER_OPTIONS_QUERY_KEY] as const,
    queryFn: fetchFilterOptionsQueryFn,
    staleTime: 10 * 1000,
  }));

  const availableBrands = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.brand || {}).map(
      ([value, count]) => ({ value, count })
    )
  );
  const availablePowertrainTypes = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.powertrain_type || {}).map(
      ([value, count]) => ({ value, count })
    )
  );
  const availableFuelTypes = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.fuelType || {}).map(
      ([value, count]) => ({ value, count })
    )
  );

  return (
    <div
      class={`absolute top-full  left-0 w-[calc(100vw-56px)] md:w-70 bg-white shadow-lg rounded-md z-40 p-4 transition-all duration-300 ease-in-out origin-top ${
        props.show
          ? "scale-y-100 opacity-100 visible"
          : "scale-y-0 opacity-0 invisible"
      }`}
    >
      <div class="flex flex-col space-y-2">
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Brand"
          options={availableBrands().map((b) => b.value)}
          selectedOptions={selectedBrands()}
          onSelect={(option) => {
            setSelectedBrands(
              selectedBrands().includes(option)
                ? selectedBrands().filter((b) => b !== option)
                : [...selectedBrands(), option]
            );
          }}
          parentIsOpen={props.show}
        />
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Powertrain Type"
          options={availablePowertrainTypes().map((p) => p.value)}
          selectedOptions={selectedPowertrainTypes()}
          onSelect={(option) => {
            setSelectedPowertrainTypes(
              selectedPowertrainTypes().includes(option)
                ? selectedPowertrainTypes().filter((p) => p !== option)
                : [...selectedPowertrainTypes(), option]
            );
          }}
          parentIsOpen={props.show}
        />
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Fuel Type"
          options={availableFuelTypes().map((f) => f.value)}
          selectedOptions={selectedFuelTypes()}
          onSelect={(option) => {
            setSelectedFuelTypes(
              selectedFuelTypes().includes(option)
                ? selectedFuelTypes().filter((f) => f !== option)
                : [...selectedFuelTypes(), option]
            );
          }}
          parentIsOpen={props.show}
        />
      </div>
    </div>
  );
}
