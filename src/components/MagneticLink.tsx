import {
  createSignal,
  onMount,
  onCleanup,
  type JSX,
  createEffect,
  type Component,
  type Accessor,
  type Setter,
} from "solid-js";
import { gsap } from "gsap";
import Hoverable from "./Hoverable";

interface MagneticLinkProps {
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
  class?: string;
  isLocked?: Accessor<boolean>;
  "aria-label"?: string;
}

const MagneticLink: Component<MagneticLinkProps> = (props) => {
  let localElementRef: HTMLButtonElement | undefined;
  let innerElementRef: HTMLElement | undefined;

  const [isMobile, setIsMobile] = createSignal(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isMobile() || !localElementRef) return;

    const rect = localElementRef.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const distanceX = e.clientX - elementCenterX;
    const distanceY = e.clientY - elementCenterY;

    gsap.to(localElementRef, {
      x: distanceX * 0.2,
      y: distanceY * 0.2,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  };

  const handleMouseLeave = () => {
    if (isMobile() || !localElementRef) return;

    gsap.to(localElementRef, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  };

  const setRef = (el: HTMLButtonElement) => {
    localElementRef = el;
    if (props.ref) {
      props.ref(el);
    }
  };

  const setInnerRef = (el: HTMLElement) => {
    innerElementRef = el;
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
  });

  createEffect(() => {
    if (localElementRef) {
      if (!isMobile()) {
        localElementRef.addEventListener("mousemove", handleMouseMove);
        localElementRef.addEventListener("mouseleave", handleMouseLeave);
      } else {
        localElementRef.removeEventListener("mousemove", handleMouseMove);
        localElementRef.removeEventListener("mouseleave", handleMouseLeave);
        gsap.to(localElementRef, { x: 0, y: 0 });
      }
    }
  });

  onCleanup(() => {
    if (localElementRef) {
      localElementRef.removeEventListener("mousemove", handleMouseMove);
      localElementRef.removeEventListener("mouseleave", handleMouseLeave);
    }
  });

  return (
    <Hoverable<HTMLButtonElement>
      as="button"
      enableHoverCircle={props.enableHoverCircle}
      hoverCircleColor={props.hoverCircleColor}
      applyOverflowHidden={props.applyOverflowHidden}
      triggerLeaveAnimation={props.triggerLeaveAnimation}
      setTriggerLeaveAnimation={props.setTriggerLeaveAnimation}
      isLocked={props.isLocked}
      ref={setRef}
      onClick={props.onClick}
      class={props.class}
      aria-label={props["aria-label"]}
    >
      {typeof props.children === "function"
        ? props.children(setInnerRef)
        : props.children}
    </Hoverable>
  );
};

export default MagneticLink;
