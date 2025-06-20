import { For, createMemo } from "solid-js";
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
  const brandCollection = createMemo(() =>
    createListCollection({ items: props.brands })
  );
  const categoryCollection = createMemo(() =>
    createListCollection({ items: props.categories })
  );
  const fuelTypeCollection = createMemo(() =>
    createListCollection({ items: props.fuelTypes })
  );

  const getTriggerClass = (isSelected: boolean) => {
    const base =
      "flex items-center justify-between w-full px-4 py-2 text-left rounded-full transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    if (isSelected) {
      return `${base} bg-blue-100 text-blue-800 border border-blue-500 font-medium`;
    }
    return `${base} bg-white text-gray-700 border border-gray-300 hover:bg-gray-100`;
  };

  return (
    <div class="grid grid-cols-3 gap-4 mb-6">
      {/* Brand Filter */}
      <Select.Root
        collection={brandCollection()}
        value={[props.selectedBrand()]}
        onValueChange={(details) =>
          props.handleFilterChange("brand", details.value[0] || "")
        }
        disabled={props.isFetching()}
        positioning={{ sameWidth: true }}
      >
        <Select.Control>
          <Select.Trigger class={getTriggerClass(!!props.selectedBrand())}>
            <Select.ValueText class="truncate">
              {props.selectedBrand() || "All Brands"}
            </Select.ValueText>
            <Select.Indicator class="ml-2">▼</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1 mt-1">
              <Select.ItemGroup>
                <Select.Item
                  item=""
                  class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                >
                  <Select.ItemText>All Brands</Select.ItemText>
                  {/* REMOVED: Checkmark Indicator */}
                </Select.Item>
                <For each={brandCollection().items}>
                  {(brand) => (
                    <Select.Item
                      item={brand}
                      class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                    >
                      <Select.ItemText>{brand}</Select.ItemText>
                      {/* REMOVED: Checkmark Indicator */}
                    </Select.Item>
                  )}
                </For>
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {/* Category Filter */}
      <Select.Root
        collection={categoryCollection()}
        value={[props.selectedCategory()]}
        onValueChange={(details) =>
          props.handleFilterChange("category", details.value[0] || "")
        }
        disabled={props.isFetching()}
        positioning={{ sameWidth: true }}
      >
        <Select.Control>
          <Select.Trigger class={getTriggerClass(!!props.selectedCategory())}>
            <Select.ValueText class="truncate">
              {props.selectedCategory() || "All Categories"}
            </Select.ValueText>
            <Select.Indicator class="ml-2">▼</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1 mt-1">
              <Select.ItemGroup>
                <Select.Item
                  item=""
                  class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                >
                  <Select.ItemText>All Categories</Select.ItemText>
                  {/* REMOVED: Checkmark Indicator */}
                </Select.Item>
                <For each={categoryCollection().items}>
                  {(category) => (
                    <Select.Item
                      item={category}
                      class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                    >
                      <Select.ItemText>{category}</Select.ItemText>
                      {/* REMOVED: Checkmark Indicator */}
                    </Select.Item>
                  )}
                </For>
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {/* Fuel Type Filter */}
      <Select.Root
        collection={fuelTypeCollection()}
        value={[props.selectedFuelType()]}
        onValueChange={(details) =>
          props.handleFilterChange("fuelType", details.value[0] || "")
        }
        disabled={props.isFetching()}
        positioning={{ sameWidth: true }}
      >
        <Select.Control>
          <Select.Trigger class={getTriggerClass(!!props.selectedFuelType())}>
            <Select.ValueText class="truncate">
              {props.selectedFuelType() || "All Fuel Types"}
            </Select.ValueText>
            <Select.Indicator class="ml-2">▼</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content class="bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1 mt-1">
              <Select.ItemGroup>
                <Select.Item
                  item=""
                  class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                >
                  <Select.ItemText>All Fuel Types</Select.ItemText>
                  {/* REMOVED: Checkmark Indicator */}
                </Select.Item>
                <For each={fuelTypeCollection().items}>
                  {(fuelType) => (
                    <Select.Item
                      item={fuelType}
                      class="p-2 cursor-pointer rounded-md hover:bg-blue-50 data-[selected]:bg-blue-100 data-[selected]:font-semibold transition-colors text-gray-800"
                    >
                      <Select.ItemText>{fuelType}</Select.ItemText>
                      {/* REMOVED: Checkmark Indicator */}
                    </Select.Item>
                  )}
                </For>
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </div>
  );
};

export default FilterDropdowns;
