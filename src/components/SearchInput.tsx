import { createUniqueId, type Accessor } from "solid-js";
import { Search } from "lucide-solid";
import { useNavigate } from "@solidjs/router";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  class?: string;
}

const SearchInput = (props: SearchInputProps) => {
  const uniqueId = createUniqueId();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: Event) => {
    e.preventDefault();
    navigate(`/products`);
  };

  return (
    <form onSubmit={handleSearchSubmit}>
        <div class="relative">
          <label for={uniqueId} class="sr-only">
            Search Products
          </label>
          <input
            id={uniqueId}
            type="search"
            value={props.searchQuery()}
            onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            class={`w-full pl-10 pr-4 py-1 bg-gray-50  rounded-full  focus:outline-none transition-all duration-200 ease-in-out text-black ${
              props.class ?? ""
            }`}
            aria-label="Search products"
            placeholder="CHINA'S BEST, FOUND FOR YOU"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} class="text-gray-300" />
          </div>
        </div>
    </form>
  );
};

export default SearchInput;