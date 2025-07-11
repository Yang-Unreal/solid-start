// src/components/FilterSidebar.tsx
import { createMemo, Show } from "solid-js";
import { useQuery, type UseQueryResult } from "@tanstack/solid-query";
import FilterDropdown from "~/components/FilterDropdowns";
import { useSearch } from "~/context/SearchContext";

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

export default function FilterSidebar() {
  const {
    selectedBrands,
    setSelectedBrands,
    selectedCategories,
    setSelectedCategories,
    selectedFuelTypes,
    setSelectedFuelTypes,
    showFilters,
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
  const availableCategories = createMemo(() =>
    Object.entries(filterOptionsQuery.data?.category || {}).map(
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
      class={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-40 pt-20 px-4 transition-transform duration-300 ease-in-out ${
        showFilters() ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div class="flex flex-col space-y-2">
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Brand"
          options={availableBrands().map((b) => b.value)}
          selectedOptions={selectedBrands()}
          onSelect={(option) =>
            setSelectedBrands(
              selectedBrands().includes(option)
                ? selectedBrands().filter((b) => b !== option)
                : [...selectedBrands(), option]
            )
          }
        />
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Category"
          options={availableCategories().map((c) => c.value)}
          selectedOptions={selectedCategories()}
          onSelect={(option) =>
            setSelectedCategories(
              selectedCategories().includes(option)
                ? selectedCategories().filter((c) => c !== option)
                : [...selectedCategories(), option]
            )
          }
        />
        <div class="h-[0.5px] bg-gray-300 w-full"></div>
        <FilterDropdown
          title="Fuel Type"
          options={availableFuelTypes().map((f) => f.value)}
          selectedOptions={selectedFuelTypes()}
          onSelect={(option) =>
            setSelectedFuelTypes(
              selectedFuelTypes().includes(option)
                ? selectedFuelTypes().filter((f) => f !== option)
                : [...selectedFuelTypes(), option]
            )
          }
        />
      </div>
    </div>
  );
}
