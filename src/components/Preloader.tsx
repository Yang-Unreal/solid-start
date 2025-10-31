import { createSignal, onMount, Show } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import YourLogo from "./logo/YourLogo";
import MobileLogo from "./logo/MobileLogo";
export default function Preloader() {
  const [showPreloader, setShowPreloader] = createSignal(true);

  let preloaderRef: HTMLDivElement | undefined;
  let logoContainerRef: HTMLDivElement | undefined;
  let copyrightRef: HTMLDivElement | undefined;
  const lenis = useLenis();

  onMount(() => {
    if (typeof window === "undefined") return;

    if (!preloaderRef || !logoContainerRef) return;
    lenis?.lenis.scrollTo(0);

    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        setShowPreloader(false);
      },
    });

    // Animate reveal from left to right using clip-path
    const whiteLogoRef = logoContainerRef?.querySelector(
      "svg:last-child"
    ) as SVGSVGElement;
    if (whiteLogoRef) {
      gsap.set(whiteLogoRef, {
        clipPath: "inset(0 100% 0 0)",
        visibility: "hidden",
      });
      tl.to(whiteLogoRef, {
        clipPath: "inset(0 0% 0 0)",
        visibility: "visible",
        duration: 1,
        ease: "circ.inOut",
      });
    }

    // Rotate and slide up logos
    const grayLogoRef = logoContainerRef?.querySelector(
      "svg:first-child"
    ) as SVGSVGElement;
    const whiteLogoRef2 = logoContainerRef?.querySelector(
      "svg:last-child"
    ) as SVGSVGElement;
    if (grayLogoRef && whiteLogoRef2) {
      tl.to([grayLogoRef, whiteLogoRef2], {
        rotation: 2,
        transformOrigin: "100% 100%",
        y: "-100%",
        duration: 0.4,
        ease: "circ.in",
      });
    }

    // Animate copyright container
    if (copyrightRef) {
      tl.to(
        copyrightRef,
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: "circ.inOut",
        },
        "<"
      );
    }

    // Animate columns slide up
    const columns = preloaderRef?.querySelectorAll(".column");
    if (columns) {
      gsap.set(columns, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      tl.to(
        columns,
        {
          y: "-100vh",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<0.2"
      );
      tl.to(
        columns,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 92%, 0% 100%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<"
      );
    }

    // Animate second layer columns
    const columns2 = preloaderRef?.querySelectorAll(".column2");
    if (columns2) {
      gsap.set(columns2, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      tl.to(
        columns2,
        {
          y: "-100vh",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        ">-0.4"
      );
      tl.to(
        columns2,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<"
      );
    }
  });

  return (
    <Show when={showPreloader()}>
      <div
        ref={preloaderRef}
        class="loading-container justify-center items-center"
      >
        {/* Background columns */}
        <div class="loading-container absolute inset-0">
          <div class="column flex h-full w-full bg-dark rounded"></div>
          <div class="column flex h-full w-full bg-dark rounded"></div>
          <div class="column flex h-full w-full bg-dark rounded"></div>
          <div class="column flex h-full w-full bg-dark rounded"></div>
          <div ref={logoContainerRef} class="logo">
            <YourLogo class="h-auto w-full text-gray" />
            <YourLogo class="h-auto w-full text-light absolute invisible" />
          </div>
          <div ref={copyrightRef} class="copyright-row">
            <div class="copyright-visual">
              <div
                class="aspect-square h-full border border-gray/25 flex justify-center items-center"
                style="border-radius: 0 var(--border-radius) var(--border-radius) 0;"
              >
                <MobileLogo class="text-gray/25 w-10 h-auto" />
              </div>
              <div
                class="flex flex-col border border-gray/25 border-l-0 text-gray/25"
                style="border-radius: 0 var(--border-radius) var(--border-radius) 0;"
              >
                <div class="flex border-b border-gray/25  justify-center items-center py-[0.3em] px-[0.35em] font-formula-bold uppercase">
                  <h4 class="text-[1rem] leading-[1.1] tracking-[0.02em]">
                    2025 © All rights reserved
                  </h4>
                </div>
                <div class="flex  justify-center items-center py-[0.4em] px-[0.3em] text-center overflow-hidden min-h-[1.72em]">
                  <p class="text-[0.425em]">
                    LIMING is a Export Company specializing in Used Car Parallel
                    Exports from China.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="transition-container">
          <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
          <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
          <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
          <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
        </div>
      </div>
    </Show>
  );
}
