import { onMount } from "solid-js";
import gsap, { CustomEase } from "gsap/all";

interface TextAnimationProps {
  text: string;
  class?: string;
  originalColor?: string;
  duplicateColor?: string;
}

export default function TextAnimation(props: TextAnimationProps) {
  let originalRef: HTMLSpanElement | undefined;
  let duplicateRef: HTMLSpanElement | undefined;

  onMount(() => {
    CustomEase.create("custom", "0.25,0.1,0.24,1");
  });

  const handleMouseEnter = () => {
    gsap.to(originalRef!, {
      y: "-110%",
      rotation: -12,
      duration: 0.2,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "0%",
      rotation: 0,
      duration: 0.2,
      ease: "custom",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(originalRef!, {
      y: "0%",
      rotation: 0,
      duration: 0.2,
      ease: "custom",
    });
    gsap.to(duplicateRef!, {
      y: "110%",
      rotation: -12,
      duration: 0.2,
      ease: "custom",
    });
  };

  return (
    <div
      class={`relative overflow-hidden cursor-pointer ${props.class || ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={originalRef!}
        class="block"
        style={`color: ${props.originalColor || "inherit"}`}
      >
        {props.text}
      </span>
      <span
        ref={duplicateRef!}
        class="absolute top-0 left-0 block"
        style={`transform: translateY(110%) rotate(-12deg); color: ${
          props.duplicateColor || "inherit"
        }`}
      >
        {props.text}
      </span>
    </div>
  );
}
