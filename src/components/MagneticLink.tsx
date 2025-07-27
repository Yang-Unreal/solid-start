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
import { createAnimatable, eases } from "animejs";
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
}

const MagneticLink: Component<MagneticLinkProps> = (props) => {
  let localElementRef: HTMLButtonElement | undefined;
  let innerElementRef: HTMLElement | undefined;

  const [isMobile, setIsMobile] = createSignal(false);

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

  const handleMouseLeave = () => {
    if (isMobile()) return;

    if (buttonAnimatableInstance) {
      buttonAnimatableInstance.translateX(0);
      buttonAnimatableInstance.translateY(0);
    }
    if (innerAnimatableInstance) {
      innerAnimatableInstance.translateX(0);
      innerAnimatableInstance.translateY(0);
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

        localElementRef.addEventListener("mousemove", handleMouseMove);
        localElementRef.addEventListener("mouseleave", handleMouseLeave);
      } else {
        localElementRef.removeEventListener("mousemove", handleMouseMove);
        localElementRef.removeEventListener("mouseleave", handleMouseLeave);
        if (buttonAnimatableInstance) buttonAnimatableInstance.translateX(0);
        if (innerAnimatableInstance) innerAnimatableInstance.translateY(0);
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
      ref={setRef}
      onClick={props.onClick}
      class={props.class}
    >
      {typeof props.children === "function"
        ? props.children(setInnerRef)
        : props.children}
    </Hoverable>
  );
};

export default MagneticLink;
