import { createSignal, createMemo, ParentComponent, Component } from "solid-js";
import CounterContext, { useCounter } from "~/context/CounterContext"; // Assuming this path is correct

export default function Counter() {
  // --- Local Counter State ---
  const [num, setNum] = createSignal(2);
  const squared = createMemo(
    () => {
      const current = num();
      return current * current;
    },
    undefined,
    { equals: (prev, next) => prev === next }
  );

  // --- Context Provider and Consumer Components ---
  // (These are defined locally for this example, but could be separate files)
  const CounterProvider: ParentComponent = (props) => {
    const [count, setCount] = createSignal(0);
    return (
      <CounterContext.Provider value={{ count, setCount }}>
        {props.children}
      </CounterContext.Provider>
    );
  };

  const DisplayCount: Component = () => {
    const { count } = useCounter();
    return (
      <div class="text-center">
        <p class="text-lg text-neutral-700 dark:text-neutral-300">
          Shared Count: <span class="font-bold text-xl">{count()}</span>
        </p>
      </div>
    );
  };

  const IncrementButton: Component = () => {
    const { setCount } = useCounter();
    // Button styling consistent with other theme-aware buttons
    const buttonClass = `
      min-w-[160px] px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider
      transition-colors duration-150 ease-in-out border-2
      bg-sky-500 hover:bg-sky-600 border-sky-500 hover:border-sky-600 text-white
      focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white
      dark:bg-[#c2fe0c] dark:hover:bg-[#a8e00a] dark:border-[#c2fe0c] dark:hover:border-[#a8e00a] dark:text-black
      dark:focus:ring-offset-black
    `;
    return (
      <button class={buttonClass} onClick={() => setCount((c) => c + 1)}>
        Increment Shared
      </button>
    );
  };

  const NestedComponent: Component = () => {
    const { count, setCount } = useCounter();
    const buttonClass = `
      min-w-[100px] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider
      transition-colors duration-150 ease-in-out border-2
      bg-teal-500 hover:bg-teal-600 border-teal-500 hover:border-teal-600 text-white
      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white
      dark:bg-teal-400 dark:hover:bg-teal-500 dark:border-teal-400 dark:hover:border-teal-500 dark:text-black
      dark:focus:ring-offset-neutral-800
    `;
    return (
      <div class="mt-4 p-4 border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-md bg-neutral-50 dark:bg-neutral-800 text-center space-y-2">
        <p class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Nested Component Area
        </p>
        <p class="text-md text-neutral-700 dark:text-neutral-300">
          Shared Count: <span class="font-bold">{count()}</span>
        </p>
        <button class={buttonClass} onClick={() => setCount((c) => c * 2)}>
          Double Shared
        </button>
      </div>
    );
  };

  // Base styles for the buttons in the local counter section
  const localButtonClass = `
    min-w-[100px] px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider
    transition-colors duration-150 ease-in-out border-2
    bg-indigo-500 hover:bg-indigo-600 border-indigo-500 hover:border-indigo-600 text-white
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white
    dark:bg-indigo-400 dark:hover:bg-indigo-500 dark:border-indigo-400 dark:hover:border-indigo-500 dark:text-black
    dark:focus:ring-offset-black
  `;

  return (
    // Main wrapper for the entire Counter component page/section
    <div class="space-y-8">
      {" "}
      {/* Adds space between the two cards */}
      {/* Card 1: Local Counter (num, squared) */}
      <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-neutral-800/50 space-y-6">
        <h1 class="text-center text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
          Local Counter
        </h1>
        <div class="flex flex-col items-center space-y-4">
          <div class="flex gap-4">
            <button class={localButtonClass} onClick={() => setNum(num() + 1)}>
              加 1
            </button>
            <button class={localButtonClass} onClick={() => setNum(-num())}>
              取反
            </button>
          </div>
          <div class="text-center">
            <p class="text-lg">
              当前数值: <span class="font-bold text-xl">{num()}</span>
            </p>
            <p class="text-lg">
              平方结果: <span class="font-bold text-xl">{squared()}</span>
            </p>
          </div>
        </div>
      </div>
      {/* Card 2: Context Provider Example */}
      <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-neutral-800/50 space-y-6">
        <CounterProvider>
          <h1 class="text-center text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider mb-2">
            Shared Context Counter
          </h1>
          <div class="flex flex-col items-center space-y-4">
            <DisplayCount />
            <IncrementButton />
            <NestedComponent />
          </div>
        </CounterProvider>
      </div>
    </div>
  );
}
