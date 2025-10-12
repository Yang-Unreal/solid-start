import { createEffect, onMount } from "solid-js";
import gsap, { CustomEase } from "gsap/all";

interface TextAnimationProps {
  text: string;
  class?: string;
  originalColor?: string;
  duplicateColor?: string;
  externalTrigger?: "enter" | "leave" | null;
  navSlideTrigger?: "up" | "down" | null;
}

export default function TextAnimation(props: TextAnimationProps) {
  let originalRef: HTMLSpanElement | undefined;
  let duplicateRef: HTMLSpanElement | undefined;

  onMount(() => {
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");
  });

  const animateEnter = () => {
    gsap.to(originalRef!, {
      y: "-100%",
      rotation: -12,
      transformOrigin: "0% 100%",
      duration: 0.2,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "0%",
      rotation: 0,
      transformOrigin: "100% 0%",
      duration: 0.2,
      ease: "custom",
    });
  };

  const animateLeave = () => {
    gsap.to(originalRef!, {
      y: "0%",
      rotation: 0,
      transformOrigin: "0% 100%",
      duration: 0.2,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "100%",
      rotation: -12,
      transformOrigin: "100% 0%",
      duration: 0.2,
      ease: "custom",
    });
  };

  const handleMouseEnter = () => {
    animateEnter();
  };

  const handleMouseLeave = () => {
    animateLeave();
  };

  createEffect(() => {
    if (props.externalTrigger === "enter") {
      animateEnter();
    } else if (props.externalTrigger === "leave") {
      animateLeave();
    }
  });

  createEffect(() => {
    if (props.navSlideTrigger === "up") {
      gsap.to(originalRef!, {
        y: "-120%",
        rotation: -12,
        transformOrigin: "100% 0%",
        duration: 0.4,
        ease: "power3.inOut",
      });
    } else if (props.navSlideTrigger === "down") {
      gsap.to(originalRef!, {
        y: "0%",
        rotation: 0,
        transformOrigin: "100% 0%",
        duration: 0.4,
        ease: "power3.inOut",
      });
    }
  });

  return (
    <div
      class={`relative overflow-hidden cursor-pointer ${props.class || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={originalRef!}
        class="block"
        style={`color: ${props.originalColor || "inherit"}`}
      >
        {props.text}
      </span>
      <span
        ref={duplicateRef!}
        class="absolute top-0 left-0 block"
        style={`transform: translateY(100%) rotate(-12deg); transform-origin: 100% 0%; color: ${
          props.duplicateColor || "inherit"
        }`}
      >
        {props.text}
      </span>
    </div>
  );
}
