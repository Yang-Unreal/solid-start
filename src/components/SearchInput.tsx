import { createUniqueId, type Accessor } from "solid-js";
import { Search } from "lucide-solid"; // Import the Search icon

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
}

const SearchInput = (props: SearchInputProps) => {
  const uniqueId = createUniqueId(); // Generate a unique ID for the input

  return (
    <div class="relative">
      {" "}
      {/* Added relative positioning for icon */}
      <label for={uniqueId} class="sr-only">
        Search Products
      </label>
      <input
        id={uniqueId} // Use the generated unique ID
        type="search"
        value={props.searchQuery()} // Call the accessor to get the value
        onInput={(e) => props.onSearchChange(e.currentTarget.value)}
        class="w-full pl-10 pr-4 py-1 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-black"
        aria-label="Search products"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} class="text-gray-400" />
      </div>
    </div>
  );
};

export default SearchInput;
