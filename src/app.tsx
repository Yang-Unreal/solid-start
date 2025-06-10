// src/app.tsx
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

// Create a new QueryClient instance with proper configuration
// Temporary workaround for the experimental_prefetchInRender issue
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Other recommended defaults for SolidJS
      staleTime: 5 * 60 * 1000, // 5 minutes until stale
      gcTime: 10 * 60 * 1000, // 10 minutes until garbage collected
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Prevent refetching on window focus in SSR environments
      refetchOnWindowFocus: false,
      // Prevent refetching on reconnect by default
      refetchOnReconnect: false,
      // Disable the experimental feature that's causing issues
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
        const showNav = () => location.pathname !== "/dashboard";

        return (
          <QueryClientProvider client={queryClient}>
            <MetaProvider>
              <Title>SolidStart App</Title>
              {showNav() && <Nav />}
              <main class="flex-grow">
                <Suspense fallback={null}>{props.children}</Suspense>
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
