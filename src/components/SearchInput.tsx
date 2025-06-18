import type { Accessor } from "solid-js";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  selectClasses: string;
}

const SearchInput = (props: SearchInputProps) => {
  return (
    <div class="mb-6">
      <label for="search-input" class="sr-only">
        Search Products
      </label>
      <input
        id="search-input"
        type="search"
        placeholder="Search for products by name, brand, model..."
        value={props.searchQuery()}
        onInput={(e) => props.onSearchChange(e.currentTarget.value)}
        class={props.selectClasses}
        aria-label="Search products"
      />
    </div>
  );
};

export default SearchInput;
