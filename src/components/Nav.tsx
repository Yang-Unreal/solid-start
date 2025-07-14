import { A, useNavigate, useLocation } from "@solidjs/router";
import { createEffect, onCleanup, createSignal, createMemo } from "solid-js";
import MenuDrawer from "~/components/MenuDrawer";
import { ShoppingBag, SlidersHorizontal } from "lucide-solid";
import MagneticLink from "~/components/MagneticLink";
import SearchInput from "./SearchInput";
import { useSearch } from "../context/SearchContext";
import FilterSidebar from "~/components/FilterSidebar";
import MobileLogo from "./MobileLogo";

const YourLogo = (props: { class?: string }) => (
  <svg
    class={props.class || "h-6 w-auto"}
    viewBox="0 0 450 42.44"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M450 21.22c0 1.48-.16 2.89-.43 4.26-.62 3.15-1.97 6-3.84 8.46-3.84 5.15-9.97 8.5-16.93 8.5h-51.92c-11.74-.03-21.19-9.51-21.19-21.22S365.14.03 376.89 0h64.78v8.5h-64.78c-7.05.03-12.69 5.71-12.69 12.73s5.64 12.69 12.69 12.73h51.92c5.51 0 10.23-3.54 12.01-8.46h-32.77c-.26-1.38-.43-2.79-.43-4.26s.16-2.89.43-4.26h41.53c.26 1.38.43 2.79.43 4.26ZM67.96 33.95v8.5H21.22c-4.79 0-9.18-1.57-12.73-4.26a19.73 19.73 0 0 1-4.23-4.23A21.04 21.04 0 0 1 0 21.22V.03h8.5v21.19c0 7.05 5.71 12.73 12.73 12.73h46.74ZM347.66 0v21.22c0 6.95-3.35 13.12-8.5 16.96a20.346 20.346 0 0 1-9.64 4.04c-.98.16-2 .23-3.05.23-5.51 0-10.5-2.07-14.27-5.54l-1.44-1.44-11.28-11.28-11.84-11.81-.29-.3c-4.95-4.82-12.92-4.72-17.81.16a12.696 12.696 0 0 0-3.74 9.02v21.16h-8.5V21.23c0-5.41 2.07-10.86 6.23-14.99.72-.72 1.48-1.38 2.26-1.97 2.92-2.23 6.26-3.58 9.74-4.04 6.36-.92 13.09 1.08 17.97 5.97l23.68 23.68c.25.27.63.62.89.89 2.23 2 5.18 3.18 8.4 3.18 7.02 0 12.69-5.71 12.69-12.73V0h8.5ZM162.63 42.44c-5.51 0-10.5-2.07-14.27-5.54l-1.44-1.44-11.28-11.28-11.84-11.81-.29-.3c-4.95-4.82-12.92-4.72-17.81.16a12.696 12.696 0 0 0-3.74 9.02v21.16h-8.5V21.22c0-5.41 2.07-10.86 6.23-14.99.72-.72 1.48-1.38 2.26-1.97 2.92-2.23 6.26-3.58 9.74-4.04 6.36-.92 13.09 1.08 17.97 5.97l23.68 23.68c.25.27.63.62.89.89 2.23 2 5.18 3.18 8.4 3.18s6.17-1.18 8.4-3.18c.26-.26.64-.62.89-.89L195.6 6.19A21.112 21.112 0 0 1 213.57.22c3.48.46 6.82 1.8 9.74 4.04.79.59 1.54 1.25 2.26 1.97 4.16 4.13 6.23 9.58 6.23 14.99v21.19h-8.5V21.25c0-3.28-1.25-6.53-3.74-9.02-4.89-4.89-12.86-4.99-17.81-.16l-.29.3-11.84 11.81-11.28 11.28-1.44 1.44c-3.77 3.48-8.76 5.54-14.27 5.54ZM240.3.03h8.5v42.41h-8.5zM76.46.03h8.5v42.41h-8.5z"
      fill="currentColor"
      stroke-width="0"
    />
  </svg>
);

