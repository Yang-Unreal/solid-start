import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import ThemeManager from "./components/ThemeManager";
import { MetaProvider } from "@solidjs/meta";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <ThemeManager />
          <Nav />
          <div class="flex-grow pt-16">
            <MetaProvider>
              <Suspense>{props.children}</Suspense>
            </MetaProvider>
          </div>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
