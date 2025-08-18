// src/routes/index.tsx

import Footer from "~/components/Footer";
import HoverableButton from "~/components/HoverableButton";

export default function Home() {
  return (
    <main>
      <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-[url('/heroBackground.webp')]">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <h1 class="absolute text-light-gray text-7xl md:text-[120px] font-permanent-marker top-2/5 text-center leading-18 md:leading-35">
          CHINA SOURCING <br />
          SIMPLIFIED
        </h1>
        <div class="absolute flex h-auto w-full bottom-12 container-padding gap-10 ">
          <div class="w-1/3 flex flex-col items-center justify-center text-center text-white">
            <h1 class="text-lg md:text-2xl font-permanent-marker">
              BESPOKE SOURCING
            </h1>
            <HoverableButton
              as="button"
              class="border rounded-full px-5 py-2 text-xs font-inconsolata mt-2 transition-colors duration-300 hover:border-transparent hover:text-black"
              enableHoverCircle
              applyOverflowHidden
              hoverCircleColor="hsl(75, 99%, 52%)"
            >
              START YOUR SOURCING
            </HoverableButton>
          </div>
          <div class="w-1/3 flex flex-col items-center text-white text-center ">
            <h1 class="text-lg md:text-2xl font-permanent-marker">
              THE APEX COLLECTION
            </h1>
            <HoverableButton
              as="button"
              class=" border rounded-full px-5 py-2 text-xs font-inconsolata mt-2 transition-colors duration-300 hover:border-transparent hover:text-black"
              enableHoverCircle
              applyOverflowHidden
              hoverCircleColor="hsl(75, 99%, 52%)"
            >
              BROWSE OUR STORE
            </HoverableButton>
          </div>
          <div class="w-1/3 flex flex-col items-center text-white text-center ">
            <h1 class="text-lg md:text-2xl font-permanent-marker">
              ELIMINATE RISK
            </h1>
            <HoverableButton
              as="button"
              class="border rounded-full px-5 py-2 text-xs font-inconsolata mt-2 transition-colors duration-300 hover:border-transparent hover:text-black"
              enableHoverCircle
              applyOverflowHidden
              hoverCircleColor="hsl(75, 99%, 52%)"
            >
              HOW WE PROTECT YOU
            </HoverableButton>
          </div>
        </div>
      </div>

      <div class="min-h-screen bg-cover bg-center "></div>
      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen "></div>
      <Footer />
    </main>
  );
}
