import { For, createMemo } from "solid-js"; // Import createMemo
import type { Accessor } from "solid-js";
import { Select, createListCollection } from "@ark-ui/solid/select";
import { Portal } from "solid-js/web";

interface FilterDropdownsProps {
  selectedBrand: Accessor<string>;
  selectedCategory: Accessor<string>;
  selectedFuelType: Accessor<string>;
  handleFilterChange: (
    filterType: "brand" | "category" | "fuelType",
    value: string
  ) => void;
  isFetching: Accessor<boolean>;
  brands: string[];
  categories: string[];
  fuelTypes: string[];
}

const FilterDropdowns = (props: FilterDropdownsProps) => {
  // FIX: Wrap createListCollection in createMemo to make it reactive.
  // This will re-create the collection whenever the props.items array changes.
  const brandCollection = createMemo(() =>
    createListCollection({ items: props.brands })
  );
  const categoryCollection = createMemo(() =>
    createListCollection({ items: props.categories })
  );
  const fuelTypeCollection = createMemo(() =>
    createListCollection({ items: props.fuelTypes })
  );

  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Brand Filter */}
      <div>
        <Select.Root
          // FIX: Access the memo's value by calling it as a function.
          collection={brandCollection()}
          value={[props.selectedBrand()]}
          onValueChange={(details) =>
            props.handleFilterChange("brand", details.value[0] || "")
          }
          disabled={props.isFetching()}
        >
          <Select.Label class="sr-only">Brand</Select.Label>
          <Select.Control>
            <Select.Trigger class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out">
              <Select.ValueText>
                {props.selectedBrand() || "All Brands"}
              </Select.ValueText>
              <Select.Indicator class="ml-2 text-gray-500">▼</Select.Indicator>{" "}
            </Select.Trigger>
            <Select.ClearTrigger class="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md">
              Clear
            </Select.ClearTrigger>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-auto p-1 mt-1">
                <Select.ItemGroup>
                  <Select.Item
                    item=""
                    class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                  >
                    <Select.ItemText>All Brands</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                  {/* FIX: Iterate over the memo's value. */}
                  <For each={brandCollection().items}>
                    {(brand) => (
                      <Select.Item
                        item={brand}
                        class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                      >
                        <Select.ItemText>{brand}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    )}
                  </For>
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Portal>
          <Select.HiddenSelect />
        </Select.Root>
      </div>

      {/* Category Filter */}
      <div>
        <Select.Root
          collection={categoryCollection()}
          value={[props.selectedCategory()]}
          onValueChange={(details) =>
            props.handleFilterChange("category", details.value[0] || "")
          }
          disabled={props.isFetching()}
        >
          <Select.Label class="sr-only">Category</Select.Label>
          <Select.Control>
            <Select.Trigger class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out">
              <Select.ValueText>
                {props.selectedCategory() || "All Categories"}
              </Select.ValueText>
              <Select.Indicator class="ml-2 text-gray-500">▼</Select.Indicator>{" "}
            </Select.Trigger>
            <Select.ClearTrigger class="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md">
              Clear
            </Select.ClearTrigger>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-auto p-1 mt-1">
                <Select.ItemGroup>
                  <Select.Item
                    item=""
                    class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                  >
                    <Select.ItemText>All Categories</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                  <For each={categoryCollection().items}>
                    {(category) => (
                      <Select.Item
                        item={category}
                        class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                      >
                        <Select.ItemText>{category}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    )}
                  </For>
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Portal>
          <Select.HiddenSelect />
        </Select.Root>
      </div>

      {/* Fuel Type Filter */}
      <div>
        <Select.Root
          collection={fuelTypeCollection()}
          value={[props.selectedFuelType()]}
          onValueChange={(details) =>
            props.handleFilterChange("fuelType", details.value[0] || "")
          }
          disabled={props.isFetching()}
        >
          <Select.Label class="sr-only">Fuel Type</Select.Label>
          <Select.Control>
            <Select.Trigger class="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out">
              <Select.ValueText>
                {props.selectedFuelType() || "All Fuel Types"}
              </Select.ValueText>
              <Select.Indicator class="ml-2 text-gray-500">▼</Select.Indicator>{" "}
            </Select.Trigger>
            <Select.ClearTrigger class="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md">
              Clear
            </Select.ClearTrigger>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-auto p-1 mt-1">
                <Select.ItemGroup>
                  <Select.Item
                    item=""
                    class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                  >
                    <Select.ItemText>All Fuel Types</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                  <For each={fuelTypeCollection().items}>
                    {(fuelType) => (
                      <Select.Item
                        item={fuelType}
                        class="p-2 cursor-pointer rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ease-in-out text-gray-800"
                      >
                        <Select.ItemText>{fuelType}</Select.ItemText>
                        <Select.ItemIndicator>✓</Select.ItemIndicator>
                      </Select.Item>
                    )}
                  </For>
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Portal>
          <Select.HiddenSelect />
        </Select.Root>
      </div>
    </div>
  );
};

export default FilterDropdowns;
