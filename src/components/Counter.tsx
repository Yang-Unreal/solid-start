import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button
      class={`
        w-auto min-w-[160px]
        rounded-lg
        px-6 py-2.5
        text-sm sm:text-base
        font-medium
        transition-colors duration-150 ease-in-out

        bg-black
        text-white
        hover:bg-neutral-800
        active:bg-neutral-700
        
        focus:outline-none
        focus:ring-2
        focus:ring-black
        focus:ring-offset-2
        focus:ring-offset-neutral-100
      `}
      onClick={() => setCount(count() + 1)}
    >
      Clicks: {count()}
    </button>
  );
}
