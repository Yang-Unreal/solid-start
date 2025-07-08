// src/app.tsx
import { Router, useLocation, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import {
  Suspense,
  Show,
  createEffect,
  createSignal,
  createMemo,
} from "solid-js";
import Nav from "~/components/Nav";
import TopNav from "~/components/TopNav";
import "./app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { SearchProvider } from "~/context/SearchContext";

import { Menu } from "lucide-solid";

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

        const showNav = createMemo(
          () =>
            !isDashboardRoute() &&
            location.pathname !== "/products/new" &&
            !location.pathname.startsWith("/dashboard/products")
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
            <QueryClientProvider client={queryClient}>
              <MetaProvider>
                <Title>Liming</Title>
                <Meta
                  name="description"
                  content="Let the hidden pears shine for the world"
                />
                <Show when={isDashboardRoute()}>
                  <TopNav onLogoutSuccess={handleLogoutSuccess} />
                  <main class="flex-1 flex flex-col min-w-0 overflow-auto pt-16">
                    <Suspense fallback={null}>
                      <Show
                        when={
                          !session().isPending &&
                          (session().data?.user || !isDashboardRoute())
                        }
                      >
                        {props.children}
                      </Show>
                    </Suspense>
                  </main>
                </Show>

                <Show when={!isDashboardRoute()}>
                  {showNav() && <Nav />}
                  <main class="flex-grow">
                    <Suspense fallback={null}>{props.children}</Suspense>
                  </main>
                </Show>
              </MetaProvider>
            </QueryClientProvider>
          </SearchProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
