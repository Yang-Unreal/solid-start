import type { Accessor } from "solid-js";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
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
        class="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
        aria-label="Search products"
      />
    </div>
  );
};

export default SearchInput;
