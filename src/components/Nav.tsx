import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Sun, Moon, Monitor } from "lucide-solid";

type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "theme";

// --- Global Theme State and Logic (remains the same) ---
const [currentTheme, setCurrentTheme] = createSignal<Theme>("system");
const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const isDarkPreferred = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  if (theme === "dark" || (theme === "system" && isDarkPreferred)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function setTheme(newTheme: Theme) {
  setCurrentTheme(newTheme);
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }
  applyTheme(newTheme);
  setIsDropdownOpen(false);
}

if (typeof window !== "undefined") {
  onMount(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    let themeToApply: Theme = "system";
    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      themeToApply = storedTheme;
    }
    setCurrentTheme(themeToApply);
    applyTheme(themeToApply);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (currentTheme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    onCleanup(() => mediaQuery.removeEventListener("change", handleChange));
  });
}

// --- Nav Component ---
export default function Nav() {
  const location = useLocation();

  // Updated activeLinkClasses to be theme-aware
  const activeLinkClasses = (path: string) => {
    const baseActive = "text-[#c2fe0c]"; // Lime green for active link (good contrast on both light/dark)
    const baseInactive =
      "text-neutral-700 dark:text-white hover:text-[#c2fe0c] dark:hover:text-[#c2fe0c]";
    return path === location.pathname ? baseActive : baseInactive;
  };

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  let dropdownRef: HTMLLIElement | undefined;

  if (typeof window !== "undefined") {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    onMount(() => {
      document.addEventListener("click", handleClickOutside);
      onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
      });
    });
  }

  const [isClientRendered, setIsClientRendered] = createSignal(false);
  onMount(() => {
    setIsClientRendered(true);
  });

  const iconSize = 20;
  const dropdownIconSize = 16;

  return (
    // Nav theming: light gray background for light mode, black for dark mode
    <nav class="bg-neutral-100 dark:bg-black shadow-md">
      <ul class="container flex items-center p-3 text-neutral-800 dark:text-white font-sans">
        <li class="mx-1.5 sm:mx-4">
          <a
            href="/"
            class={`${activeLinkClasses(
              "/"
            )} transition-colors duration-150 text-xs sm:text-sm uppercase tracking-wider font-semibold`}
          >
            Home
          </a>
        </li>
        <li class="mx-1.5 sm:mx-4">
          <a
            href="/about"
            class={`${activeLinkClasses(
              "/about"
            )} transition-colors duration-150 text-xs sm:text-sm uppercase tracking-wider font-semibold`}
          >
            About
          </a>
        </li>
        <li class="mx-1.5 sm:mx-4">
          <a
            href="/counter"
            class={`${activeLinkClasses(
              "/counter"
            )} transition-colors duration-150 text-xs sm:text-sm uppercase tracking-wider font-semibold`}
          >
            Counter
          </a>
        </li>
        <li class="mx-1.5 sm:mx-4">
          <a
            href="/todo"
            class={`${activeLinkClasses(
              "/todo"
            )} transition-colors duration-150 text-xs sm:text-sm uppercase tracking-wider font-semibold`}
          >
            ToDo
          </a>
        </li>

        <li class="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            class={`p-1.5 sm:p-2 flex items-center justify-center transition-colors duration-150
                     text-neutral-700 dark:text-white rounded-sm
                     ${
                       isDropdownOpen()
                         ? "text-[#c2fe0c] bg-neutral-200 dark:bg-neutral-800"
                         : "hover:text-[#c2fe0c] hover:bg-neutral-200 dark:hover:bg-neutral-800"
                     }
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-offset-neutral-100 dark:focus:ring-offset-black 
                     focus:ring-[#c2fe0c]`}
            aria-label="Select theme"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen()}
          >
            <Show
              when={isClientRendered()}
              // Fallback icon color needs to adapt if Nav's default text color changes
              fallback={
                <Monitor
                  size={iconSize}
                  class="text-neutral-700 dark:text-white"
                />
              }
            >
              <Show
                when={currentTheme() === "light"}
                fallback={
                  <Show
                    when={currentTheme() === "dark"}
                    fallback={
                      <Monitor
                        size={iconSize}
                        class="text-neutral-700 dark:text-white"
                      />
                    }
                  >
                    <Moon
                      size={iconSize}
                      class="text-neutral-700 dark:text-white"
                    />
                  </Show>
                }
              >
                <Sun size={iconSize} class="text-neutral-700 dark:text-white" />
              </Show>
            </Show>
          </button>
          <Show when={isDropdownOpen()}>
            <div
              class="animate-fade-in absolute right-0 mt-2 w-48
                     bg-white dark:bg-black rounded-sm shadow-lg 
                     border border-neutral-300 dark:border-neutral-700 
                     py-1 z-50"
            >
              <button
                onClick={() => setTheme("light")}
                class="w-full text-left px-3 py-2 text-xs sm:text-sm 
                         text-neutral-700 dark:text-neutral-300 
                         hover:bg-[#c2fe0c] hover:text-black 
                         flex items-center group transition-colors duration-150"
              >
                <Sun
                  size={dropdownIconSize}
                  class="mr-2.5 text-neutral-500 group-hover:text-black transition-colors duration-150"
                />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                class="w-full text-left px-3 py-2 text-xs sm:text-sm 
                         text-neutral-700 dark:text-neutral-300 
                         hover:bg-[#c2fe0c] hover:text-black 
                         flex items-center group transition-colors duration-150"
              >
                <Moon
                  size={dropdownIconSize}
                  class="mr-2.5 text-neutral-500 group-hover:text-black transition-colors duration-150"
                />
                Dark
              </button>
              <button
                onClick={() => setTheme("system")}
                class="w-full text-left px-3 py-2 text-xs sm:text-sm 
                         text-neutral-700 dark:text-neutral-300 
                         hover:bg-[#c2fe0c] hover:text-black 
                         flex items-center group transition-colors duration-150"
              >
                <Monitor
                  size={dropdownIconSize}
                  class="mr-2.5 text-neutral-500 group-hover:text-black transition-colors duration-150"
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
