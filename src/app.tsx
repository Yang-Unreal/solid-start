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
import Nav from "~/components/Nav";
import "./app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { queryClient } from "~/lib/query-client";
import { SearchProvider } from "~/context/SearchContext";
import Lenis from "lenis";
import { LenisContext } from "~/context/LenisContext";

function AppContent(props: {
  children: any;
  session: any;
  handleLogoutSuccess: () => void;
  isDashboardRoute: () => boolean;
  isTransparentNavPage: () => boolean;
  isScrolled: () => boolean;
  isHomepage: () => boolean;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MetaProvider>
        <Title>Liming</Title>
        <Meta
          name="description"
          content="Let the hidden pears shine for the world"
        />
        <Nav
          onLogoutSuccess={props.handleLogoutSuccess}
          session={props.session}
          transparent={props.isTransparentNavPage() && !props.isScrolled()}
          removeNavContainerClass={
            props.isTransparentNavPage() && !props.isScrolled()
          }
          isHomepage={props.isHomepage()}
        />
        <main class="flex-grow">
          <Suspense fallback={null}>{props.children}</Suspense>
        </main>
      </MetaProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  let lenis: Lenis | undefined;
  if (!isServer) {
    lenis = new Lenis();

    function raf(time: number) {
      lenis!.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return (
    <LenisContext.Provider value={lenis}>
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
    </LenisContext.Provider>
  );
}
