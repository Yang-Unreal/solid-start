import { createUniqueId, type Accessor } from "solid-js";
import { Search } from "lucide-solid";
import { useNavigate } from "@solidjs/router";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  isHomepage?: boolean;
}

const SearchInput = (props: SearchInputProps) => {
  const uniqueId = createUniqueId();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: Event) => {
    e.preventDefault();
    if (props.isHomepage) {
      // The query is already in localStorage via onSearchChange
      navigate(`/products`);
    }
  };

  const searchInput = (
    <div class="relative">
      <label for={uniqueId} class="sr-only">
        Search Products
      </label>
      <input
        id={uniqueId}
        type="search"
        value={props.searchQuery()}
        onInput={(e) => props.onSearchChange(e.currentTarget.value)}
        class="w-full pl-10 pr-4 py-1 text-left bg-transparent  focus:bg-white  rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-black"
        aria-label="Search products"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} class="text-gray-400" />
      </div>
    </div>
  );

  return props.isHomepage ? (
    <form onSubmit={handleSearchSubmit}>{searchInput}</form>
  ) : (
    searchInput
  );
};

export default SearchInput;
