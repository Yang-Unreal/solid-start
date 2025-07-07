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
import SideNav from "~/components/SideNav";
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
        const [sideNavOpen, setSideNavOpen] = createSignal(false);
        const handleCloseSideNav = () => setSideNavOpen(false);
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
                  <div class="flex h-screen bg-neutral-100">
                    {/* Mobile Header */}
                    <div class="fixed top-0 left-0 right-0 z-10 bg-white shadow-md h-16 flex items-center justify-between px-4 md:hidden">
                      <h1 class="text-lg font-semibold text-neutral-800">
                        Dashboard
                      </h1>
                      <button
                        onClick={() => setSideNavOpen(true)}
                        class="p-2 rounded-md bg-white shadow-md border border-neutral-200 hover:bg-neutral-50"
                        aria-label="Open menu"
                      >
                        <Menu size={20} />
                      </button>
                    </div>

                    {/* Desktop Sidebar */}
                    <div class="hidden md:static md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:shadow-md md:flex md:flex-col">
                      <SideNav
                        onClose={handleCloseSideNav}
                        onLogoutSuccess={handleLogoutSuccess}
                      />
                    </div>

                    {/* Mobile Menu */}
                    <Show when={sideNavOpen()}>
                      <div
                        class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={handleCloseSideNav}
                      />
                      <div class="fixed top-0 left-0 h-screen w-full max-w-sm z-50 bg-white">
                        <SideNav
                          onClose={handleCloseSideNav}
                          onLogoutSuccess={handleLogoutSuccess}
                        />
                      </div>
                    </Show>

                    {/* Main Content Area for Dashboard */}
                    <main class="flex-1 flex flex-col min-w-0 overflow-auto px-4 sm:px-6 lg:px-8">
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
                  </div>
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
