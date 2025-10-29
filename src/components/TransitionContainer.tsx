import { createSignal, createEffect } from "solid-js";
import gsap from "gsap";

interface TransitionContainerProps {
  trigger: () => boolean;
}

export default function TransitionContainer(props: TransitionContainerProps) {
  const [isAnimating, setIsAnimating] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const animateTransition = () => {
    if (!containerRef || isAnimating()) return;

    setIsAnimating(true);
    const columns2 = containerRef.querySelectorAll(".column2");

    if (columns2) {
      gsap.set(columns2, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setIsAnimating(false);
        },
      });

      tl.to(columns2, {
        y: "-100vh",
        duration: 0.6,
        ease: "circ.inOut",
        stagger: 0.03,
      });
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
  };

  createEffect(() => {
    if (props.trigger()) {
      animateTransition();
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
