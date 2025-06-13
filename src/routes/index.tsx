// src/routes/index.tsx
import { Suspense, lazy, createSignal, onMount, Show } from "solid-js";

export default function Home() {
  return (
    <main>
      <div class="relative flex h-[60vh] md:min-h-screen items-start justify-start overflow-hidden text-white bg-black">
        <video
          autoplay
          loop
          muted
          playsinline
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
        </video>

        {/* The Text Content Card */}
        {/* 
          CHANGE: Added responsive max-width classes.
          - `max-w-md`: Default for mobile, keeps the card compact.
          - `lg:max-w-xl`: Increases size for large desktops.
          - `2xl:max-w-3xl`: Increases size again for very high-res screens.
        */}
        <div
          class="relative z-20 mt-24 mx-4 md:mt-32 md:mx-16 lg:mx-20 
                 max-w-md lg:max-w-xl 2xl:max-w-3xl
                 text-left p-4 sm:p-6 bg-black/50 
                 shadow-xl"
        >
          <h1 class="flex flex-col font-bold tracking-tight text-shadow-md leading-tight">
            <span class="text-[clamp(0.875rem,2.5vw,1.25rem)]">
              LET THE HIDDEN PEARLS
            </span>
            <div class="w-16 h-[1px] bg-red-600 my-1.5"></div>
            <span class="text-[clamp(1.875rem,6vw,3rem)]">SHINE</span>
            <span class="text-[clamp(0.875rem,2.5vw,1.25rem)]">
              FOR THE WORLD
            </span>
          </h1>
        </div>
      </div>
    </main>
  );
}
