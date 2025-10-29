import { createSignal, onMount, Show } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import YourLogo from "./logo/YourLogo";

export default function Preloader() {
  const [showPreloader, setShowPreloader] = createSignal(true);

  let preloaderRef: HTMLDivElement | undefined;
  let logoContainerRef: HTMLDivElement | undefined;
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
        y: "-170%",
        duration: 0.6,
        ease: "circ.inOut",
      });
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
          stagger: 0.02,
        },
        "<0.2"
      );
      tl.to(
        columns,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 92%, 0% 100%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.02,
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
          stagger: 0.02,
        },
        ">-0.4"
      );
      tl.to(
        columns2,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.02,
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
          <div
            class="column absolute h-full bg-dark z-10"
            style="left: 0%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-dark z-10"
            style="left: 25%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-dark z-10"
            style="left: 50%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-dark z-10"
            style="left: 75%; width: 26%;"
          ></div>
          <div ref={logoContainerRef} class="logo">
            <YourLogo class="h-auto w-full text-gray-400" />
            <YourLogo class="h-auto w-full text-white absolute invisible" />
          </div>
        </div>
        <div class="transition-container absolute inset-0">
          <div
            class="column2 absolute h-full bg-darkgray"
            style="left: 0%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-darkgray"
            style="left: 25%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-darkgray"
            style="left: 50%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-darkgray"
            style="left: 75%; width: 26%;"
          ></div>
        </div>
      </div>
    </Show>
  );
}
