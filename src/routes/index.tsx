// src/routes/index.tsx

import Footer from "~/components/Footer";
import HoverCircleButton from "~/components/HoverCircleButton";
import MagneticLink from "~/components/MagneticLink";

export default function Home() {
  return (
    <main>
      <div class="relative flex h-[60vh] md:min-h-screen items-center justify-start overflow-hidden bg-black">
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
                 text-left p-4 sm:p-6 mix-blend-difference"
        >
          <h1 class="flex flex-col font-bold tracking-tight text-shadow-md leading-tight text-white">
            <span class="text-xl md:text-3xl lg:text-4xl">
              LET THE HIDDEN PEARLS
            </span>
            <div class="w-16 h-[0.5px] bg-red-600 my-1.5"></div>
            <span class="text-4xl md:text-6xl lg:text-7xl">SHINE</span>
            <span class="text-xl md:text-3xl lg:text-4xl">FOR THE WORLD</span>
          </h1>
        </div>
      </div>
      <div id="001" class="flex items-center justify-center h-screen bg-white">
        <MagneticLink
          class="w-50 h-24 bg-black rounded-full shadow-lg flex flex-col justify-center items-center"
          aria-label="Magnetic Button"
          enableHoverCircle={true}
          hoverCircleColor="#3B82F6"
          applyOverflowHidden={true}
        >
          {(innerRef) => (
            <div ref={innerRef} class="flex justify-center items-center">
              <p>Hover Button</p>
            </div>
          )}
        </MagneticLink>
      </div>
      <Footer />
    </main>
  );
}
