import { Suspense } from "solid-js";
import Nav from "./Nav";

export function AppContent(props: {
  children: any;
}) {
  return (
    <>
        <Nav />
        <main class="flex-grow">
          <Suspense fallback={null}>{props.children}</Suspense>
        </main>
    </>
  );
}

