// src/app.tsx
import { Router, useLocation, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, Show, createEffect } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";

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
        const showNav = () =>
          location.pathname !== "/dashboard" &&
          location.pathname !== "/products/new";

        createEffect(() => {
          const currentSession = session();
          if (!currentSession.isPending) {
            const protectedPaths = ["/dashboard", "/products/new"];
            if (
              !currentSession.data?.user &&
              protectedPaths.includes(location.pathname)
            ) {
              navigate("/login", { replace: true });
            }
          }
        });

        return (
          <QueryClientProvider client={queryClient}>
            <MetaProvider>
              <Title>SolidStart App</Title>
              {showNav() && <Nav />}
              <main class="flex-grow">
                <Suspense fallback={null}>
                  <Show
                    when={
                      session().data?.user ||
                      !(
                        location.pathname === "/dashboard" ||
                        location.pathname === "/products/new"
                      )
                    }
                  >
                    {props.children}
                  </Show>
                </Suspense>
              </main>
            </MetaProvider>
          </QueryClientProvider>
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
