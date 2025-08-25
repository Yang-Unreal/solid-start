import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import "./app.css";
import { SearchProvider } from "~/context/SearchContext";
import { LenisProvider } from "~/context/LenisContext";
import { AppContent } from "~/components/AppContent";
import { AuthProvider } from "~/context/AuthContext";

export default function App() {
  return (
    <LenisProvider>
      <Router
        root={(props) => {
          return (
            <AuthProvider>
              <SearchProvider>
                <AppContent children={props.children} />
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
