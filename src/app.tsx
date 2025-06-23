// src/app.tsx
import {
  Router,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@solidjs/router"; // Import useSearchParams
import { FileRoutes } from "@solidjs/start/router";
import { Suspense, Show, createEffect, createSignal, on } from "solid-js"; // Import createSignal, on
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";

// Helper to get a single string search param, or default
const getSearchParamString = (
  paramValue: string | string[] | undefined,
  defaultValue: string
): string => {
  return Array.isArray(paramValue)
    ? paramValue[0] || defaultValue
    : paramValue || defaultValue;
};

// Local Storage Key for search query
const LS_SEARCH_QUERY_KEY = "productSearchQuery";

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
        const [searchParams, setSearchParams] = useSearchParams(); // Get searchParams here

        // State for the global search input
        const [searchQuery, setSearchQuery] = createSignal(
          getSearchParamString(searchParams.q, "")
        );

        // Persist search query to localStorage and URL whenever it changes.
        // This effect runs after initial render/hydration.
        createEffect(
          on(searchQuery, (query) => {
            if (typeof window !== "undefined") {
              localStorage.setItem(LS_SEARCH_QUERY_KEY, query); // Persist to localStorage
            }
            // Update URL search param 'q' only if it's different to avoid unnecessary history entries
            const currentUrlQuery = getSearchParamString(searchParams.q, "");
            if (currentUrlQuery !== query) {
              setSearchParams({ ...searchParams, q: query });
            }
          })
        );

        // Handler for search input changes
        const handleSearchChange = (query: string) => {
          setSearchQuery(query);
        };

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
          <QueryClientProvider client={queryClient}>
            <MetaProvider>
              <Title>SolidStart App</Title>
              {showNav() && (
                <Nav
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                />
              )}
              <main
                class={`flex-grow ${
                  location.pathname === "/products" &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 768 // Tailwind's 'md' breakpoint is 768px
                    ? "pt-32" // Adjust this value based on the actual height of your mobile nav + search bar
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
        );
      }}
    >
      <FileRoutes />
    </Router>
  );
}
