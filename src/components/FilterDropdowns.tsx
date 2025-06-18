import { For, createEffect } from "solid-js";
import type { Accessor } from "solid-js";

interface FilterDropdownsProps {
  selectedBrand: Accessor<string>;
  selectedCategory: Accessor<string>;
  selectedFuelType: Accessor<string>;
  handleFilterChange: (
    filterType: "brand" | "category" | "fuelType",
    value: string
  ) => void;
  isFetching: Accessor<boolean>;
  selectClasses: string;
  brands: string[];
  categories: string[];
  fuelTypes: string[];
}

const FilterDropdowns = (props: FilterDropdownsProps) => {
  let brandSelectRef: HTMLSelectElement | undefined;
  let categorySelectRef: HTMLSelectElement | undefined;
  let fuelTypeSelectRef: HTMLSelectElement | undefined;

  // Effect to ensure brand dropdown value is set correctly after options load
  createEffect(() => {
    if (brandSelectRef && props.brands.length > 0) {
      const selectedValue = props.selectedBrand();
      if (selectedValue && brandSelectRef.value !== selectedValue) {
        brandSelectRef.value = selectedValue;
      } else if (!selectedValue && brandSelectRef.value !== "") {
        brandSelectRef.value = ""; // Reset to "All Brands" if no value
      }
    }
  });

  // Effect to ensure category dropdown value is set correctly after options load
  createEffect(() => {
    if (categorySelectRef && props.categories.length > 0) {
      const selectedValue = props.selectedCategory();
      if (selectedValue && categorySelectRef.value !== selectedValue) {
        categorySelectRef.value = selectedValue;
      } else if (!selectedValue && categorySelectRef.value !== "") {
        categorySelectRef.value = ""; // Reset to "All Categories" if no value
      }
    }
  });

  // Effect to ensure fuel type dropdown value is set correctly after options load
  createEffect(() => {
    if (fuelTypeSelectRef && props.fuelTypes.length > 0) {
      const selectedValue = props.selectedFuelType();
      if (selectedValue && fuelTypeSelectRef.value !== selectedValue) {
        fuelTypeSelectRef.value = selectedValue;
      } else if (!selectedValue && fuelTypeSelectRef.value !== "") {
        fuelTypeSelectRef.value = ""; // Reset to "All Fuel Types" if no value
      }
    }
  });

  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* These filter dropdowns are now supplemental to the main search */}
      <div>
        <label for="brand-select" class="sr-only">
          Brand
        </label>
        <select
          id="brand-select"
          ref={brandSelectRef}
          value={props.selectedBrand()} // Keep value prop for initial render and reactivity
          onChange={(e) =>
            props.handleFilterChange("brand", e.currentTarget.value)
          }
          class={props.selectClasses}
          disabled={props.isFetching()}
        >
          <option value="">All Brands</option>
          <For each={props.brands}>
            {(brand) => <option value={brand}>{brand}</option>}
          </For>
        </select>
      </div>
      <div>
        <label for="category-select" class="sr-only">
          Category
        </label>
        <select
          id="category-select"
          ref={categorySelectRef}
          value={props.selectedCategory()} // Keep value prop for initial render and reactivity
          onChange={(e) =>
            props.handleFilterChange("category", e.currentTarget.value)
          }
          class={props.selectClasses}
          disabled={props.isFetching()}
        >
          <option value="">All Categories</option>
          <For each={props.categories}>
            {(category) => <option value={category}>{category}</option>}
          </For>
        </select>
      </div>
      <div>
        <label for="fuel-type-select" class="sr-only">
          Fuel Type
        </label>
        <select
          id="fuel-type-select"
          ref={fuelTypeSelectRef}
          value={props.selectedFuelType()} // Keep value prop for initial render and reactivity
          onChange={(e) =>
            props.handleFilterChange("fuelType", e.currentTarget.value)
          }
          class={props.selectClasses}
          disabled={props.isFetching()}
        >
          <option value="">All Fuel Types</option>
          <For each={props.fuelTypes}>
            {(fuelType) => <option value={fuelType}>{fuelType}</option>}
          </For>
        </select>
      </div>
    </div>
  );
};

export default FilterDropdowns;
