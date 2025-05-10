import { createSignal, onCleanup, onMount } from "solid-js";
import { createTimer, type Timer } from "animejs";
import { RefreshCw } from "lucide-solid";

function AnimeTimer() {
  const [currentTime, setCurrentTime] = createSignal(0);
  const [loopCount, setLoopCount] = createSignal(0);
  let timerInstance: Timer | undefined;

  // Define timer parameters - try duration 1000 and frameRate 30 for closer parity
  const createTimerParams = () => ({
    duration: 1000, // Changed back to 1000 for testing (was 3000)
    loop: true,
    frameRate: 30, // Added frameRate from original example
    onUpdate: (self: Timer) => {
      setCurrentTime(Math.floor(self.currentTime));
    },
    onLoop: (self: Timer) => {
      // Assuming _currentIteration is 0-indexed for completed loops.
      // If anime.js's _currentIteration is the count of loops completed,
      // it should be 0 after the first loop, 1 after the second, etc.
      setLoopCount((self as any)._currentIteration);
    },
  });

  const startNewTimer = () => {
    if (timerInstance) {
      timerInstance.pause();
      // anime.js createTimer doesn't have a public destroy method.
      // Pausing it and replacing the reference should allow it to be garbage collected.
    }
    // Reset signals for the new timer's display
    setCurrentTime(0);
    setLoopCount(0); // Ensure UI shows 0 for loop count immediately

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
    <div class="bg-zinc-900 p-4 sm:p-5 rounded-xl shadow-xl text-yellow-500 w-full mx-auto">
      {" "}
      {/* Adjusted max-w, padding, rounded */}
      <div class="flex justify-between items-center mb-3 sm:mb-4">
        <h2 class="text-lg sm:text-xl font-semibold text-yellow-500">Timer</h2>{" "}
        {/* Adjusted text size */}
        <button
          type="button"
          onClick={handleReset}
          class="p-1.5 rounded-full text-yellow-500 hover:bg-zinc-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 transition-colors"
          aria-label="Reset Timer"
        >
          <RefreshCw class="w-4 h-4 sm:w-5 sm:h-5" stroke-width="2" />{" "}
          {/* Adjusted icon size/stroke */}
        </button>
      </div>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        {" "}
        {/* Reduced spacing */}
        <div class="bg-zinc-800 p-3 sm:p-4 rounded-lg flex-1 flex flex-col items-center">
          {" "}
          {/* Centering content */}
          <span class="block text-xs font-medium text-yellow-500/80 uppercase tracking-wider mb-1 whitespace-nowrap">
            CURRENT TIME
          </span>
          <span class="text-3xl sm:text-4xl font-mono text-yellow-500 h-[40px] sm:h-[48px] flex items-end justify-center leading-none w-full">
            {" "}
            {/* justify-center, w-full */}
            {currentTime()}
          </span>
        </div>
        <div class="bg-zinc-800 p-3 sm:p-4 rounded-lg flex-1 flex flex-col items-center">
          {" "}
          {/* Centering content */}
          <span class="block text-xs font-medium text-yellow-500/80 uppercase tracking-wider mb-1 whitespace-nowrap">
            CALLBACK FIRED
          </span>
          <span class="text-3xl sm:text-4xl font-mono text-yellow-500 h-[40px] sm:h-[48px] flex items-end justify-center leading-none w-full">
            {" "}
            {/* justify-center, w-full */}
            {loopCount()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AnimeTimer;
