import { createUniqueId, type Accessor } from "solid-js";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
}

const SearchInput = (props: SearchInputProps) => {
  const uniqueId = createUniqueId(); // Generate a unique ID for the input

  return (
    <div>
      {" "}
      {/* Removed mb-6 to allow parent components to control margin */}
      <label for={uniqueId} class="sr-only">
        Search Products
      </label>
      <input
        id={uniqueId} // Use the generated unique ID
        type="search"
        value={props.searchQuery()} // Call the accessor to get the value
        onInput={(e) => props.onSearchChange(e.currentTarget.value)}
        class="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out"
        aria-label="Search products"
      />
    </div>
  );
};

export default SearchInput;
