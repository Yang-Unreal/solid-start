// src/app.tsx
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
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { SearchProvider } from "~/context/SearchContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      experimental_prefetchInRender: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function AppContent(props: {
  children: any;
  session: any;
  handleLogoutSuccess: () => void;
  isDashboardRoute: () => boolean;
  isTransparentNavPage: () => boolean;
  isScrolled: () => boolean;
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
        />

        <main class="flex-grow">
          <Suspense fallback={null}>{props.children}</Suspense>
        </main>
      </MetaProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <Router
      root={(props) => {
        const location = useLocation();
        const navigate = useNavigate();
        const session = authClient.useSession();
        const handleLogoutSuccess = () => navigate("/login", { replace: true });

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
          setIsScrolled(window.scrollY > 0);
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
        return (
          <SearchProvider>
            <AppContent
              children={props.children}
              session={session}
              handleLogoutSuccess={handleLogoutSuccess}
              isDashboardRoute={isDashboardRoute}
              isTransparentNavPage={isTransparentNavPage}
              isScrolled={isScrolled}
            />
          </SearchProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
