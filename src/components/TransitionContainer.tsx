// src/components/TransitionContainer.tsx
import { createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import gsap from "gsap";
import { useTransition } from "~/context/TransitionContext";

export default function TransitionContainer() {
  const {
    isAnimating,
    setIsAnimating,
    pendingPath,
    setPendingPath,
    transitionType,
  } = useTransition();
  const navigate = useNavigate();
  let containerRef: HTMLDivElement | undefined;

  const animateNavigation = (path: string) => {
    if (!containerRef) return;
    const columns = containerRef.querySelectorAll(".column");
    if (columns) {
      gsap.set(columns, { y: "100%" });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          setPendingPath(null);
        },
      });

      tl.fromTo(
        columns,
        {
          clipPath: "polygon(0% 8%, 100% 0%, 100% 100%, 0% 100%)",
        },
        {
          y: "0%",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        }
      )
        .call(() => {
          navigate(path);
        })
        .to(columns, {
          y: "-100%",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        });
    }
  };

  createEffect(() => {
    if (isAnimating()) {
      // This component now only handles navigation transitions.
      // The "preloader" transition is fully handled by Preloader.tsx.
      const path = pendingPath();
      if (path && transitionType() !== "preloader") {
        animateNavigation(path);
      }
    }
  });

  return (
    <div
      ref={containerRef}
      class="transition-container pointer-events-none fixed inset-0 z-50"
    >
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 0%; width: 26%;"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 25%; width: 26%;"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 50%; width: 26%;"
      ></div>
      <div
        class="column absolute h-full bg-darkgray"
        style="left: 75%; width: 26%;"
      ></div>
    </div>
  );
}
