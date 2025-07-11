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
import FilterSidebar from "~/components/FilterSidebar";

import "./app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import { SearchProvider, useSearch } from "~/context/SearchContext";

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

function AppContent(props: any) {
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
    <QueryClientProvider client={queryClient}>
      <MetaProvider>
        <Title>Liming</Title>
        <Meta
          name="description"
          content="Let the hidden pears shine for the world"
        />
        <Nav onLogoutSuccess={handleLogoutSuccess} session={session} />
        <FilterSidebar />
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
      root={(props) => (
        <SearchProvider>
          <AppContent {...props} />
        </SearchProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
