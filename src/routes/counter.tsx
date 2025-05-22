import { createSignal, createMemo, ParentComponent, Component } from "solid-js";
import CounterContext, { useCounter } from "~/context/CounterContext";

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
      <p class="text-md text-neutral-600 dark:text-neutral-300">
        Shared Count:{" "}
        <span class="font-semibold text-lg text-sky-600 dark:text-[#c2fe0c]">
          {count()}
        </span>
      </p>
    </div>
  );
};

const baseButtonClass =
  "rounded-lg font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-800";
const primaryButtonColors =
  "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500 dark:bg-[#c2fe0c] dark:hover:bg-[#a8e00a] dark:text-black dark:focus:ring-[#c2fe0c]";
const regularButtonSize = "px-5 py-2.5 text-sm";
const smallButtonSize = "px-4 py-2 text-xs";

const IncrementButton: Component = () => {
  const { setCount } = useCounter();
  return (
    <button
      class={`${baseButtonClass} ${primaryButtonColors} ${regularButtonSize} min-w-[180px]`}
      onClick={() => setCount((c) => c + 1)}
    >
      Increment Shared
    </button>
  );
};

const NestedComponent: Component = () => {
  const { count, setCount } = useCounter();
  return (
    <div class="mt-6 p-5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center space-y-3 w-full max-w-sm">
      <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Nested Component
      </p>
      <p class="text-md text-neutral-600 dark:text-neutral-400">
        Count:{" "}
        <span class="font-semibold text-sky-600 dark:text-[#c2fe0c]">
          {count()}
        </span>
      </p>
      <button
        class={`${baseButtonClass} ${primaryButtonColors} ${smallButtonSize} min-w-[120px]`}
        onClick={() => setCount((c) => c * 2)}
      >
        Double Shared
      </button>
    </div>
  );
};

export default function CounterPage() {
  const [num, setNum] = createSignal(2);
  const squared = createMemo(() => {
    const current = num();
    return current * current;
  });

  const cardTitleClass =
    "text-2xl font-medium text-neutral-800 dark:text-neutral-200 mb-1";

  return (
    <main class="bg-neutral-100 dark:bg-neutral-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div class="card-wrapper">
          <h2 class={cardTitleClass}>Local Counter</h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Perform basic operations.
          </p>
          <div class="flex gap-3 mb-8">
            <button
              class={`${baseButtonClass} ${primaryButtonColors} ${regularButtonSize}`}
              onClick={() => setNum(num() + 1)}
            >
              Add 1
            </button>
            <button
              class={`${baseButtonClass} ${primaryButtonColors} ${regularButtonSize}`}
              onClick={() => setNum(-num())}
            >
              Negate
            </button>
          </div>
          <div class="text-center space-y-5">
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                Current value
              </p>
              <p class="font-semibold text-4xl text-sky-600 dark:text-[#c2fe0c] mt-1">
                {num()}
              </p>
            </div>
            <div>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">
                Squared result
              </p>
              <p class="font-semibold text-4xl text-sky-600 dark:text-[#c2fe0c] mt-1">
                {squared()}
              </p>
            </div>
          </div>
        </div>

        <div class="card-wrapper">
          <CounterProvider>
            <h2 class={cardTitleClass}>Shared Counter</h2>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Using Solid's Context API.
            </p>
            <DisplayCount />
            <div class="mt-4 mb-6">
              <IncrementButton />
            </div>
            <NestedComponent />
          </CounterProvider>
        </div>
      </div>
    </main>
  );
}
