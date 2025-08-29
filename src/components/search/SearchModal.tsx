import { A } from "@solidjs/router";
import { createSignal, createMemo, type Component } from "solid-js";
import { SlidersHorizontal, X } from "lucide-solid";
import SearchInput from "./SearchInput";
import Hoverable from "../Hoverable";
import { useSearch } from "../../context/SearchContext";
import FilterSidebar from "../filter/FilterSidebar";
import YourLogo from "~/components/logo/YourLogo";

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal: Component<SearchModalProps> = (props) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = createSignal(false);
  const {
    searchQuery,
    onSearchChange,
    selectedBrands,
    selectedCategories,
    selectedFuelTypes,
  } = useSearch();

  const hasActiveFilters = createMemo(
    () =>
      selectedBrands().length > 0 ||
      selectedCategories().length > 0 ||
      selectedFuelTypes().length > 0
  );

  return (
    <div class="fixed inset-0 bg-white z-50 nav-padding">
      <div class="flex justify-center items-center mb-10 mt-10">
        <A
          href="/"
          class="text-xl items-center justify-center"
          aria-label="Homepage"
        >
          <YourLogo class="h-4 md:h-5 w-auto text-black" />
        </A>
        <div class="absolute top-2 right-3 md:right-11 lg:right-17">
          <button onClick={props.onClose} class="text-black">
            <X size={24} />
          </button>
        </div>
      </div>
      <div class="flex flex-col space-y-4">
        <div class="flex bg-neutral-50 rounded-full">
          <div
            class="relative flex items-center"
            onMouseLeave={() => setIsFilterDropdownOpen(false)}
          >
            <Hoverable
              as="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFilterDropdownOpen(!isFilterDropdownOpen());
              }}
              class={`text-black w-10 h-10 z-10 rounded-full inline-flex justify-center items-center ${
                isFilterDropdownOpen() || hasActiveFilters()
                  ? "bg-primary-accent"
                  : "bg-neutral-50"
              }`}
              aria-label="Toggle filters"
              enableHoverCircle={true}
              hoverCircleColor="hsl(75, 99%, 52%)"
              applyOverflowHidden={true}
            >
              <SlidersHorizontal size={20} />
            </Hoverable>
            <FilterSidebar show={isFilterDropdownOpen()} />
          </div>
          <div class="flex-grow">
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSearchSubmit={props.onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
