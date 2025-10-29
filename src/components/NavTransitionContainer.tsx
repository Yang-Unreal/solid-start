import { createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import gsap from "gsap";
import { useTransition } from "~/context/TransitionContext";

export default function NavTransitionContainer() {
  const { pendingPath, setPendingPath, isAnimating, setIsAnimating } =
    useTransition();
  const navigate = useNavigate();
  let containerRef: HTMLDivElement | undefined;

  const animateTransition = (path: string) => {
    if (!containerRef || !isAnimating()) return;

    const columns = containerRef.querySelectorAll(".column");

    if (columns) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          setPendingPath(null);
        },
      });

      tl.to(columns, {
        y: "0%",
        duration: 0.6,
        ease: "circ.inOut",
        stagger: 0.03,
      })
        .call(() => {
          navigate(path);
        })
        .to(columns, {
          y: "-100%",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: -0.03,
          delay: 0.2,
        });
    }
  };

  createEffect(() => {
    const path = pendingPath();
    if (path) {
      animateTransition(path);
    }
  });

  return (
    <div
      ref={containerRef}
      class="transition-container pointer-events-none fixed inset-0 z-50"
    >
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 0%; width: 25%; transform: translateY(100%)"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 25%; width: 25%; transform: translateY(100%)"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 50%; width: 25%; transform: translateY(100%)"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 75%; width: 25%; transform: translateY(100%)"
      ></div>
    </div>
  );
}
