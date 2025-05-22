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

        bg-[#c2fe0c]
        text-black
        hover:bg-[#a8e00a]
        active:bg-[#8ab40a]
        
        focus:outline-none
        focus:ring-2
        focus:ring-[#c2fe0c]
        focus:ring-offset-2
        focus:ring-offset-neutral-100

        dark:bg-[#c2fe0c]
        dark:text-black
        dark:hover:bg-[#a8e00a]
        dark:active:bg-[#8ab40a]
        dark:focus:ring-offset-black
      `}
      onClick={() => setCount(count() + 1)}
    >
      Clicks: {count()}
    </button>
  );
}
