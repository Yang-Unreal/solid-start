// src/components/CounterPageContent.tsx
import { createSignal } from "solid-js";
import type { ParentComponent, Component } from "solid-js";
import CounterContext, { useCounter } from "~/context/CounterContext"; // Assuming context is defined

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
    <div class="text-center my-1">
      <p class="text-md text-neutral-600">
        Shared Count:
        {/* Using compliant text color */}
        <span class="block text-3xl font-bold font-mono mt-0.5 text-sky-800">
          {count()}
        </span>
      </p>
    </div>
  );
};

// ACCESSIBILITY FIX: Using high-contrast lime green button style for all buttons
const baseButtonClass =
  "rounded-lg font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
const primaryButtonColors =
  "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 focus:ring-black";
const regularButtonSize = "px-4 py-2 text-sm";
const smallButtonSize = "px-3 py-1.5 text-xs";

const IncrementButton: Component = () => {
  const { setCount } = useCounter();
  return (
    <button
      class={`${baseButtonClass} ${primaryButtonColors} ${regularButtonSize}`}
      onClick={() => setCount((c) => c + 1)}
    >
      Increment
    </button>
  );
};

const NestedComponent: Component = () => {
  const { count, setCount } = useCounter();
  return (
    <div class="mt-2 text-center space-y-2">
      <p class="text-sm font-medium text-neutral-700">Nested Component</p>
      <p class="text-md text-neutral-700">
        Count is {/* Using compliant text color */}
        <span class="font-semibold text-sky-800">{count()}</span>
      </p>
      <button
        class={`${baseButtonClass} ${primaryButtonColors} ${smallButtonSize}`}
        onClick={() => setCount((c) => c * 2)}
      >
        Double
      </button>
    </div>
  );
};

export default function CounterPageContent() {
  const cardTitleClass = "text-xl font-bold text-neutral-800 mb-0.5";
  const cardSubtitleClass = "text-xs text-neutral-600";

  return (
    <>
      <CounterProvider>
        <div class="flex flex-col items-center gap-2">
          <h2 class={cardTitleClass}>Shared Counter</h2>
          <p class={cardSubtitleClass}>Using Solid's Context API</p>
        </div>
        <DisplayCount />
        <IncrementButton />
        <NestedComponent />
      </CounterProvider>
    </>
  );
}
