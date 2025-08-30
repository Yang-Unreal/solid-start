// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";
import { createSignal, onMount, onCleanup } from "solid-js";
import Footer from "~/components/Footer";
import HoverableButton from "~/components/HoverableButton";

export default function Home() {
  const [heroOpacity, setHeroOpacity] = createSignal(0);
  let heroRef: HTMLDivElement | undefined;

  onMount(() => {
    setHeroOpacity(1);
    if (heroRef) {
      const setHeroHeight = () => {
        if (heroRef) {
          heroRef.style.height = `${window.innerHeight}px`;
        }
      };
      setHeroHeight();
      window.addEventListener("resize", setHeroHeight);

      onCleanup(() => {
        window.removeEventListener("resize", setHeroHeight);
      });
    }
  });

  return (
    <main>
      <Title>Official LIMING Website | LIMING</Title>
      <Meta
        name="description"
        content="LIMING offers bespoke sourcing and product procurement from China. We simplify the process, eliminate risk, and offer the Apex Collection of curated products."
      />
      <div
        ref={heroRef}
        class="relative overflow-hidden bg-black bg-cover  bg-center"
        style={{
          "background-image":
            "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), url('/heroBackground.webp')",
        }}
      >
        <div
          class="w-full h-full flex items-center justify-center transition-opacity  "
          // style={{
          //   opacity: heroOpacity(),
          // }}
        >
          <h1 class="absolute w-full text-light-gray text-7xl md:text-[155px] font-formula-bold bottom-50 md:top-3/7 text-center leading-18 md:leading-37">
            YOUR TRUSTED
            <br />
            BRIDGE TO CHINA
          </h1>
          <div class="absolute flex flex-row h-auto w-full justify-between items-center bottom-20 md:bottom-15 container-padding gap-20 md:gap-10 ">
            <div class="w-full md:w-1/5 flex flex-col items-center  text-center text-white  gap-2">
              <HoverableButton
                as="button"
                class="md:w-35 border rounded-full px-2 py-1 md:py-1.5 text-[8px] md:text-xs font-inconsolata  transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(255, 100%, 100%)"
              >
                Start Your Sourcing
              </HoverableButton>
              <h1 class="md:w-55 text-xl md:text-4xl font-formula-bold">
                Bespoke Sourcing
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
                class="md:w-35 border rounded-full px-2 py-1 md:py-1.5 text-[8px] md:text-xs font-inconsolata  transition-colors duration-500 hover:border-transparent hover:text-black"
                enableHoverCircle
                applyOverflowHidden
                hoverCircleColor="hsl(255, 100%, 100%)"
              >
                How We Protect You
              </HoverableButton>
              <h1 class="md:w-55 text-xl md:text-4xl font-formula-bold">
                Risk Elimination
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
