// src/routes/index.tsx
import { Suspense, lazy, createSignal, onMount, Show } from "solid-js";

// --- Eagerly load components visible "above the fold" ---
import DynamicRender from "~/components/DynamicRender"; // LCP component
import Counter from "~/components/Counter";
import Avatar from "~/components/Avatar";
import Controlled from "~/components/switch/Controlled";
import ForList from "~/components/list/For";

// --- Lazy-load components that are "below the fold" ---
const IndexList = lazy(() => import("~/components/list/Index"));
const PortalExample = lazy(() => import("~/components/Portal"));
const AnimeTimer = lazy(() => import("~/components/AnimeTimer"));
const RefsExample = lazy(() => import("~/components/RefsExample"));
const ToDo = lazy(() => import("~/components/Todo"));
const CounterPageContent = lazy(
  () => import("~/components/CounterPageContent")
);

const CardFallback = () => (
  <div class="card-wrapper min-h-[400px]">
    <div class="animate-pulse text-lg text-neutral-400">Loading...</div>
  </div>
);

export default function Home() {
  // Signal to defer rendering of non-LCP components
  const [canShowOtherComponents, setCanShowOtherComponents] =
    createSignal(false);

  // onMount runs on the client after the initial render.
  // This ensures the LCP content renders first, then we render the rest.
  onMount(() => {
    setCanShowOtherComponents(true);
  });

  return (
    <main class=" bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Render placeholder for other components initially */}
        <Show
          when={canShowOtherComponents()}
          fallback={<div class="card-wrapper min-h-[300px] h-full"></div>}
        >
          <div class="card-wrapper">
            <Counter />
            <Avatar
              name="Yang Yang"
              src="https://minio.limingcn.com/solid-start/cloud.webp"
              size="md"
            />
            <Controlled />
          </div>
        </Show>

        {/* This component contains the LCP element and is rendered immediately */}
        <div class="card-content-host">
          <DynamicRender />
        </div>

        {/* Render placeholder for other components initially */}
        <Show
          when={canShowOtherComponents()}
          fallback={<div class="card-content-host min-h-[300px] h-full"></div>}
        >
          <div class="card-content-host">
            <ForList />
          </div>
        </Show>

        {/* --- Below-the-fold components are still lazy-loaded --- */}
        <Show when={canShowOtherComponents()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <IndexList />
            </div>
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <PortalExample />
            </div>
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <RefsExample />
            </div>
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <div class="card-wrapper">
              <AnimeTimer />
            </div>
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <div class="card-wrapper">
              <ToDo />
            </div>
          </Suspense>
          <Suspense fallback={<CardFallback />}>
            <div class="card-wrapper">
              <CounterPageContent />
            </div>
          </Suspense>
        </Show>
      </div>
    </main>
  );
}
