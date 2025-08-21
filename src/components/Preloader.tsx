import { createSignal, onMount } from "solid-js";
import gsap from "gsap";

const WORDS = [
  "Hello",
  "Bonjour",
  "Ciao",
  "Olà",
  "やあ",
  "Hallå",
  "Guten tag",
  "Hallo",
];

export default function Preloader(props: {
  mainContainerRef: HTMLDivElement | undefined;
}) {
  const [index, setIndex] = createSignal(0);

  let preloaderRef: HTMLDivElement | undefined;
  let wordsRef: HTMLParagraphElement | undefined;
  let pathRef: SVGPathElement | undefined;

  onMount(() => {
    if (typeof window === "undefined" || !preloaderRef || !wordsRef || !pathRef)
      return;

    pathRef.setAttribute(
      "d",
      `M0 0 L${window.innerWidth} 0 L${window.innerWidth} ${
        window.innerHeight
      } Q${window.innerWidth / 2} ${window.innerHeight * 1.2} 0 ${
        window.innerHeight
      } L0 0`
    );

    const tl = gsap.timeline();

    tl.to(wordsRef, {
      duration: 0.8,
      opacity: 1,
      ease: "power2.inOut",
    });

    WORDS.forEach((_, i) => {
      if (i > 0) {
        tl.to(
          {},
          {
            duration: 0.15,
            onComplete: () => {
              setIndex(i);
            },
          }
        );
      }
    });

    tl.to(
      preloaderRef,
      {
        y: "-100vh",
        duration: 0.8,
        ease: "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      "-=0.5"
    );

    if (props.mainContainerRef) {
      gsap.set(props.mainContainerRef, { y: "100vh" });
      tl.to(
        props.mainContainerRef,
        {
          y: 0,
          duration: 0.8,
          ease: "cubic-bezier(0.76, 0, 0.24, 1)",
        },
        "-=0.8"
      );
    }

    tl.to(
      pathRef,
      {
        attr: {
          d: `M0 0 L${window.innerWidth} 0 L${window.innerWidth} ${
            window.innerHeight
          } Q${window.innerWidth / 2} ${window.innerHeight} 0 ${
            window.innerHeight
          } L0 0`,
        },
        duration: 0.7,
        ease: "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      "<0.3"
    );
  });

  return (
    <div
      ref={preloaderRef}
      class="fixed left-0 top-0 z-60 h-screen w-screen bg-black flex justify-center items-center text-white text-6xl"
    >
      <svg class="absolute top-0 left-0 w-full h-[120%] pointer-events-none">
        <path ref={pathRef} d="" class="fill-black"></path>
      </svg>
      <p ref={wordsRef} class="relative z-61 w-96 text-center opacity-0">
        {WORDS[index()]}
      </p>
    </div>
  );
}
