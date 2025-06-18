import { For } from "solid-js"; // Import For component
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
  brands: string[]; // Add brands prop
  categories: string[]; // Add categories prop
  fuelTypes: string[]; // Add fuelTypes prop
}

const FilterDropdowns = (props: FilterDropdownsProps) => {
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* These filter dropdowns are now supplemental to the main search */}
      <div>
        <label for="brand-select" class="sr-only">
          Brand
        </label>
        <select
          id="brand-select"
          value={props.selectedBrand()}
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
          value={props.selectedCategory()}
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
          value={props.selectedFuelType()}
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
