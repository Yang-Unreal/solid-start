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
          <h1 class="absolute w-full text-light-gray text-5xl md:text-[155px] font-formula-bold top-3/7 text-center leading-18 md:leading-37">
            YOUR TRUSTED
            <br />
            BRIDGE TO CHINA
          </h1>
          <div class="absolute flex flex-col md:flex-row h-auto w-full justify-between items-center bottom-50 md:bottom-15 container-padding gap-2 md:gap-10 ">
            <div class="w-full md:w-1/5 flex flex-col items-center  text-center text-white  gap-2">
              <HoverableButton
                as="button"
                class="w-35 border rounded-full px-2 py-1.5 text-xs font-inconsolata  transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(255, 100%, 100%)"
              >
                START YOUR SOURCING
              </HoverableButton>
              <h1 class="w-55 text-3xl md:text-4xl font-formula-bold">
                BESPOKE SOURCING
              </h1>
            </div>
            {/* <div class="w-full md:w-1/3 flex flex-col items-center text-white text-center gap-2">
              <HoverableButton
                as="button"
                class="w-35 border rounded-full px-2 py-1.5 text-xs font-inconsolata  transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(75, 99%, 52%)"
              >
                BROWSE OUR STORE
              </HoverableButton>
              <h1 class="w-55 text-md md:text-4xl font-formula-bold">
                APEX COLLECTION
              </h1>
            </div> */}
            <div class="w-full md:w-1/5 flex flex-col items-center text-white text-center gap-2">
              <HoverableButton
                as="button"
                class="w-35 border rounded-full px-2 py-1.5 text-xs font-inconsolata  transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(255, 100%, 100%)"
              >
                HOW WE PROTECT YOU
              </HoverableButton>
              <h1 class="w-55 text-3xl md:text-4xl font-formula-bold">
                RISK ELIMINATION
              </h1>
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
