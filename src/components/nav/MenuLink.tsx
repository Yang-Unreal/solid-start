import { createEffect, createSignal } from "solid-js";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";

type MenuLinkProps = {
  href: string;
  label: string;
  onClick: (e: MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  shouldShowUnderline: boolean;
  // We pass a ref callback to capture the LI element for the parent's staggered animation
  ref?: (el: HTMLLIElement) => void;
};

const MenuLink = (props: MenuLinkProps) => {
  let underlineRef: HTMLDivElement | undefined;
  // Local hover state for TextAnimation
  const [hoverState, setHoverState] = createSignal<"enter" | "leave" | null>(null);

  createEffect(() => {
    if (underlineRef) {
      gsap.to(underlineRef, {
        scaleX: props.shouldShowUnderline ? 1 : 0,
        transformOrigin: props.shouldShowUnderline ? "0% 50%" : "100% 50%",
        duration: 0.3,
      });
    }
  });

  return (
    <div class="link-wrap">
      <li class="link" ref={props.ref}>
        <a
          href={props.href}
          class="link-click"
          onClick={props.onClick}
          onMouseEnter={() => {
            setHoverState("enter");
            props.onMouseEnter();
          }}
          onMouseLeave={() => {
            setHoverState("leave");
            props.onMouseLeave();
          }}
        >
          <TextAnimation
            originalClass="text-light"
            duplicateClass="text-light"
            text={props.label}
            class="overflow-hidden"
            textStyle="pt-[0.1em] text-[1.25em] leading-[0.86] tracking-wide uppercase font-formula-bold"
            externalTrigger={hoverState()}
          />
          <div
            ref={underlineRef}
            class="absolute bottom-0 left-0 w-full h-0.5 bg-light scale-x-0"
          ></div>
        </a>
      </li>
    </div>
  );
};

export default MenuLink;
