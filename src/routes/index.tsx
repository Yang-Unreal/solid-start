// src/routes/index.tsx
import { Suspense, lazy, createSignal, onMount, Show } from "solid-js";
import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main>
      <div class="relative flex h-[60vh] md:min-h-screen items-center justify-start overflow-hidden text-white bg-black">
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

        <div
          class="relative z-20 ml-4 lg:ml-8 max-w-md lg:max-w-none
                 text-left p-4 sm:p-6 bg-transparent"
        >
          {/* CHANGE 2: Significantly increased the scaling and max size of the fonts. */}
          <h1 class="flex flex-col font-bold tracking-tight text-shadow-md leading-tight">
            <span class="text-[clamp(0.875rem,4vw,2.5rem)]">
              LET THE HIDDEN PEARLS
            </span>
            <div class="w-16 h-[0.5px] bg-red-600 my-1.5"></div>
            <span class="text-[clamp(1.875rem,6vw,4.5rem)]">SHINE</span>
            <span class="text-[clamp(0.875rem,4vw,2.5rem)]">FOR THE WORLD</span>
          </h1>
        </div>
      </div>
      <Footer />
    </main>
  );
}
