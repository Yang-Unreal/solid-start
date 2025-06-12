import { createSignal, Show } from "solid-js";
import { useLocation, A } from "@solidjs/router";
import {
  AlignJustify, // Mobile menu open icon
  MenuSquare, // Mobile menu close icon
} from "lucide-solid";

const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

export default function Nav() {
  const location = useLocation();

  const activeLinkClasses = (path: string) => {
    // Updated text colors for a dark background
    const baseActive = "text-white font-semibold";
    const baseInactive = "text-neutral-300 hover:text-white font-medium";
    return location.pathname === path ? baseActive : baseInactive;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen());
  };

  const linkBaseClass =
    "text-sm flex items-center transition-colors duration-150";

  return (
    <nav
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen()
          ? "h-screen bg-neutral-900" // Full screen when open, now dark
          : "h-16 bg-neutral-900 border-b border-neutral-800 shadow-lg" // Dark background, updated border and shadow
      }`}
    >
      {/* Header for both desktop and mobile (when closed) */}
      <div
        class={`flex items-center h-16 px-4 sm:px-6 lg:px-8 py-3 font-sans ${
          isMobileMenuOpen() ? "hidden" : "justify-between" // Hide this div when mobile menu is open
        } sm:flex`}
      >
        {/* Desktop Navigation Links */}
        <ul class="hidden sm:flex items-center h-full">
          <li class="mx-1.5 sm:mx-3">
            <A href="/" class={`${activeLinkClasses("/")} ${linkBaseClass}`}>
              Home
            </A>
          </li>
          <li class="mx-1.5 sm:mx-3">
            <A
              href="/about"
              class={`${activeLinkClasses("/about")} ${linkBaseClass}`}
            >
              About
            </A>
          </li>
          <li class="mx-1.5 sm:mx-3">
            <A
              href="/dragonfly"
              class={`${activeLinkClasses("/dragonfly")} ${linkBaseClass}`}
            >
              Dragonfly
            </A>
          </li>
          <li class="mx-1.5 sm:mx-3">
            <A
              href="/products"
              class={`${activeLinkClasses("/products")} ${linkBaseClass}`}
            >
              Products
            </A>
          </li>
        </ul>

        {/* Right-aligned items (Auth) - always visible in desktop */}
        <ul class="flex items-center space-x-3 sm:space-x-4 ml-auto"></ul>
      </div>

      {/* Mobile Menu Button (Hamburger/Close) - Always top right on mobile */}
      <div class="absolute top-3 right-4 sm:hidden z-50">
        <button
          onClick={toggleMobileMenu}
          class="p-2 text-neutral-200 hover:bg-neutral-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500"
          aria-label="Toggle mobile menu"
        >
          <Show when={isMobileMenuOpen()} fallback={<AlignJustify size={24} />}>
            <MenuSquare size={24} />
          </Show>
        </button>
      </div>

      {/* Full-screen Mobile Menu Content */}
      <Show when={isMobileMenuOpen()}>
        <div class="flex flex-col h-[calc(100vh-4rem)] justify-between items-center py-8">
          <ul class="flex flex-col items-center space-y-6 text-xl text-neutral-100">
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
              <A href="/dragonfly" onClick={toggleMobileMenu}>
                Dragonfly
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
