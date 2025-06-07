// src/routes/index.tsx
import { Suspense, lazy } from "solid-js";

// Lazy-load all components to improve initial page performance and Total Blocking Time (TBT).
// Solid's lazy() expects a default export from the imported file.
const Counter = lazy(() => import("~/components/Counter"));
const Avatar = lazy(() => import("~/components/Avatar"));
const Controlled = lazy(() => import("~/components/switch/Controlled"));
const ForList = lazy(() => import("~/components/list/For"));
const IndexList = lazy(() => import("~/components/list/Index"));
const PortalExample = lazy(() => import("~/components/Portal"));
const AnimeTimer = lazy(() => import("~/components/AnimeTimer"));
const DynamicRender = lazy(() => import("~/components/DynamicRender"));
const RefsExample = lazy(() => import("~/components/RefsExample"));
const ToDo = lazy(() => import("~/components/Todo"));
const CounterPageContent = lazy(
  () => import("~/components/CounterPageContent")
);

// A reusable, styled fallback UI for suspended components
const CardFallback = () => (
  <div class="card-wrapper min-h-[400px]">
    <div class="animate-pulse text-lg text-neutral-400 dark:text-neutral-500">
      Loading...
    </div>
  </div>
);

export default function Home() {
  return (
    <main class=" bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <div class="card-wrapper">
          <Suspense
            fallback={
              <div class="animate-pulse h-10 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
            }
          >
            <Counter />
          </Suspense>
          <Suspense
            fallback={
              <div class="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            }
          >
            <Avatar
              name="Yang Yang"
              src="https://minio.limingcn.com/solid-start/cloud.webp"
              size="md"
            />
          </Suspense>
          <Suspense
            fallback={
              <div class="animate-pulse h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            }
          >
            <Controlled />
          </Suspense>
        </div>
        <Suspense fallback={<CardFallback />}>
          <div class="card-content-host">
            <DynamicRender />
          </div>
        </Suspense>
        <Suspense fallback={<CardFallback />}>
          <div class="card-content-host">
            <ForList />
          </div>
        </Suspense>
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
