// src/routes/index.tsx
import { Suspense, lazy, createSignal, onMount, Show } from "solid-js";

// ... (your lazy imports remain the same) ...

const DynamicRender = lazy(() => import("~/components/DynamicRender"));
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

const CardFallback = () => (
  <div class="card-wrapper min-h-[400px]">
    <div class="animate-pulse text-lg text-neutral-400">Loading...</div>
  </div>
);

export default function Home() {
  const [canShowOthers, setCanShowOthers] = createSignal(false);

  onMount(() => {
    setCanShowOthers(true);
  });

  return (
    <main>
      {/* --- HERO SECTION WITH VIDEO BACKGROUND --- */}
      {/*
        CHANGE: Replaced 'min-h-screen' with responsive height classes.
        - h-[60vh]: Sets the height to 60% of the viewport height on mobile.
        - md:min-h-screen: Overrides this for medium screens and up to restore the fullscreen effect.
      */}
      <div class="relative flex h-[60vh] md:min-h-screen items-end justify-center overflow-hidden text-white bg-black">
        {/* The Video Background */}
        <video
          autoplay
          loop
          muted
          playsinline
          // CRITICAL: Create and add a poster image for fast perceived load times.
          poster="https://minio.limingcn.com/solid-start/gt2_pro_poster.webp"
          class="absolute top-0 left-0 z-0 h-full w-full object-cover"
        >
          <source
            src="https://minio.limingcn.com/solid-start/gt2_pro.webm"
            type="video/webm"
          />
          <source
            src="https://minio.limingcn.com/solid-start/gt2_pro.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* The Text Content */}
        <div class="relative z-20 text-center p-4 pb-20 sm:pb-24">
          <h1 class="hero-heading text-4xl font-bold tracking-tight md:text-6xl">
            Hello
          </h1>
          <p class="mt-4 text-lg md:text-xl text-white/80">
            This is a subtitle for the hero section.
          </p>
        </div>
      </div>

      {/* --- Rest of the page content remains the same --- */}
      <div class="bg-neutral-100 p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
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

        {/* ... (Rest of your Show/Suspense components remain the same) ... */}
        <Show when={canShowOthers()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <DynamicRender />
            </div>
          </Suspense>
        </Show>

        <Show when={canShowOthers()}>
          <Suspense fallback={<CardFallback />}>
            <div class="card-content-host">
              <ForList />
            </div>
          </Suspense>
        </Show>

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
