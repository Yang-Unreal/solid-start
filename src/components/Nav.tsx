// Nav.tsx
import { createSignal, onMount, onCleanup, Show, Component } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Sun, Moon, Monitor } from "lucide-solid";
// Import from your new ThemeManager module
import {
  currentTheme,
  setCurrentTheme as setCurrentThemeSignal,
  applyTheme,
} from "./ThemeManager"; // Adjust path

// ... (type Theme can also be moved to ThemeManager.tsx and exported)
type Theme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "theme";

const [isDropdownOpen, setIsDropdownOpen] = createSignal(false); // Keep local to Nav

// This setTheme function now updates the shared signal and applies the theme
function setTheme(newTheme: Theme) {
  setCurrentThemeSignal(newTheme); // Update the shared signal
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }
  applyTheme(newTheme); // Use the applyTheme function
  setIsDropdownOpen(false);
}

const ThemeIconDisplay: Component<{ size: number; class?: string }> = (
  props
) => {
  // Uses the imported currentTheme signal
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
    const baseActive = "text-sky-600 dark:text-[#c2fe0c] font-medium";
    const baseInactive =
      "text-neutral-600 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-[#c2fe0c] font-medium";
    return path === location.pathname ? baseActive : baseInactive;
  };

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  const iconSize = 20;
  const dropdownIconSize = 16;
  const iconBaseClass = "text-neutral-600 dark:text-neutral-300";

  return (
    <nav class="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700/80 shadow-sm">
      <ul class="container flex items-center p-3 font-sans">
        {/* Navigation links remain the same */}
        <li class="mx-1.5 sm:mx-3">
          <a
            href="/"
            class={`${activeLinkClasses(
              "/"
            )} transition-colors duration-150 text-sm`}
          >
            Home
          </a>
        </li>
        <li class="mx-1.5 sm:mx-3">
          <a
            href="/about"
            class={`${activeLinkClasses(
              "/about"
            )} transition-colors duration-150 text-sm`}
          >
            About
          </a>
        </li>
        <li class="mx-1.5 sm:mx-3">
          <a
            href="/counter"
            class={`${activeLinkClasses(
              "/counter"
            )} transition-colors duration-150 text-sm`}
          >
            Counter
          </a>
        </li>
        <li class="mx-1.5 sm:mx-3">
          <a
            href="/todo"
            class={`${activeLinkClasses(
              "/todo"
            )} transition-colors duration-150 text-sm`}
          >
            ToDo
          </a>
        </li>

        <li class="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            class={`p-2 flex items-center justify-center transition-colors duration-150 rounded-full
                     ${
                       isDropdownOpen()
                         ? "bg-neutral-200 dark:bg-neutral-700"
                         : "hover:bg-neutral-100 dark:hover:bg-neutral-700/60"
                     }
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-offset-white dark:focus:ring-offset-neutral-900 
                     focus:ring-sky-500 dark:focus:ring-[#c2fe0c]`}
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
            <div
              class="animate-fade-in absolute right-0 mt-2 w-44
                     bg-white dark:bg-neutral-800 rounded-md shadow-lg 
                     border border-neutral-200 dark:border-neutral-700 
                     py-1 z-50"
            >
              <button
                onClick={() => setTheme("light")}
                class="w-full text-left px-3 py-1.5 text-sm 
                         text-neutral-700 dark:text-neutral-200 
                         hover:bg-neutral-100 dark:hover:bg-neutral-700 
                         flex items-center group transition-colors duration-150"
              >
                <Sun
                  size={dropdownIconSize}
                  class="mr-2 text-neutral-500 dark:text-neutral-400"
                />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                class="w-full text-left px-3 py-1.5 text-sm 
                         text-neutral-700 dark:text-neutral-200 
                         hover:bg-neutral-100 dark:hover:bg-neutral-700 
                         flex items-center group transition-colors duration-150"
              >
                <Moon
                  size={dropdownIconSize}
                  class="mr-2 text-neutral-500 dark:text-neutral-400"
                />
                Dark
              </button>
              <button
                onClick={() => setTheme("system")}
                class="w-full text-left px-3 py-1.5 text-sm 
                         text-neutral-700 dark:text-neutral-200 
                         hover:bg-neutral-100 dark:hover:bg-neutral-700 
                         flex items-center group transition-colors duration-150"
              >
                <Monitor
                  size={dropdownIconSize}
                  class="mr-2 text-neutral-500 dark:text-neutral-400"
                />
                System
              </button>
            </div>
          </Show>
        </li>
      </ul>
    </nav>
  );
}
