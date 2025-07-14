import { createUniqueId, type Accessor, type ParentProps } from "solid-js";
import { Search } from "lucide-solid";
import { useNavigate, useLocation } from "@solidjs/router"; // Added useLocation

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  class?: string;
}

const SearchInput = (props: SearchInputProps) => {
  const uniqueId = createUniqueId();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const handleSearchSubmit = (e: Event) => {
    e.preventDefault();
    const targetPath = location.pathname.startsWith("/dashboard")
      ? "/dashboard/products"
      : "/products";
    navigate(targetPath);
  };

  return (
    <form onSubmit={handleSearchSubmit}>
      <div class="relative flex items-center">
        <label for={uniqueId} class="sr-only">
          Search Products
        </label>
        <input
          id={uniqueId}
          type="search"
          value={props.searchQuery()}
          onInput={(e) => props.onSearchChange(e.currentTarget.value)}
          class={`w-80 h-10 pl-4 pr-10  bg-neutral-50 rounded-full focus:outline-none transition-all duration-200 ease-in-out text-black ${
            props.class ?? ""
          }`}
          aria-label="Search products"
          placeholder="CHINA'S BEST, FOUND FOR YOU"
        />
        <button
          type="submit"
          class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
          aria-label="Submit search"
          onClick={handleSearchSubmit}
        >
          <Search size={18} class="text-black" />
        </button>
      </div>
    </form>
  );
};

export default SearchInput;
