// src/components/ThemeManager.tsx (or a suitable path)
import { createSignal, onMount, onCleanup, Component } from "solid-js";

type Theme = "light" | "dark" | "system";
const THEME_STORAGE_KEY = "theme";

// Signals and functions can be exported if Nav still needs them,
// or they can be managed via context if preferred for broader use.
export const [currentTheme, setCurrentTheme] = createSignal<Theme>("system");

export function applyTheme(theme: Theme) {
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

export function getStoredThemePreference(): Theme {
  if (typeof window === "undefined") return "system";
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
    return storedTheme;
  }
  return "system";
}

const ThemeManager: Component = () => {
  onMount(() => {
    // Initial theme application based on stored preference or system
    // This part might be redundant if your inline script in entry-server.tsx already handles it.
    // However, setting the signal and the media query listener is important.
    const initialTheme = getStoredThemePreference();
    setCurrentTheme(initialTheme);
    // applyTheme(initialTheme); // Inline script in head should handle the *very first* application

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (currentTheme() === "system") {
        applyTheme("system"); // Re-apply system theme if it changes
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    onCleanup(() => mediaQuery.removeEventListener("change", handleChange));
  });

  return null; // This component doesn't render anything visible
};

export default ThemeManager;
