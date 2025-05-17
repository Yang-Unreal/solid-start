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
        p-4 sm:p-5 rounded-xl shadow-xl w-full mx-auto
        /* Light Theme */
        bg-white text-sky-700
        /* Dark Theme */
        dark:bg-zinc-900 dark:text-yellow-500
      `}
    >
      <div class="flex justify-between items-center mb-3 sm:mb-4">
        <h2
          class={`
            text-lg sm:text-xl font-semibold
            /* Light Theme Title */
            text-sky-700
            /* Dark Theme Title */
            dark:text-yellow-500
          `}
        >
          Timer
        </h2>
        <button
          type="button"
          onClick={handleReset}
          class={`
            p-1.5 rounded-full transition-colors
            /* Light Theme Reset Button */
            text-sky-600 hover:bg-sky-100 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 
            focus-visible:ring-offset-2 focus-visible:ring-offset-white
            /* Dark Theme Reset Button */
            dark:text-yellow-500 dark:hover:bg-zinc-700/70 
            dark:focus-visible:ring-yellow-500 dark:focus-visible:ring-offset-zinc-900
          `}
          aria-label="Reset Timer"
        >
          <RefreshCw class="w-4 h-4 sm:w-5 sm:h-5" stroke-width="2" />
        </button>
      </div>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div
          class={`
            p-3 sm:p-4 rounded-lg flex-1 flex flex-col items-center
            /* Light Theme Display Box */
            bg-sky-50
            /* Dark Theme Display Box */
            dark:bg-zinc-800
          `}
        >
          <span
            class={`
              block text-xs font-medium uppercase tracking-wider mb-1 whitespace-nowrap
              /* Light Theme Label */
              text-sky-600/80
              /* Dark Theme Label */
              dark:text-yellow-500/80
            `}
          >
            CURRENT TIME
          </span>
          <span
            class={`
              text-3xl sm:text-4xl font-mono h-[40px] sm:h-[48px] 
              flex items-end justify-center leading-none w-full
              /* Light Theme Value */
              text-sky-700
              /* Dark Theme Value */
              dark:text-yellow-500
            `}
          >
            {currentTime()}
          </span>
        </div>
        <div
          class={`
            p-3 sm:p-4 rounded-lg flex-1 flex flex-col items-center
            /* Light Theme Display Box */
            bg-sky-50
            /* Dark Theme Display Box */
            dark:bg-zinc-800
          `}
        >
          <span
            class={`
              block text-xs font-medium uppercase tracking-wider mb-1 whitespace-nowrap
              /* Light Theme Label */
              text-sky-600/80
              /* Dark Theme Label */
              dark:text-yellow-500/80
            `}
          >
            CALLBACK FIRED
          </span>
          <span
            class={`
              text-3xl sm:text-4xl font-mono h-[40px] sm:h-[48px] 
              flex items-end justify-center leading-none w-full
              /* Light Theme Value */
              text-sky-700
              /* Dark Theme Value */
              dark:text-yellow-500
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
