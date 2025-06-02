// src/app.tsx
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import ThemeManager from "./components/ThemeManager"; // Assuming this is your theme setup component
import { MetaProvider, Title } from "@solidjs/meta"; // Added Title for consistency
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"; // Import these

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Example: Default staleTime and gcTime for all queries
      // staleTime: 5 * 60 * 1000, // 5 minutes until stale
      // gcTime: 10 * 60 * 1000,    // 10 minutes until garbage collected
    },
  },
});

export default function App() {
  return (
    <Router
      root={(props) => (
        // Wrap the entire content with QueryClientProvider
        <QueryClientProvider client={queryClient}>
          {/* ThemeManager can be inside or outside, depending on its needs.
              If it doesn't rely on queryClient, outside is fine.
              If it might, place it inside. For simplicity, keeping current structure. */}
          <ThemeManager />
          <MetaProvider>
            {" "}
            {/* MetaProvider should ideally wrap all content that might set meta tags */}
            <Title>SolidStart App</Title> {/* Example default title */}
            <Nav />
            {/* 'flex-grow pt-16' is for layout if Nav is fixed height (h-16) */}
            <main class="flex-grow pt-16">
              {" "}
              {/* Changed div to main for semantics */}
              <Suspense>{props.children}</Suspense>
            </main>
          </MetaProvider>
        </QueryClientProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
