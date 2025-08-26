import { createEffect, onCleanup, onMount } from "solid-js";
import { gsap } from "gsap";

interface MenuIconProps {
  isOpen: boolean;
  isTransparent: boolean;
}

export default function MenuIcon(props: MenuIconProps) {
  let line1Ref: HTMLDivElement | undefined;
  let line2Ref: HTMLDivElement | undefined;

  createEffect(() => {
    if (line1Ref && line2Ref) {
      const yTranslate = props.isOpen ? 3.5 : 0;
      const rotate = props.isOpen ? 45 : 0;
      const duration = 0.3;

      gsap.to(line1Ref, {
        y: yTranslate,
        rotate: rotate,
        duration: duration,
        ease: "quad.out",
      });
      gsap.to(line2Ref, {
        y: -yTranslate,
        rotate: -rotate,
        duration: duration,
        ease: "quad.out",
      });
    }
  });

  return (
    <div class="flex flex-col gap-1.5 justify-center items-center ">
      <div
        ref={(el) => (line1Ref = el)}
        class={`w-5 h-[1px] transition-colors ${
          props.isTransparent ? "bg-light" : "bg-black"
        }`}
        style={{ "will-change": "transform" }}
      ></div>
      <div
        ref={(el) => (line2Ref = el)}
        class={`w-5 h-[1px] transition-colors ${
          props.isTransparent ? "bg-light" : "bg-black"
        }`}
        style={{ "will-change": "transform" }}
      ></div>
    </div>
  );
}
