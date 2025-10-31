import { createSignal, createEffect } from "solid-js";
import gsap from "gsap";
import { useTransition } from "~/context/TransitionContext";

export default function TransitionContainer() {
  const { trigger, setTrigger, isAnimating, setIsAnimating } = useTransition();
  let containerRef: HTMLDivElement | undefined;

  const animateTransition = () => {
    if (!containerRef || isAnimating()) return;

    setIsAnimating(true);
    const columns2 = containerRef.querySelectorAll(".column2");

    if (columns2) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
          setTrigger(false);
        },
      });

      tl.fromTo(
        columns2,
        {
          y: 0,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        },
        {
          y: "-100vh",
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%)",
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        }
      );
    }
  };

  createEffect(() => {
    if (trigger()) {
      animateTransition();
      setTrigger(false);
    }
  });

  return (
    <div ref={containerRef} class="transition-container absolute inset-0">
      <div
        class="column2 absolute h-full bg-darkgray rounded"
        style="left: 0%; width: 26%;"
      ></div>
      <div
        class="column2 absolute h-full bg-darkgray rounded"
        style="left: 25%; width: 26%;"
      ></div>
      <div
        class="column2 absolute h-full bg-darkgray rounded"
        style="left: 50%; width: 26%;"
      ></div>
      <div
        class="column2 absolute h-full bg-darkgray rounded"
        style="left: 75%; width: 26%;"
      ></div>
    </div>
  );
}
