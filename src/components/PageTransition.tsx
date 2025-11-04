import { onMount, createEffect, createSignal } from "solid-js";
import gsap from "gsap";
import { useIsRouting, useNavigate } from "@solidjs/router";

export default function PageTransition() {
  let transitionRef: HTMLDivElement | undefined;
  const isRouting = useIsRouting();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<string | null>(
    null
  );

  onMount(() => {
    if (typeof window === "undefined") return;
  });

  // Function to trigger transition and navigation
  const triggerTransition = (href: string) => {
    if (isVisible()) return; // Prevent multiple transitions

    setPendingNavigation(href);
    setIsVisible(true);

    const columns = transitionRef!.querySelectorAll(".transition-column");

    // Start transition: columns slide from bottom (100vh) to cover (0%)
    gsap.set(columns, {
      y: "100vh",
      scaleX: 1.1,
      scaleY: 1.05,
      rotate: -6,
      transformOrigin: "100% 0%",
    });
    gsap.to(columns, {
      y: "0%",
      rotate: 0,
      duration: 0.6,
      ease: "circ.inOut",
      stagger: 0.03,
      onComplete: () => {
        // After columns cover the screen, navigate to the new page
        if (pendingNavigation()) {
          navigate(pendingNavigation()!);
          setPendingNavigation(null);

          // Then slide columns up to reveal the new page
          gsap.to(columns, {
            y: "-100vh",
            rotate: 6,
            transformOrigin: "100% 100%",
            duration: 0.6,
            ease: "circ.inOut",
            stagger: 0.03,
            onComplete: () => {
              setIsVisible(false);
            },
          });
        }
      },
    });
  };

  // Expose the trigger function globally for nav links to use
  if (typeof window !== "undefined") {
    (window as any).triggerPageTransition = triggerTransition;
  }

  return (
    <div
      ref={transitionRef}
      class="fixed inset-0 z-100 pointer-events-none"
      style={{ display: isVisible() ? "block" : "none" }}
    >
      <div class="flex h-full w-full">
        <div class="transition-column flex h-full w-full bg-darkgray rounded"></div>
        <div class="transition-column flex h-full w-full bg-darkgray rounded"></div>
        <div class="transition-column h-full w-full bg-darkgray rounded hidden sm:block"></div>
        <div class="transition-column h-full w-full bg-darkgray rounded hidden sm:block"></div>
      </div>
    </div>
  );
}
