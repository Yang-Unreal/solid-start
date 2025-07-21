// src/app.tsx
import { Router, useLocation, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, createEffect, createMemo } from "solid-js";
import Nav from "~/components/Nav";

import "./app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { SearchProvider } from "~/context/SearchContext";
import {
  HeroVisibilityProvider,
  useHeroVisibility,
} from "~/context/HeroVisibilityContext";

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
  isHeroVisible: () => boolean;
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
          transparent={props.isTransparentNavPage() && props.isHeroVisible()}
          removeNavContainerClass={
            props.isTransparentNavPage() && props.isHeroVisible()
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

        return (
          <SearchProvider>
            <HeroVisibilityProvider>
              {(() => {
                const { isHeroVisible } = useHeroVisibility();
                const isTransparentNavPage = createMemo(
                  () => location.pathname === "/"
                );
                return (
                  <AppContent
                    children={props.children}
                    session={session}
                    handleLogoutSuccess={handleLogoutSuccess}
                    isDashboardRoute={isDashboardRoute}
                    isTransparentNavPage={isTransparentNavPage}
                    isHeroVisible={isHeroVisible}
                  />
                );
              })()}
            </HeroVisibilityProvider>
          </SearchProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
