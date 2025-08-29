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
      <Title>Official LIMING Website | LIMING</Title>
      <Meta
        name="description"
        content="LIMING offers bespoke sourcing and product procurement from China. We simplify the process, eliminate risk, and offer the Apex Collection of curated products."
      />
      <div
        class="relative min-h-screen overflow-hidden bg-black bg-cover  bg-center"
        style={{
          "background-image":
            "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), url('/heroBackground.webp')",
        }}
      >
        <div
          class="w-full min-h-screen flex items-center justify-center transition-opacity  "
          // style={{
          //   opacity: heroOpacity(),
          // }}
        >
          <h1 class="absolute w-full text-light-gray text-5xl md:text-[140px] font-formula-bold top-2/5 text-center leading-18 md:leading-35">
            TRUSTED PARTNER
            <br />
            YOUR BRIDGE TO CHINA
          </h1>
          <div class="absolute flex flex-col md:flex-row h-auto w-full justify-between items-center bottom-8 md:bottom-15 container-padding gap-2 md:gap-10 ">
            <div class="w-full md:w-1/5 flex flex-col items-center  text-center text-white">
              <h1 class="w-52 text-md md:text-3xl font-formula-bold">
                BESPOKE SOURCING
              </h1>
              <HoverableButton
                as="button"
                class="w-32 border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-formula-bold mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                START YOUR SOURCING
              </HoverableButton>
            </div>
            {/* <div class="w-full md:w-1/3 flex flex-col items-center text-white text-center ">
              <HoverableButton
                as="button"
                class="w-39 border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-inconsolata mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                BROW OUR STORE
              </HoverableButton>
            </div> */}
            <div class="w-full md:w-1/5 flex flex-col items-center text-white text-center ">
              <h1 class="w-52 text-md md:text-3xl font-formula-bold">
                RISK ELIMINATION
              </h1>
              <HoverableButton
                as="button"
                class="w-32 border rounded-full px-3 md:px-5 py-1 md:py-2 text-xs font-formula-bold mt-2 transition-colors duration-500 hover:border-transparent hover:text-black"
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
