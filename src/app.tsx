import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";
import { SearchProvider } from "~/context/SearchContext";
import { LenisProvider } from "~/context/LenisContext";
import { AppContent } from "~/components/AppContent";
import { AuthProvider } from "~/context/AuthContext";
import { PageTransitionProvider } from "~/context/PageTransitionContext";
import { MenuProvider } from "~/context/MenuContext";
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "~/lib/query-client";

export default function App() {
  return (
    <LenisProvider>
      <Router
        root={(props) => {
          return (
            <AuthProvider>
              <SearchProvider>
                <PageTransitionProvider>
                  <MenuProvider>
                    <QueryClientProvider client={queryClient}>
                      <AppContent children={props.children} />
                    </QueryClientProvider>
                  </MenuProvider>
                </PageTransitionProvider>
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
