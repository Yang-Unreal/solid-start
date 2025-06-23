// src/app.tsx
import { Router, useLocation, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, Show, createEffect } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { SearchProvider, useSearch } from "~/context/SearchContext"; // Import SearchProvider and useSearch

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
          const isProtectedPath =
            location.pathname === "/dashboard" ||
            location.pathname === "/products/new";

          if (!currentSession.isPending) {
            if (!currentSession.data?.user && isProtectedPath) {
              navigate("/login", { replace: true });
            }
          }
        });

        return (
          <SearchProvider>
            {" "}
            {/* Move SearchProvider here */}
            <QueryClientProvider client={queryClient}>
              <MetaProvider>
                <Title>SolidStart App</Title>
                {showNav() && <Nav />}
                <main
                  class={`flex-grow ${
                    location.pathname === "/products" &&
                    typeof window !== "undefined" &&
                    window.innerWidth < 768 // Tailwind's 'md' breakpoint is 768px
                      ? "pt-32" // Adjust this value based on the actual height of your mobile nav + search bar
                      : location.pathname === "/dashboard"
                      ? "" // No padding for dashboard on desktop
                      : "pt-16" // Default padding for the top nav
                  }`}
                >
                  <Suspense fallback={null}>
                    <Show
                      when={
                        !session().isPending &&
                        (session().data?.user ||
                          !(
                            location.pathname === "/dashboard" ||
                            location.pathname === "/products/new"
                          ))
                      }
                    >
                      {props.children}
                    </Show>
                  </Suspense>
                </main>
              </MetaProvider>
            </QueryClientProvider>
          </SearchProvider>
        );
      }}
    >
      <FileRoutes /> {/* FileRoutes is now inside the SearchProvider */}
    </Router>
  );
}
