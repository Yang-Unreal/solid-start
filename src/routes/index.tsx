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
          CHANGE 1: Removed max-width on large screens and made margins responsive.
          - `lg:max-w-none`: Removes the max-width constraint on large screens.
          - `lg:mx-[5vw]`: Sets horizontal margin to 5% of the viewport width.
        */}
        <div
          class="relative z-20 mt-24 mx-4 md:mt-32 lg:mx-[5vw] max-w-md lg:max-w-none
                 text-left p-4 sm:p-6 bg-black/50 
                 shadow-xl"
        >
          {/* CHANGE 2: Significantly increased the scaling and max size of the fonts. */}
          <h1 class="flex flex-col font-bold tracking-tight text-shadow-md leading-tight">
            <span class="text-[clamp(0.875rem,4vw,2.5rem)]">
              LET THE HIDDEN PEARLS
            </span>
            <div class="w-16 h-[0.5px] bg-red-600 my-1.5"></div>
            <span class="text-[clamp(1.875rem,10vw,7.5rem)]">SHINE</span>
            <span class="text-[clamp(0.875rem,4vw,2.5rem)]">FOR THE WORLD</span>
          </h1>
        </div>
      </div>
    </main>
  );
}
