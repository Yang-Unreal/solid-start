import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";
import { SearchProvider } from "~/context/SearchContext";
import { LenisProvider } from "~/context/LenisContext";
import { AppContent } from "~/components/AppContent";
import { AuthProvider } from "~/context/AuthContext";
import { QueryClientProvider } from "@tanstack/solid-query";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { queryClient } from "~/lib/query-client";

export default function App() {
  return (
    <LenisProvider>
      <Router
        root={(props) => {
          return (
            <AuthProvider>
              <SearchProvider>
                <QueryClientProvider client={queryClient}>
                  <MetaProvider>
                    <AppContent children={props.children} />
                  </MetaProvider>
                </QueryClientProvider>
              </SearchProvider>
            </AuthProvider>
          );
        }}
      >
        <FileRoutes />
      </Router>
    </LenisProvider>
  );
}
