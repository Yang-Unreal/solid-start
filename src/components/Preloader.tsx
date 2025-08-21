import { createSignal, onMount, onCleanup, createMemo } from "solid-js";

import { usePreloader } from "~/context/PreloaderContext";

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
const FIRST_WORD_DELAY = 300; // ms
const SUBSEQUENT_WORD_DELAY = 150; // ms

export default function Preloader() {
  const [index, setIndex] = createSignal(0);
  const [show, setShow] = createSignal(true);
  const [dimension, setDimension] = createSignal({ width: 0, height: 0 });
  const { setIsFinished } = usePreloader();

  const initialPath = createMemo(() => {
    const d = dimension();
    return `M0 0 L${d.width} 0 L${d.width} ${d.height} Q${d.width / 2} ${
      d.height + 300
    } 0 ${d.height} L0 0`;
  });

  const targetPath = createMemo(() => {
    const d = dimension();
    return `M0 0 L${d.width} 0 L${d.width} ${d.height} Q${d.width / 2} ${
      d.height
    } 0 ${d.height} L0 0`;
  });

  const [path, setPath] = createSignal(initialPath());

  onMount(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
    setPath(initialPath());
    let wordInterval: number;
    let exitTimeout: number;

    const totalAnimationTime =
      FIRST_WORD_DELAY + (WORDS.length - 1) * SUBSEQUENT_WORD_DELAY;

    const updateWord = () => {
      setIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < WORDS.length) {
          return nextIndex;
        }
        // Last word has been shown, stop the interval
        window.clearInterval(wordInterval);
        return prev;
      });
    };

    const initialTimeout = window.setTimeout(() => {
      wordInterval = window.setInterval(updateWord, SUBSEQUENT_WORD_DELAY);
    }, FIRST_WORD_DELAY);

    exitTimeout = window.setTimeout(() => {
      setShow(false);
      setPath(targetPath);
      setIsFinished(true);
    }, totalAnimationTime);

    // Cleanup timers when the component is unmounted
    onCleanup(() => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(wordInterval);
      window.clearTimeout(exitTimeout);
    });
  });

  return (
    <div
      class={`fixed left-0 h-screen w-screen bg-black flex justify-center items-center text-white text-6xl z-60 transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] delay-[200ms] ${
        show() ? "top-0" : "top-[-100vh]"
      }`}
    >
      <svg class="absolute top-0 left-0 w-full h-[calc(100%+300px)] pointer-events-none">
        <path
          d={path()}
          class="fill-black transition-all duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] delay-[300ms]"
        ></path>
      </svg>
      <p class="relative z-10 w-96 text-center">{WORDS[index()]}</p>
    </div>
  );
}
