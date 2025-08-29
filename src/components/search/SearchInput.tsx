import { createUniqueId, type Accessor, type ParentProps } from "solid-js";
import { Search } from "lucide-solid";
import { useNavigate, useLocation } from "@solidjs/router"; // Added useLocation
import Hoverable from "~/components/Hoverable";

interface SearchInputProps {
  searchQuery: Accessor<string>;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
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
    props.onSearchSubmit?.();
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
          class={`w-full h-10 pl-1 pr-10 bg-neutral-50 rounded-full focus:outline-none transition-all duration-200 ease-in-out text-black ${
            props.class ?? ""
          }`}
          aria-label="Search products"
          placeholder="China's best, found for you"
        />
        <Hoverable
          as="button"
          type="submit"
          class="absolute inset-y-0 right-0 w-10 h-10 flex items-center justify-center cursor-pointer rounded-full"
          aria-label="Submit search"
          onClick={handleSearchSubmit}
          enableHoverCircle={true}
          hoverCircleColor="hsl(75, 99%, 52%)"
          applyOverflowHidden={true}
        >
          <Search size={18} class="text-black" />
        </Hoverable>
      </div>
    </form>
  );
};

export default SearchInput;
