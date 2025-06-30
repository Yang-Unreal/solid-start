import { createSignal, onMount, onCleanup, type JSX } from "solid-js";
import { createAnimatable, eases } from "animejs";

interface MagneticLinkProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: (el: HTMLButtonElement) => void;
  onClick?: (e: MouseEvent) => void;
  children?: JSX.Element | ((tx: number, ty: number) => JSX.Element); // Allow children to be a function
}

export default function MagneticLink(props: MagneticLinkProps) {
  let localElementRef: HTMLButtonElement | undefined;
  const [innerTx, setInnerTx] = createSignal(0);
  const [innerTy, setInnerTy] = createSignal(0);

  const setRef = (el: HTMLButtonElement) => {
    localElementRef = el;
    if (props.ref) {
      props.ref(el);
    }
  };

  let animatableInstance: any;

  const handleMouseMove = (e: MouseEvent) => {
    if (!localElementRef || !animatableInstance) return;

    const rect = localElementRef.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const distanceX = e.clientX - elementCenterX;
    const distanceY = e.clientY - elementCenterY;

    const buttonTranslateX = distanceX * 0.3;
    const buttonTranslateY = distanceY * 0.4;

    // For the inner elements, move them in the opposite direction, but scaled down
    const innerTranslateX = distanceX * 0.2;
    const innerTranslateY = distanceY * 0.3;

    animatableInstance.translateX(buttonTranslateX);
    animatableInstance.translateY(buttonTranslateY);

    setInnerTx(innerTranslateX);
    setInnerTy(innerTranslateY);
  };

  const handleMouseLeave = () => {
    if (animatableInstance) {
      animatableInstance.translateX(0);
      animatableInstance.translateY(0);
    }
    setInnerTx(0);
    setInnerTy(0);
  };

  onMount(() => {
    if (localElementRef) {
      animatableInstance = createAnimatable(localElementRef, {
        translateX: 0,
        translateY: 0,
        ease: eases.outElastic(1, 0.3),
        duration: 1000,
      });

      localElementRef.addEventListener("mousemove", handleMouseMove);
      localElementRef.addEventListener("mouseleave", handleMouseLeave);
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
        ? props.children(innerTx(), innerTy())
        : props.children}
    </button>
  );
}
