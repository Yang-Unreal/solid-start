import { createSignal, createEffect } from "solid-js";

export default function Effect() {
  const [eventTrigger, setEventTrigger] = createSignal(0);
  const initialCount = 0;

  console.log("Setting up the effect. Initial count provided:", initialCount);

  // 3. createEffect with the looping signature
  // T here will be 'number'.
  // - 'previousEventCount' is the 'v: T' parameter. It will be 'initialCount' on the first run,
  //   and the value returned by this function in subsequent runs.
  // - The function returns 'newEventCount', which is 'T', and this value will be
  //   passed as 'previousEventCount' the next time the effect runs.
  createEffect<number>((previousEventCount) => {
    // A. Read the signal that triggers the effect. This makes 'eventTrigger' a dependency.
    const currentTriggerValue = eventTrigger();

    console.log(
      `Effect Run: Trigger value is ${currentTriggerValue}. Previous internal event count was: ${previousEventCount}`
    );

    // B. Perform the logic for this "loop" iteration.
    // Here, we just increment the count.
    const newEventCount = previousEventCount + 1;
    console.log(`  New internal event count is: ${newEventCount}`);

    // C. Return the new count. This value will be supplied as 'previousEventCount'
    //    the next time this effect is triggered.
    return newEventCount;
  }, initialCount); // Pass the initial seed value for the loop.

  // --- Let's simulate some events ---

  // The effect runs once initially when it's created, using 'initialCount'.
  setTimeout(() => {
    console.log("\nSimulating first event (after delay)...");
    setEventTrigger(1); // Triggers effect
  }, 10); // Small delay

  setTimeout(() => {
    console.log("\nSimulating second event (after delay)...");
    setEventTrigger(2); // Triggers effect
  }, 20); // Ensure this is after the first effect run completes

  setTimeout(() => {
    console.log("\nSimulating third event (after delay)...");
    setEventTrigger(3); // Triggers effect
  }, 30);
  return <main class="text-center mx-auto text-gray-700 p-4">Effect</main>;
}
