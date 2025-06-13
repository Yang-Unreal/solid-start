import { createSignal, Show } from "solid-js";
import { useLocation, A } from "@solidjs/router";
import {
  AlignJustify, // Mobile menu open icon
  MenuSquare, // Mobile menu close icon
} from "lucide-solid";

const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

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
  const activeLinkClasses = (path: string) => {
    const baseActive = "text-white font-semibold";
    const baseInactive = "text-white/70 hover:text-white font-medium";
    return location.pathname === path ? baseActive : baseInactive;
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen());
  };

  // CHANGE: Increased font size from `text-sm` to `text-base`
  const linkBaseClass =
    "text-base flex items-center transition-colors duration-150";

  return (
    <nav
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen() ? "h-screen bg-black" : "h-16 bg-black shadow-lg"
      }`}
    >
      <div
        class={`flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 font-sans ${
          isMobileMenuOpen() ? "hidden" : ""
        }`}
      >
        {/* --- LEFT SIDE: Logo --- */}
        <A href="/" class="text-white" aria-label="Homepage">
          <YourLogo class="h-4 sm:h-5 w-auto" />
        </A>

        {/* --- RIGHT SIDE: Desktop Links or Mobile Menu Button --- */}
        <div>
          {/* Desktop-only Links */}
          <ul class="hidden sm:flex items-center h-full space-x-3 sm:space-x-4">
            <li>
              <A href="/" class={`${activeLinkClasses("/")} ${linkBaseClass}`}>
                HOME
              </A>
            </li>
            <li>
              <A
                href="/about"
                class={`${activeLinkClasses("/about")} ${linkBaseClass}`}
              >
                ABOUT
              </A>
            </li>
            <li>
              <A
                href="/products"
                class={`${activeLinkClasses("/products")} ${linkBaseClass}`}
              >
                PRODUCTS
              </A>
            </li>
          </ul>

          {/* Mobile-only Menu Button */}
          <div class="sm:hidden">
            <button
              onClick={toggleMobileMenu}
              class="p-2 text-white hover:bg-neutral-800 rounded-md"
              aria-label="Toggle mobile menu"
            >
              <AlignJustify size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen Mobile Menu Content */}
      <Show when={isMobileMenuOpen()}>
        <div class="h-screen flex flex-col items-center justify-center">
          <button
            onClick={toggleMobileMenu}
            class="absolute top-3 right-4 p-2 text-white hover:bg-neutral-800 rounded-md"
            aria-label="Close mobile menu"
          >
            <MenuSquare size={24} />
          </button>
          <ul class="flex flex-col items-center space-y-6 text-xl text-white">
            <li>
              <A href="/" onClick={toggleMobileMenu}>
                Home
              </A>
            </li>
            <li>
              <A href="/about" onClick={toggleMobileMenu}>
                About
              </A>
            </li>
            <li>
              <A href="/products" onClick={toggleMobileMenu}>
                Products
              </A>
            </li>
          </ul>
        </div>
      </Show>
    </nav>
  );
}
