import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import "./app.css";
import { SearchProvider } from "~/context/SearchContext";
import { LenisProvider } from "~/context/LenisContext";
import { AppContent } from "~/components/AppContent";
import { AuthProvider } from "~/context/AuthContext";

export default function App() {
  return (
    <LenisProvider>
      <Router
        root={(props) => {
          const location = useLocation();
          const isTransparentNavPage = createMemo(
            () => location.pathname === "/"
          );
          const isHomepage = createMemo(() => location.pathname === "/");

          const [isScrolled, setIsScrolled] = createSignal(false);
          const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
          };

          if (!isServer) {
            onMount(() => {
              window.addEventListener("scroll", handleScroll);
            });

            onCleanup(() => {
              window.removeEventListener("scroll", handleScroll);
            });
          }

          return (
            <AuthProvider>
              <SearchProvider>
                <AppContent
                  children={props.children}
                  isTransparentNavPage={isTransparentNavPage}
                  isScrolled={isScrolled}
                  isHomepage={isHomepage}
                />
              </SearchProvider>
            </AuthProvider>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </LenisProvider>
  );
}
