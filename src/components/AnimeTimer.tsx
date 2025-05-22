import { createSignal, onCleanup, onMount } from "solid-js";
import { createTimer, type Timer } from "animejs";
import { RefreshCw } from "lucide-solid";

function AnimeTimer() {
  const [currentTime, setCurrentTime] = createSignal(0);
  const [loopCount, setLoopCount] = createSignal(0);
  let timerInstance: Timer | undefined;

  const createTimerParams = () => ({
    duration: 1000,
    loop: true,
    frameRate: 30,
    onUpdate: (self: Timer) => {
      setCurrentTime(Math.floor(self.currentTime));
    },
    onLoop: (self: Timer) => {
      setLoopCount((self as any)._currentIteration);
    },
  });

  const startNewTimer = () => {
    if (timerInstance) {
      timerInstance.pause();
    }
    setCurrentTime(0);
    setLoopCount(0);

    timerInstance = createTimer(createTimerParams());
    timerInstance.play();
  };

  onMount(() => {
    startNewTimer();
  });

  onCleanup(() => {
    if (timerInstance) {
      timerInstance.pause();
    }
  });

  const handleReset = () => {
    startNewTimer();
  };

  return (
    <div
      class={`
        p-5 rounded-lg w-full mx-auto
        bg-white dark:bg-neutral-800/50
        text-neutral-700 dark:text-neutral-300
        shadow-sm border border-neutral-200 dark:border-neutral-700/80
      `}
    >
      <div class="flex justify-between items-center mb-4">
        <h2
          class={`
            text-lg font-medium
            text-neutral-800 dark:text-neutral-200
          `}
        >
          Animation Timer
        </h2>
        <button
          type="button"
          onClick={handleReset}
          class={`
            p-2 rounded-full transition-colors
            text-neutral-600 hover:bg-neutral-200/70
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
            focus-visible:ring-offset-2 focus-visible:ring-offset-white
            dark:text-neutral-400 dark:hover:bg-neutral-700/60
            dark:focus-visible:ring-[#c2fe0c] dark:focus-visible:ring-offset-neutral-800
          `}
          aria-label="Reset Timer"
        >
          <RefreshCw class="w-5 h-5" stroke-width="2.25" />
        </button>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div
          class={`
            p-4 rounded-md flex-1 flex flex-col items-center
            bg-neutral-100 dark:bg-neutral-700/50
          `}
        >
          <span
            class={`
              block text-xs font-medium text-neutral-500 dark:text-neutral-400
              mb-1.5 tracking-normal
            `}
          >
            Current Time
          </span>
          <span
            class={`
              text-3xl font-mono font-medium
              text-sky-600 dark:text-[#c2fe0c]
              h-10 flex items-center justify-center
            `}
          >
            {currentTime()}
          </span>
        </div>
        <div
          class={`
            p-4 rounded-md flex-1 flex flex-col items-center
            bg-neutral-100 dark:bg-neutral-700/50
          `}
        >
          <span
            class={`
              block text-xs font-medium text-neutral-500 dark:text-neutral-400
              mb-1.5 tracking-normal
            `}
          >
            Loops Completed
          </span>
          <span
            class={`
              text-3xl font-mono font-medium
              text-sky-600 dark:text-[#c2fe0c]
              h-10 flex items-center justify-center
            `}
          >
            {loopCount()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AnimeTimer;
