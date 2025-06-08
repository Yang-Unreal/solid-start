// src/routes/index.tsx
import { Suspense, lazy } from "solid-js";

// --- MODIFIED: Eagerly load components visible "above the fold" ---
// These components are visible immediately and should not be lazy-loaded.
// This is the primary fix for the high "Render Delay".
import Counter from "~/components/Counter";
import Avatar from "~/components/Avatar";
import Controlled from "~/components/switch/Controlled";
import DynamicRender from "~/components/DynamicRender";
import ForList from "~/components/list/For";

// --- KEPT: Lazy-load components that are "below the fold" ---
// These are not immediately visible, so lazy loading is appropriate here.
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
  return (
    <main class=" bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* --- MODIFIED: Removed Suspense from eagerly loaded components --- */}
        <div class="card-wrapper">
          <Counter />
          <Avatar
            name="Yang Yang"
            src="https://minio.limingcn.com/solid-start/cloud.webp"
            size="md"
          />
          <Controlled />
        </div>

        {/* This component contains the LCP element and is now loaded eagerly */}
        <div class="card-content-host">
          <DynamicRender />
        </div>

        <div class="card-content-host">
          <ForList />
        </div>

        {/* --- KEPT: Suspense is still used for components below the fold --- */}
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
      </div>
    </main>
  );
}
