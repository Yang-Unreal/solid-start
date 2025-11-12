import { createEffect, onMount, createSignal } from "solid-js";
import gsap, { CustomEase } from "gsap/all";

interface TextAnimationProps {
  text: string;
  class?: string;
  originalColor?: string;
  duplicateColor?: string;
  externalTrigger?: "enter" | "leave" | null;
  navSlideTrigger?: "up" | "down" | null;
  isCopyable?: boolean;
  textStyle?: string;
}

export default function TextAnimation(props: TextAnimationProps) {
  let originalRef: HTMLSpanElement | undefined;
  let duplicateRef: HTMLSpanElement | undefined;
  const [displayText, setDisplayText] = createSignal(props.text);
  const duration = 0.2;
  const animateEnter = () => {
    gsap.to(originalRef!, {
      y: "-100%",
      rotation: -12,
      transformOrigin: "0% 100%",
      duration: duration,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "0%",
      rotation: 0,
      transformOrigin: "100% 0%",
      duration: duration,
      ease: "custom",
    });
  };

  const animateLeave = () => {
    gsap.to(originalRef!, {
      y: "0%",
      rotation: 0,
      transformOrigin: "0% 100%",
      duration: duration,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "100%",
      rotation: -12,
      transformOrigin: "100% 0%",
      duration: duration,
      ease: "custom",
    });
  };

  const handleMouseEnter = () => {
    animateEnter();
  };

  const handleMouseLeave = () => {
    animateLeave();
    if (props.isCopyable) {
      setDisplayText(props.text);
    }
  };

  const handleClick = async () => {
    if (props.isCopyable) {
      try {
        await navigator.clipboard.writeText(props.text);
        setDisplayText("ADDED TO CLIPBOARD");
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
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
        y: "-100%",
        rotation: -12,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        delay: 0.1,
      });
    } else if (props.navSlideTrigger === "down") {
      gsap.to(originalRef!, {
        y: "0%",
        rotation: 0,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
      });
    }
  });

  return (
    <div
      class={`relative overflow-hidden ${
        props.isCopyable ? "cursor-pointer" : "cursor-pointer"
      } ${props.class || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span
        ref={originalRef!}
        class={`block ${props.textStyle}`}
        style={`color: ${props.originalColor || "inherit"} ;`}
      >
        {displayText()}
      </span>
      <span
        ref={duplicateRef!}
        class={`absolute top-0 left-0 block ${props.textStyle}`}
        style={`transform: translateY(100%) rotate(-12deg); transform-origin: 100% 0%; color: ${
          props.duplicateColor || "inherit"
        }; `}
      >
        {displayText()}
      </span>
    </div>
  );
}
