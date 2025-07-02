// src/components/HoverCircleButton.tsx
import type { JSX } from "solid-js";
import { animate } from "animejs";

interface HoverCircleButtonProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> {
  children: JSX.Element;
  backgroundColor?: string;
}

export default function HoverCircleButton(props: HoverCircleButtonProps) {
  let circleRef: HTMLDivElement | undefined;
  let currentAnimation: ReturnType<typeof animate> | undefined;

  const manageMouseEnter = () => {
    if (circleRef) {
      // Stop any currently running animation.
      if (currentAnimation) {
        currentAnimation.pause();
      }

      // **The Fix:** Use a keyframe array to explicitly define the
      // starting point (101%) and ending point (0%).
      // This forces the animation to always start from the bottom.
      currentAnimation = animate(circleRef, {
        translateY: ["101%", "0%"],
        duration: 700,
        easing: "easeOutQuad",
      });
    }
  };

  const manageMouseLeave = () => {
    if (circleRef) {
      // Stop any currently running animation.
      if (currentAnimation) {
        currentAnimation.pause();
      }

      // Animate from the current position (which will be 0% after
      // a complete hover) to the top (-101%).
      currentAnimation = animate(circleRef, {
        translateY: "-101%",
        duration: 700,
        easing: "easeInQuad",
      });
    }
  };

  const buttonClasses =
    "rounded-full border border-gray-400 cursor-pointer relative flex items-center justify-center px-16 py-4 overflow-hidden group";
  const contentWrapperClasses =
    "relative z-10 transition-colors duration-300 group-hover:text-white";

  return (
    <button
      onMouseEnter={manageMouseEnter}
      onMouseLeave={manageMouseLeave}
      class={buttonClasses}
      {...props}
    >
      <div class={contentWrapperClasses}>{props.children}</div>
      <div
        ref={(el) => (circleRef = el)}
        class="absolute w-full aspect-square rounded-full"
        style={{
          "background-color": props.backgroundColor || "#455CE9",
          // The initial position must be at the bottom so the first animation
          // doesn't jump.
          transform: "translateY(101%)",
          "z-index": "0",
        }}
      ></div>
    </button>
  );
}
