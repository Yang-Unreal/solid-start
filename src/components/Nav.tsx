import { createSignal, Show } from "solid-js";
import { useLocation, A } from "@solidjs/router";
import {
  AlignJustify, // Changed for mobile menu
  MenuSquare, // Changed for mobile menu close icon
} from "lucide-solid";

const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false); // New state for mobile menu

export default function Nav() {
  const location = useLocation();

  const activeLinkClasses = (path: string) => {
    // ACCESSIBILITY FIX: Using compliant colors for both light and dark modes.
    const baseActive = "text-sky-700 font-semibold";
    const baseInactive = "text-neutral-600 hover:text-sky-700 font-medium";
    return location.pathname === path ? baseActive : baseInactive;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen());
  };

  const linkBaseClass = "text-sm flex items-center";

  return (
    <nav
      class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isMobileMenuOpen()
          ? "h-screen bg-white" // Full screen when open
          : "h-16 bg-white border-b border-neutral-200 shadow-sm"
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
          class="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-500"
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
          <ul class="flex flex-col items-center space-y-6 text-xl text-neutral-800">
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

          <div class="flex flex-col items-center space-y-4 text-neutral-800 text-lg">
            {/* Placeholder for language/privacy notice */}
            <div class="pt-8 text-sm text-neutral-600">
              <span>Deutsch | English</span>
              <p class="mt-2">Privacy notice</p>
            </div>
          </div>
        </div>
      </Show>
    </nav>
  );
}
