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
      gsap.set(whiteLogoRef, { clipPath: "inset(0 100% 0 0)", opacity: 0 });
      tl.to(whiteLogoRef, {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut",
      });
    }
  });

  return (
    <Show when={showPreloader()}>
      <div
        ref={preloaderRef}
        class="fixed left-0 top-0 z-[70] h-screen w-screen bg-black flex justify-center items-center"
      >
        <div ref={logoContainerRef} class="relative">
          <YourLogo class="h-12 w-auto text-gray-400" />
          <YourLogo class="h-12 w-auto text-white absolute top-0 left-0 opacity-0" />
        </div>
      </div>
    </Show>
  );
}
