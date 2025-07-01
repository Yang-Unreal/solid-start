import {
  createSignal,
  onMount,
  onCleanup,
  type JSX,
  createEffect,
} from "solid-js";
import { createAnimatable, eases } from "animejs";

interface MagneticLinkProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: (el: HTMLButtonElement) => void;
  onClick?: (e: MouseEvent) => void;
  children?:
    | JSX.Element
    | ((innerRef: (el: HTMLElement) => void) => JSX.Element);
}

export default function MagneticLink(props: MagneticLinkProps) {
  let localElementRef: HTMLButtonElement | undefined;
  let innerElementRef: HTMLElement | undefined;

  const [isMobile, setIsMobile] = createSignal(false);

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

  onMount(() => {
    if (!import.meta.env.SSR) {
      const mediaQuery = window.matchMedia("(max-width: 767px)");
      setIsMobile(mediaQuery.matches);

      const handleMediaQueryChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      onCleanup(() => {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      });
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
        if (buttonAnimatableInstance) {
          buttonAnimatableInstance.translateX(0);
          buttonAnimatableInstance.translateY(0);
        }
        if (innerAnimatableInstance) {
          innerAnimatableInstance.translateX(0);
          innerAnimatableInstance.translateY(0);
        }
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
    <button ref={setRef} onClick={props.onClick} {...props}>
      {typeof props.children === "function"
        ? props.children(setInnerRef)
        : props.children}
    </button>
  );
}
