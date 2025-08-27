// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";
import { createSignal, onMount } from "solid-js";
import Footer from "~/components/Footer";
import HoverableButton from "~/components/HoverableButton";

export default function Home() {
  const [heroOpacity, setHeroOpacity] = createSignal(0);

  onMount(() => {
    setHeroOpacity(1);
  });

  return (
    <main>
      <Title>Liming - China Sourcing Simplified</Title>
      <Meta
        name="description"
        content="Bespoke sourcing and product procurement from China. We simplify the process, eliminate risk, and offer the Apex Collection of curated products."
      />
      <div
        class="relative min-h-screen overflow-hidden bg-black bg-cover  bg-center"
        style={{
          "background-image":
            "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), url('/heroBackground.webp')",
        }}
      >
        <div
          class="w-full min-h-screen flex items-center justify-center transition-opacity duration-200 "
          style={{
            opacity: heroOpacity(),
          }}
        >
          <h1 class="absolute text-light-gray text-5xl md:text-[120px] font-permanent-marker top-2/6 text-center leading-18 md:leading-35">
            CHINA SOURCING <br />
            SIMPLIFIED
          </h1>
          <div class="absolute flex flex-col md:flex-row h-auto w-full justify-center items-center bottom-8 md:bottom-12 container-padding gap-2 md:gap-10 ">
            <div class="w-full md:w-1/3 flex flex-col items-center justify-center text-center text-white">
              <h1 class="text-md md:text-xl font-permanent-marker">
                BESPOKE SOURCING
              </h1>
              <HoverableButton
                as="button"
                class="border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-inconsolata mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                START YOUR SOURCING
              </HoverableButton>
            </div>
            <div class="w-full md:w-1/3 flex flex-col items-center text-white text-center ">
              <h1 class="text-md md:text-xl font-permanent-marker">
                APEX COLLECTION
              </h1>
              <HoverableButton
                as="button"
                class=" border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-inconsolata mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                BROWSE OUR STORE
              </HoverableButton>
            </div>
            <div class="w-full md:w-1/3 flex flex-col items-center text-white text-center ">
              <h1 class="text-md md:text-xl font-permanent-marker">
                RISK ELIMINATION
              </h1>
              <HoverableButton
                as="button"
                class="border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-inconsolata mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                HOW WE PROTECT YOU
              </HoverableButton>
            </div>
          </div>
        </div>
      </div>
      <div class="min-h-screen bg-cover bg-center "></div>
      <div
        class="min-h-screen bg-cover bg-center"
        style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/heroBackground.webp');"
      ></div>
      <div class="min-h-screen "></div>
      <Footer />
    </main>
  );
}
