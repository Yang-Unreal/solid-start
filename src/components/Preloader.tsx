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
    lenis?.scrollTo(0);

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
        rotation: 3,
        transformOrigin: "100% 50%",
        y: "-170%",
        duration: 0.5,
        ease: "power4.in",
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
          clipPath: "polygon(0% 0%, 100% 0%, 100% 95%, 0% 100%)",
          duration: 0.6,
          ease: "power4.in",
          stagger: 0.01,
        },
        "1"
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
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 95%)",
          duration: 0.6,
          ease: "power4.in",
          stagger: 0.01,
        },
        "1.3"
      );
    }
  });

  return (
    <Show when={showPreloader()}>
      <div
        ref={preloaderRef}
        class="fixed left-0 top-0 z-[70] h-screen w-screen flex justify-center items-center overflow-hidden"
      >
        {/* Background columns */}
        <div class="absolute inset-0">
          <div
            class="column absolute h-full bg-black z-10"
            style="left: 0%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-black z-10"
            style="left: 25%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-black z-10"
            style="left: 50%; width: 26%;"
          ></div>
          <div
            class="column absolute h-full bg-black z-10"
            style="left: 75%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-yellow"
            style="left: 0%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-yellow"
            style="left: 25%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-yellow"
            style="left: 50%; width: 26%;"
          ></div>
          <div
            class="column2 absolute h-full bg-yellow"
            style="left: 75%; width: 26%;"
          ></div>
        </div>
        <div ref={logoContainerRef} class="relative z-10 py-4 overflow-hidden">
          <YourLogo class="h-7 w-auto text-gray-400" />
          <YourLogo class="h-7 w-auto text-white absolute top-4 left-0 invisible" />
        </div>
      </div>
    </Show>
  );
}
