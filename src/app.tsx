import { Router, useLocation, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import {
  Suspense,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { isServer } from "solid-js/web";
import "./app.css";
import { authClient } from "~/lib/auth-client";
import { SearchProvider } from "~/context/SearchContext";
import { LenisProvider } from "~/context/LenisContext";
import { AppContent } from "~/components/AppContent";

export default function App() {
  return (
    <LenisProvider>
      <Router
        root={(props) => {
          const location = useLocation();
          const navigate = useNavigate();
          const session = authClient.useSession();
          const handleLogoutSuccess = () =>
            navigate("/login", { replace: true });

          const isDashboardRoute = createMemo(() =>
            location.pathname.startsWith("/dashboard")
          );

          createEffect(() => {
            const currentSession = session();
            if (!currentSession.isPending) {
              if (!currentSession.data?.user && isDashboardRoute()) {
                navigate("/login", { replace: true });
              }
            }
          });

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
          const isTransparentNavPage = createMemo(
            () => location.pathname === "/"
          );
          const isHomepage = createMemo(() => location.pathname === "/");

          return (
            <SearchProvider>
              <AppContent
                children={props.children}
                session={session}
                handleLogoutSuccess={handleLogoutSuccess}
                isDashboardRoute={isDashboardRoute}
                isTransparentNavPage={isTransparentNavPage}
                isScrolled={isScrolled}
                isHomepage={isHomepage}
              />
            </SearchProvider>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </LenisProvider>
  );
}
