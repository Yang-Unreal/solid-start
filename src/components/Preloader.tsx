import { onMount } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import { useTransition } from "~/context/TransitionContext";
import YourLogo from "./logo/YourLogo";
import MobileLogo from "./logo/MobileLogo";

export default function Preloader() {
  const { triggerPreloader } = useTransition();

  let preloaderRef: HTMLDivElement | undefined;
  let logoContainerRef: HTMLDivElement | undefined;
  let copyrightRef: HTMLDivElement | undefined;
  const lenis = useLenis();

  onMount(() => {
    if (typeof window === "undefined" || !preloaderRef || !logoContainerRef)
      return;

    lenis?.lenis.scrollTo(0);

    const masterTl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        triggerPreloader(); // Signal that the entire preloader sequence is complete
      },
    });

    // --- Logo Animation ---
    const whiteLogoRef = logoContainerRef.querySelector(
      "svg:last-child"
    ) as SVGSVGElement;
    if (whiteLogoRef) {
      gsap.set(whiteLogoRef, {
        clipPath: "inset(0 100% 0 0)",
        visibility: "hidden",
      });
      masterTl.to(whiteLogoRef, {
        clipPath: "inset(0 0% 0 0)",
        visibility: "visible",
        duration: 1,
        ease: "circ.inOut",
      });
    }

    const grayLogoRef = logoContainerRef.querySelector(
      "svg:first-child"
    ) as SVGSVGElement;
    if (grayLogoRef && whiteLogoRef) {
      masterTl.to([grayLogoRef, whiteLogoRef], {
        rotation: 2,
        transformOrigin: "100% 100%",
        y: "-100%",
        duration: 0.4,
        ease: "circ.in",
      });
    }

    if (copyrightRef) {
      masterTl.to(
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

    // --- Column Animations ---
    const loadingColumns = preloaderRef.querySelectorAll(".loading-column");
    const transitionColumns =
      preloaderRef.querySelectorAll(".transition-column");

    // Animate loading columns (dark)
    if (loadingColumns.length > 0) {
      gsap.set(loadingColumns, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      masterTl.to(
        loadingColumns,
        {
          y: "-100vh",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<0.2"
      );
      masterTl.to(
        loadingColumns,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 92%, 0% 100%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<"
      );
    }

    // Animate transition columns (darkgray)
    if (transitionColumns.length > 0) {
      gsap.set(transitionColumns, {
        y: "0%",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });
      masterTl.to(
        transitionColumns,
        {
          y: "-100%",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "-=0.4" // Overlap with the end of the previous animation
      );
      masterTl.to(
        transitionColumns,
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
    <div
      ref={preloaderRef}
      class="loading-container justify-center items-center pointer-events-auto"
    >
      {/* Dark Loading Columns (from original Preloader) */}
      <div class="absolute inset-0 z-20">
        <div
          class="loading-column absolute h-full bg-dark rounded"
          style="left: 0%; width: 26%;"
        ></div>
        <div
          class="loading-column absolute h-full bg-dark rounded"
          style="left: 25%; width: 26%;"
        ></div>
        <div
          class="loading-column absolute h-full bg-dark rounded"
          style="left: 50%; width: 26%;"
        ></div>
        <div
          class="loading-column absolute h-full bg-dark rounded"
          style="left: 75%; width: 26%;"
        ></div>
      </div>

      {/* Darkgray Transition Columns (from original TransitionContainer) */}
      <div class="absolute inset-0 z-10">
        <div
          class="transition-column absolute h-full bg-darkgray"
          style="left: 0%; width: 26%;"
        ></div>
        <div
          class="transition-column absolute h-full bg-darkgray"
          style="left: 25%; width: 26%;"
        ></div>
        <div
          class="transition-column absolute h-full bg-darkgray"
          style="left: 50%; width: 26%;"
        ></div>
        <div
          class="transition-column absolute h-full bg-darkgray"
          style="left: 75%; width: 26%;"
        ></div>
      </div>

      {/* UI Elements */}
      <div class="absolute z-21">
        <div ref={logoContainerRef} class="logo">
          <YourLogo class="h-auto w-full text-gray" />
          <YourLogo class="h-auto w-full text-light absolute invisible" />
        </div>
        <div ref={copyrightRef} class="copyright-row absolute z-50">
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
              <div class="flex border-b border-gray/25 justify-center items-center py-[0.3em] px-[0.35em] font-formula-bold uppercase">
                <h4 class="text-[1rem] leading-[1.1] tracking-[0.02em]">
                  2025 © All rights reserved
                </h4>
              </div>
              <div class="flex justify-center items-center py-[0.4em] px-[0.3em] text-center overflow-hidden min-h-[1.72em]">
                <p class="text-[0.425em]">
                  LIMING is a Export Company specializing in Used Car Parallel
                  Exports from China.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
