import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useLocation, A, useNavigate } from "@solidjs/router";
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-solid";
import {
  currentTheme,
  setCurrentTheme as setCurrentThemeSignal,
  applyTheme,
} from "./ThemeManager";
import type { Component } from "solid-js";
import { authClient } from "~/lib/auth-client";

type Theme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "theme";

const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

function setTheme(newTheme: Theme) {
  setCurrentThemeSignal(newTheme);
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }
  applyTheme(newTheme);
  setIsDropdownOpen(false);
}

const ThemeIconDisplay: Component<{ size: number; class?: string }> = (
  props
) => {
  return (
    <Show
      when={currentTheme() === "light"}
      fallback={
        <Show
          when={currentTheme() === "dark"}
          fallback={<Monitor size={props.size} class={props.class} />}
        >
          <Moon size={props.size} class={props.class} />
        </Show>
      }
    >
      <Sun size={props.size} class={props.class} />
    </Show>
  );
};

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = authClient.useSession();
  const [isClientRendered, setIsClientRendered] = createSignal(false);
  let dropdownRef: HTMLLIElement | undefined;

  onMount(() => {
    setIsClientRendered(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  const activeLinkClasses = (path: string) => {
    // ACCESSIBILITY FIX: Using a lighter shade of sky for better contrast against the dark background.
    const baseActive = "text-sky-600 dark:text-sky-400 font-semibold";
    const baseInactive =
      "text-neutral-600 dark:text-neutral-200 hover:text-sky-600 dark:hover:text-sky-400 font-medium";
    return location.pathname === path ? baseActive : baseInactive;
  };

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login", { replace: true });
  };

  const iconSize = 20;
  const authIconSize = 18;
  const iconBaseClass = "text-neutral-600 dark:text-neutral-300";
  const linkBaseClass =
    "transition-colors duration-150 text-sm flex items-center";

  return (
    <nav class="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700/80 shadow-sm">
      <ul class="flex items-center h-full px-4 sm:px-6 lg:px-8 py-3 font-sans">
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

        <li class="ml-auto">
          <ul class="flex items-center space-x-3 sm:space-x-4">
            <Show when={!session().isPending && session().data?.user}>
              <li class="mx-1.5 sm:mx-3">
                <A
                  href="/dashboard"
                  class={`${activeLinkClasses("/dashboard")} ${linkBaseClass}`}
                >
                  <LayoutDashboard size={authIconSize} class="mr-1 sm:mr-2" />
                  Dashboard
                </A>
              </li>
              <li class="mx-1.5 sm:mx-3">
                <button
                  onClick={handleLogout}
                  class={`${linkBaseClass} text-neutral-600 dark:text-neutral-200 hover:text-sky-600 dark:hover:text-sky-400 font-medium`}
                  aria-label="Logout"
                >
                  <LogOut size={authIconSize} class="mr-1 sm:mr-2" />
                  Logout
                </button>
              </li>
            </Show>
            <Show when={!session().isPending && !session().data?.user}>
              <li class="mx-1.5 sm:mx-3">
                <A
                  href="/login"
                  class={`${activeLinkClasses("/login")} ${linkBaseClass}`}
                >
                  <LogIn size={authIconSize} class="mr-1 sm:mr-2" />
                  Sign In
                </A>
              </li>
              <li class="mx-1.5 sm:mx-3">
                <A
                  href="/signup"
                  class={`${activeLinkClasses("/signup")} ${linkBaseClass}`}
                >
                  <UserPlus size={authIconSize} class="mr-1 sm:mr-2" />
                  Sign Up
                </A>
              </li>
            </Show>
            <li class="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                class={`p-2 flex items-center justify-center transition-colors duration-150 rounded-full ${
                  isDropdownOpen()
                    ? "bg-neutral-200 dark:bg-neutral-700"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-700/60"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-sky-500 dark:focus:ring-sky-400`}
                aria-label="Select theme"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen()}
              >
                <Show
                  when={isClientRendered()}
                  fallback={<Monitor size={iconSize} class={iconBaseClass} />}
                >
                  <ThemeIconDisplay size={iconSize} class={iconBaseClass} />
                </Show>
              </button>
              <Show when={isDropdownOpen()}>
                <div class="animate-fade-in absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  <button
                    onClick={() => setTheme("light")}
                    class="w-full text-left px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center group transition-colors duration-150"
                  >
                    <Sun
                      size={16}
                      class="mr-2 text-neutral-600 dark:text-neutral-100"
                    />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    class="w-full text-left px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center group transition-colors duration-150"
                  >
                    <Moon
                      size={16}
                      class="mr-2 text-neutral-600 dark:text-neutral-100"
                    />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    class="w-full text-left px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center group transition-colors duration-150"
                  >
                    <Monitor
                      size={16}
                      class="mr-2 text-neutral-600 dark:text-neutral-100"
                    />
                    System
                  </button>
                </div>
              </Show>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
