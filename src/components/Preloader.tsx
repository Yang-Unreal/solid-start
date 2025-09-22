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

    // Check if first visit
    // const visited = localStorage.getItem("visited");
    // if (visited) {
    //   setShowPreloader(false);
    //   lenis?.start();
    //   return;
    // }

    if (!preloaderRef || !logoContainerRef) return;
    lenis?.scrollTo(0);

    const tl = gsap.timeline({
      onComplete: () => {
        // localStorage.setItem("visited", "true");
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

    // Animate columns slide up
    const columns = preloaderRef?.querySelectorAll(".column");
    if (columns) {
      tl.to(
        columns,
        {
          y: "-100vh",
          duration: 0.8,
          ease: "power2.inOut",
          stagger: 0.02,
        },
        "1"
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
        <div class="absolute inset-0 flex">
          <div class="column w-1/4 bg-black"></div>
          <div class="column w-1/4 bg-black"></div>
          <div class="column w-1/4 bg-black"></div>
          <div class="column w-1/4 bg-black"></div>
        </div>
        <div ref={logoContainerRef} class="relative z-10">
          <YourLogo class="h-7 w-auto text-gray-400" />
          <YourLogo class="h-7 w-auto text-white absolute top-0 left-0 invisible" />
        </div>
      </div>
    </Show>
  );
}
