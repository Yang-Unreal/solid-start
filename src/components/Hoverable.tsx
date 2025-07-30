import {
  createSignal,
  onMount,
  onCleanup,
  type JSX,
  createEffect,
  type Accessor,
  type Setter,
  type Component,
  splitProps,
} from "solid-js";
import { animate, utils } from "animejs";
import { Dynamic } from "solid-js/web";

interface HoverableProps<E extends HTMLElement = HTMLElement>
  extends Omit<JSX.HTMLAttributes<E>, "children"> {
  as?: string | Component<any>;
  enableHoverCircle?: boolean;
  hoverCircleColor?: string;
  applyOverflowHidden?: boolean;
  triggerLeaveAnimation?: Accessor<boolean>;
  setTriggerLeaveAnimation?: Setter<boolean>;
  children: JSX.Element;
  [key: string]: any;
}

const Hoverable = <E extends HTMLElement = HTMLElement>(
  props: HoverableProps<E>
) => {
  const [local, rest] = splitProps(props, [
    "as",
    "enableHoverCircle",
    "hoverCircleColor",
    "applyOverflowHidden",
    "triggerLeaveAnimation",
    "setTriggerLeaveAnimation",
    "children",
    "class",
    "ref",
  ]);

  let containerRef: E | undefined;
  let circleRef: HTMLDivElement | undefined;
  let circleAnimation: ReturnType<typeof animate> | undefined;

  const [isMobile, setIsMobile] = createSignal(false);
  const [isReady, setIsReady] = createSignal(false);

  const handleMouseEnter = () => {
    if (isMobile()) return;
    if (local.enableHoverCircle && circleRef) {
      if (circleAnimation) circleAnimation.pause();
      circleAnimation = animate(circleRef, {
        translateY: ["101%", "0%"],
        duration: 400,
        easing: "easeOutQuad",
      });
    }
  };

  const triggerCircleExitAnimation = () => {
    if (isMobile()) return;
    if (local.enableHoverCircle && circleRef) {
      if (circleAnimation) circleAnimation.pause();
      circleAnimation = animate(circleRef, {
        translateY: "-101%",
        duration: 400,
        easing: "easeInQuad",
      });
    }
  };

  const setRefs = (el: E) => {
    containerRef = el;
    const ref = local.ref;
    if (typeof ref === "function") {
      ref(el);
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
    if (local.enableHoverCircle && !isMobile() && circleRef) {
      utils.set(circleRef, { translateY: "101%" });
    }
  });

  createEffect(() => {
    if (local.triggerLeaveAnimation && local.triggerLeaveAnimation()) {
      triggerCircleExitAnimation();
      if (local.setTriggerLeaveAnimation) {
        local.setTriggerLeaveAnimation(false);
      }
    }
  });

  createEffect(() => {
    if (containerRef) {
      if (!isMobile()) {
        containerRef.addEventListener("mouseenter", handleMouseEnter);
        containerRef.addEventListener("mouseleave", triggerCircleExitAnimation);
      } else {
        containerRef.removeEventListener("mouseenter", handleMouseEnter);
        containerRef.removeEventListener(
          "mouseleave",
          triggerCircleExitAnimation
        );
      }
    }
  });

  onCleanup(() => {
    if (containerRef) {
      containerRef.removeEventListener("mouseenter", handleMouseEnter);
      containerRef.removeEventListener(
        "mouseleave",
        triggerCircleExitAnimation
      );
    }
  });

  const Tag = local.as || "div";

  return (
    <Dynamic
      component={Tag}
      ref={setRefs}
      class={`relative ${local.applyOverflowHidden ? "overflow-hidden" : ""} ${
        local.class || ""
      }`}
      {...rest}
    >
      <div class="relative z-10">{local.children}</div>
      {local.enableHoverCircle && !isMobile() && (
        <div
          ref={(el) => (circleRef = el)}
          class={`absolute w-full aspect-square rounded-full z-0 bg-[var(--hover-bg)] ${
            isReady() ? "visible" : "invisible"
          }`}
          style={{
            "--hover-bg": local.hoverCircleColor || "#455CE9",
          }}
        ></div>
      )}
    </Dynamic>
  );
};

export default Hoverable;
