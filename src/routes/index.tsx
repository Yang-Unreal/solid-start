// src/routes/index.tsx
import { Suspense, lazy, createSignal, onMount, Show } from "solid-js";

// --- Eagerly load all components that are visible above the fold ---
import HeroSection from "~/components/HeroSection"; // New Hero Section
// --- Lazy-load components that are below the fold ---
const DynamicRender = lazy(() => import("~/components/DynamicRender")); // This contains the LCP element
const Counter = lazy(() => import("~/components/Counter"));
const Avatar = lazy(() => import("~/components/Avatar"));
const Controlled = lazy(() => import("~/components/switch/Controlled"));
const ForList = lazy(() => import("~/components/list/For"));
const IndexList = lazy(() => import("~/components/list/Index"));
const PortalExample = lazy(() => import("~/components/Portal"));
const AnimeTimer = lazy(() => import("~/components/AnimeTimer"));
const RefsExample = lazy(() => import("~/components/RefsExample"));
const ToDo = lazy(() => import("~/components/Todo"));
const CounterPageContent = lazy(
  () => import("~/components/CounterPageContent")
);

// A reusable, styled fallback UI for suspended components
const CardFallback = () => (
  <div class="card-wrapper min-h-[400px]">
    <div class="animate-pulse text-lg text-neutral-400">Loading...</div>
  </div>
);

export default function Home() {
  // Signal to defer rendering/hydration of non-LCP components
  const [canShowOthers, setCanShowOthers] = createSignal(false);

  // onMount runs on the client after the initial render.
  // This ensures the LCP content renders first, then we trigger the rest.
  onMount(() => {
    setCanShowOthers(true);
  });

  return (
    <main class=" bg-neutral-100">
      <HeroSection />

      <div class="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <Show when={canShowOthers()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-wrapper">
              <Counter />
              <Avatar
                name="Yang Yang"
                src="https://minio.limingcn.com/solid-start/cloud.webp"
                size="md"
              />
              <Controlled />
            </div>
          </Suspense>
        </Show>

        {/* --- Card 2: IMMEDIATE RENDER (now lazy-loaded) --- */}
        <Show when={canShowOthers()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <DynamicRender />
            </div>
          </Suspense>
        </Show>

        {/* --- Card 3: Defer Hydration (now lazy-loaded) --- */}
        <Show when={canShowOthers()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <ForList />
            </div>
          </Suspense>
        </Show>

        {/* --- Below-the-fold components are still lazy-loaded --- */}
        {/* We also wrap these in the <Show> to ensure they don't trigger downloads until needed */}
        <Show when={canShowOthers()}>
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
