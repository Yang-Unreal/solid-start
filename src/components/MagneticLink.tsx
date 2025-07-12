// src/components/MagneticLink.tsx

import {
  createSignal,
  onMount,
  onCleanup,
  type JSX,
  createEffect,
  type Accessor,
  type Setter,
} from "solid-js";
import { createAnimatable, eases, animate } from "animejs";

interface MagneticLinkProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: (el: HTMLButtonElement) => void;
  onClick?: (e: MouseEvent) => void;
  children?:
    | JSX.Element
    | ((innerRef: (el: HTMLElement) => void) => JSX.Element);
  enableHoverCircle?: boolean;
  hoverCircleColor?: string;
  applyOverflowHidden?: boolean;
  triggerLeaveAnimation?: Accessor<boolean>;
  setTriggerLeaveAnimation?: Setter<boolean>;
}

export default function MagneticLink(props: MagneticLinkProps) {
  let localElementRef: HTMLButtonElement | undefined;
  let innerElementRef: HTMLElement | undefined;

  const [isMobile, setIsMobile] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);

  // --- Circle Effect Logic ---
  let circleRef: HTMLDivElement | undefined;
  let circleAnimation: ReturnType<typeof animate> | undefined;

  const handleMouseEnter = () => {
    if (isMobile()) return;
    if (props.enableHoverCircle && circleRef) {
      if (circleAnimation) circleAnimation.pause();
      circleAnimation = animate(circleRef, {
        translateY: ["101%", "0%"],
        duration: 400,
        easing: "easeOutQuad",
      });
    }
  };

  // --- Magnetic Effect Logic ---
  let buttonAnimatableInstance: any;
  let innerAnimatableInstance: any;

  const handleMouseMove = (e: MouseEvent) => {
    if (isMobile() || !localElementRef || !buttonAnimatableInstance) return;

    const rect = localElementRef.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const distanceX = e.clientX - elementCenterX;
    const distanceY = e.clientY - elementCenterY;

    buttonAnimatableInstance.translateX(distanceX * 0.35);
    buttonAnimatableInstance.translateY(distanceY * 0.35);

    if (innerAnimatableInstance) {
      innerAnimatableInstance.translateX(distanceX * 0.2);
      innerAnimatableInstance.translateY(distanceY * 0.2);
    }
  };

  // --- Magnetic Effect Logic ---
  const handleMouseLeave = () => {
    if (isMobile()) return;

    // Trigger magnetic leave effect
    if (buttonAnimatableInstance) {
      buttonAnimatableInstance.translateX(0);
      buttonAnimatableInstance.translateY(0);
    }
    if (innerAnimatableInstance) {
      innerAnimatableInstance.translateX(0);
      innerAnimatableInstance.translateY(0);
    }
  };

  // --- Circle Exit Animation Logic ---
  const triggerCircleExitAnimation = () => {
    if (isMobile()) return;
    if (props.enableHoverCircle && circleRef) {
      if (circleAnimation) circleAnimation.pause();
      circleAnimation = animate(circleRef, {
        translateY: "-101%",
        duration: 400,
        easing: "easeInQuad",
      });
    }
  };

  const setRef = (el: HTMLButtonElement) => {
    localElementRef = el;
    if (props.ref) {
      props.ref(el);
    }
  };

  const setInnerRef = (el: HTMLElement) => {
    innerElementRef = el;
    if (innerElementRef && !innerAnimatableInstance && !isMobile()) {
      innerAnimatableInstance = createAnimatable(innerElementRef, {
        translateX: 0,
        translateY: 0,
        ease: eases.outElastic(1, 0.3),
        duration: 1500,
      });
    }
  };

  onMount(() => {
    if (!import.meta.env.SSR) {
      const mediaQuery = window.matchMedia("(max-width: 767px)");
      setIsMobile(mediaQuery.matches);
      const handleMediaQueryChange = (e: MediaQueryListEvent) =>
        setIsMobile(e.matches);
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      onCleanup(() =>
        mediaQuery.removeEventListener("change", handleMediaQueryChange)
      );
    }
    setIsReady(true);
  });

  createEffect(() => {
    if (props.triggerLeaveAnimation && props.triggerLeaveAnimation()) {
      triggerCircleExitAnimation();
      if (props.setTriggerLeaveAnimation) {
        props.setTriggerLeaveAnimation(false);
      }
    }
  });

  createEffect(() => {
    if (localElementRef) {
      if (!isMobile()) {
        buttonAnimatableInstance = createAnimatable(localElementRef, {
          translateX: 0,
          translateY: 0,
          ease: eases.outElastic(1, 0.3),
          duration: 1500,
        });

        localElementRef.addEventListener("mouseenter", handleMouseEnter);
        localElementRef.addEventListener("mousemove", handleMouseMove);
        localElementRef.addEventListener("mouseleave", handleMouseLeave);
      } else {
        localElementRef.removeEventListener("mouseenter", handleMouseEnter);
        localElementRef.removeEventListener("mousemove", handleMouseMove);
        localElementRef.removeEventListener("mouseleave", handleMouseLeave);
        if (buttonAnimatableInstance) buttonAnimatableInstance.translateX(0);
        if (innerAnimatableInstance) innerAnimatableInstance.translateY(0);
      }
    }
  });

  onCleanup(() => {
    if (localElementRef) {
      localElementRef.removeEventListener("mouseenter", handleMouseEnter);
      localElementRef.removeEventListener("mousemove", handleMouseMove);
      localElementRef.removeEventListener("mouseleave", handleMouseLeave);
    }
  });

  return (
    <button
      ref={setRef}
      onClick={props.onClick}
      {...props}
      class={`${props.class || ""} ${
        props.applyOverflowHidden ? "overflow-hidden" : ""
      }`}
    >
      <div class="relative z-10">
        {typeof props.children === "function"
          ? props.children(setInnerRef)
          : props.children}
      </div>
      {props.enableHoverCircle && !isMobile() && (
        <div
          ref={(el) => (circleRef = el)}
          class="absolute w-full aspect-square rounded-full"
          style={{
            "background-color": props.hoverCircleColor || "#455CE9",
            transform: "translateY(101%)",
            "z-index": "0",
            visibility: isReady() ? "visible" : "hidden",
          }}
        ></div>
      )}
    </button>
  );
}
