import {
  createUniqueId,
  type Accessor,
  type ParentProps,
  createSignal,
} from "solid-js";
import { Search } from "lucide-solid";
import { useNavigate, useLocation } from "@solidjs/router"; // Added useLocation
import MagneticLink from "./MagneticLink";
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
  const [
    shouldTriggerSearchButtonLeaveAnimation,
    setShouldTriggerSearchButtonLeaveAnimation,
  ] = createSignal(false);

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
        <button
          type="submit"
          class="absolute inset-y-0 right-0 flex items-center cursor-pointer"
          aria-label="Submit search"
          onClick={handleSearchSubmit}
        >
          <div
            onMouseEnter={() =>
              setShouldTriggerSearchButtonLeaveAnimation(false)
            }
            onMouseLeave={() =>
              setShouldTriggerSearchButtonLeaveAnimation(true)
            }
          >
            <MagneticLink
              class={`w-10 h-10  flex justify-center items-center rounded-full `}
              enableHoverCircle={true}
              applyOverflowHidden={true}
              hoverCircleColor="hsl(75, 99%, 52%)"
              triggerLeaveAnimation={shouldTriggerSearchButtonLeaveAnimation}
              setTriggerLeaveAnimation={
                setShouldTriggerSearchButtonLeaveAnimation
              }
            >
              {(ref) => (
                <div ref={ref}>
                  <Search size={20} />
                </div>
              )}
            </MagneticLink>
          </div>
        </button>
      </div>
    </form>
  );
};

export default SearchInput;
