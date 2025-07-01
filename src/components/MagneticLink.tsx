import { createSignal, onMount, onCleanup, type JSX, createEffect } from "solid-js";
import { createAnimatable, eases, animate } from "animejs";

interface MagneticLinkProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: (el: HTMLButtonElement) => void;
  onClick?: (e: MouseEvent) => void;
  children?:
    | JSX.Element
    | ((
        tx: number,
        ty: number,
        innerRef: (el: HTMLElement) => void
      ) => JSX.Element); // Allow children to be a function, now passing innerRef
}

export default function MagneticLink(props: MagneticLinkProps) {
  let localElementRef: HTMLButtonElement | undefined;
  let innerElementRef: HTMLElement | undefined; // New ref for inner elements

  const [isMobile, setIsMobile] = createSignal(false); // New signal for mobile detection

  const setRef = (el: HTMLButtonElement) => {
    localElementRef = el;
    if (props.ref) {
      props.ref(el);
    }
  };

  const setInnerRef = (el: HTMLElement) => {
    innerElementRef = el;
    // Initialize innerAnimatableInstance when the innerElementRef is set
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

    const buttonTranslateX = distanceX * 0.5;
    const buttonTranslateY = distanceY * 0.5;

    const innerTargetX = distanceX * 0.2;
    const innerTargetY = distanceY * 0.2;

    buttonAnimatableInstance.translateX(buttonTranslateX);
    buttonAnimatableInstance.translateY(buttonTranslateY);

    // Animate the inner elements directly using their animatable instance
    if (innerAnimatableInstance) {
      innerAnimatableInstance.translateX(innerTargetX);
      innerAnimatableInstance.translateY(innerTargetY);
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
      const mediaQuery = window.matchMedia("(max-width: 767px)"); // Tailwind's 'md' breakpoint is 768px
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
        // Clean up event listeners if switching to mobile
        localElementRef.removeEventListener("mousemove", handleMouseMove);
        localElementRef.removeEventListener("mouseleave", handleMouseLeave);
        // Reset any active animations
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
        ? props.children(0, 0, setInnerRef) // Pass 0,0 for tx,ty as inner elements will be animated via their own ref
        : props.children}
    </button>
  );
}