export default function Nav(props: {
  onLogoutSuccess: () => void;
  session: any;
  transparent?: boolean;
  removeNavContainerClass?: boolean;
}) {
  const navigate = useNavigate();

  const [showNav, setShowNav] = createSignal(true); // Controls visibility (top-0 or -top-full)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = createSignal(false); // Controls filter dropdown visibility
  const [
    shouldTriggerFilterButtonLeaveAnimation,
    setShouldTriggerFilterButtonLeaveAnimation,
  ] = createSignal(false);
  const [
    shouldTriggerProductsButtonLeaveAnimation,
    setShouldTriggerProductsButtonLeaveAnimation,
  ] = createSignal(false);
  const { searchQuery, onSearchChange } = useSearch(); // Removed showFilters from destructuring

  let lastScrollY = 0;
  const navHeight = 60; // The height of the nav bar based on h-24 class

  createEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        // At the very top: always show
        setShowNav(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down: hide
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up: show
        setShowNav(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  });

  return (
    <nav
      class={`fixed w-full z-50 nav-padding transition-all ${
        props.removeNavContainerClass ? "" : "nav-container"
      } ${props.transparent ? "bg-transparent" : ""}`}
      style={{
        "background-color": props.transparent
          ? "transparent"
          : "rgba(255, 255, 255, 0.8)",
        top: `${showNav() ? 0 : -navHeight}px`,
      }}
    >
      <div class=" relative flex items-center h-15 font-sans justify-between ">
        <A
          href="/"
          class="text-xl  items-center justify-center mr-8"
          aria-label="Homepage"
        >
          <YourLogo class="h-5 hidden md:block w-auto" />
          <MobileLogo class="h-10 w-10 block md:hidden " />
        </A>
        <div class="flex items-center justify-end">
          {/* Filter button and sidebar moved outside SearchInput form */}
          <div class="flex bg-neutral-50 rounded-full shadow-md">
            <div
              class="relative flex items-center" /* Added mr-2 for spacing */
              onMouseLeave={() => {
                setIsFilterDropdownOpen(false);
                setShouldTriggerFilterButtonLeaveAnimation(true);
              }}
            >
              <MagneticLink
                onClick={(e) => {
                  e.preventDefault(); // Prevent default button behavior (e.g., form submission)
                  e.stopPropagation(); // Stop event propagation to parent elements
                  setIsFilterDropdownOpen(!isFilterDropdownOpen());
                }}
                class={`text-black  w-10 h-10 z-10 rounded-full inline-flex justify-center items-center bg-neutral-50 ${
                  isFilterDropdownOpen() ? "bg-primary-accent" : ""
                }`}
                enableHoverCircle={true}
                hoverCircleColor="hsl(75, 99%, 52%)"
                applyOverflowHidden={true}
                triggerLeaveAnimation={shouldTriggerFilterButtonLeaveAnimation}
                setTriggerLeaveAnimation={
                  setShouldTriggerFilterButtonLeaveAnimation
                }
              >
                {(ref) => (
                  <div ref={ref} class="flex items-center">
                    <SlidersHorizontal size={20} />
                  </div>
                )}
              </MagneticLink>
              <FilterSidebar show={isFilterDropdownOpen()} />
            </div>

            <div class="flex-grow">
              <SearchInput
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
              />
            </div>
          </div>
          <div
            onMouseEnter={() =>
              setShouldTriggerProductsButtonLeaveAnimation(false)
            }
            onMouseLeave={() =>
              setShouldTriggerProductsButtonLeaveAnimation(true)
            }
          >
            <MagneticLink
              onClick={() => navigate("/products")}
              class={`w-10 h-10 shadow-md flex justify-center items-center rounded-full bg-neutral-50`}
              aria-label="Products"
              enableHoverCircle={true}
              hoverCircleColor="hsl(75, 99%, 52%)"
              applyOverflowHidden={true}
              triggerLeaveAnimation={shouldTriggerProductsButtonLeaveAnimation}
              setTriggerLeaveAnimation={
                setShouldTriggerProductsButtonLeaveAnimation
              }
            >
              {(ref) => (
                <div ref={ref}>
                  <ShoppingBag stroke-width="1" size={20} />
                </div>
              )}
            </MagneticLink>
          </div>
          <MenuDrawer
            onLogoutSuccess={props.onLogoutSuccess}
            session={props.session}
          />
        </div>
      </div>
    </nav>
  );
}
