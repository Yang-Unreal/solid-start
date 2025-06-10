import { onMount } from "solid-js";
import { animate } from "animejs"; // Correct import name

export default function LoadingSpinner() {
  let spinnerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (spinnerRef) {
      animate(spinnerRef, {
        rotate: "360deg",
        duration: 1000,
        easing: "linear",
        loop: true,
      });
    }
  });

  return (
    <div class="flex flex-col items-center justify-center h-screen text-neutral-700 text-lg">
      <div ref={spinnerRef} class="h-12 w-12 bg-neutral-500 rounded-md"></div>
      <p class="mt-4">Loading content...</p>
    </div>
  );
}
