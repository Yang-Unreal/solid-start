// src/components/AnimeTimer.tsx
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
    <div class="w-full max-w-sm mx-auto text-left">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium text-neutral-800">Animation Timer</h2>
        <button
          type="button"
          onClick={handleReset}
          class="p-2 rounded-full transition-colors text-neutral-600 hover:bg-neutral-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Reset Timer"
        >
          <RefreshCw class="w-5 h-5" stroke-width="2.25" />
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 rounded-lg flex flex-col items-center justify-center bg-neutral-100 h-32">
          <span class="block text-sm font-medium text-neutral-600 mb-1.5 tracking-normal">
            Current Time
          </span>
          <span class="text-4xl font-mono font-bold text-sky-600">
            {currentTime()}
          </span>
        </div>
        <div class="p-4 rounded-lg flex flex-col items-center justify-center bg-neutral-100 h-32">
          <span class="block text-sm font-medium text-neutral-600 mb-1.5 tracking-normal">
            Loops Completed
          </span>
          <span class="text-4xl font-mono font-bold text-sky-600">
            {loopCount()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AnimeTimer;
