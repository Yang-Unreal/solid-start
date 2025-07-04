import { createSignal } from "solid-js";
import { useLocation, A, useNavigate } from "@solidjs/router";
import MenuDrawer from "~/components/MenuDrawer";
import { ShoppingBag } from "lucide-solid";
import MagneticLink from "~/components/MagneticLink";

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

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showMenuButton, setShowMenuButton] = createSignal(true); // Initially false, will be true on mobile

  const linkBaseClass =
    "text-xl absolute items-center transition-colors duration-150";

  return (
    <nav
      class={`absolute w-full z-50 transition-all duration-300 ease-in-out bg-transparent`}
    >
      <div class="relative flex items-center h-24 px-4 sm:px-6 lg:px-8 font-sans justify-center">
        <A
          href="/"
          class={`${
            location.pathname === "/" ? "text-white" : "text-black"
          } ${linkBaseClass}`}
          aria-label="Homepage"
        >
          <YourLogo class="h-4 md:h-6 w-auto" />
        </A>

        <MenuDrawer
          isVisible={showMenuButton()}
          onClose={() => setShowMenuButton(false)}
        />
        <MagneticLink
          onClick={() => navigate("/products")}
          class={`absolute right-6 md:right-12 w-12 h-12 md:w-16 md:h-16 flex justify-center items-center rounded-full`}
          aria-label="Products"
          enableHoverCircle={true}
          hoverCircleColor="#455CE9"
          applyOverflowHidden={true}
        >
          {(ref) => (
            <div ref={ref}>
              <ShoppingBag class={`h-4 md:h-6 w-auto ${ location.pathname === "/" ? "text-white" : "text-black" }`} stroke-width="1.5" />
            </div>
          )}
        </MagneticLink>
      </div>
    </nav>
  );
}
