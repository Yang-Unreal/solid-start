import { createSignal } from "solid-js";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <button
      class={`
        w-auto min-w-[180px]
        rounded-full
        px-7 py-2.5
        text-sm sm:text-base
        font-semibold
        uppercase
        tracking-wider
        transition-colors duration-150 ease-in-out
        border-2


        bg-neutral-100
        border-[#c2fe0c] 
        text-neutral-800  
        hover:bg-neutral-200
        hover:border-[#a8e00a] 
        active:bg-neutral-300
        active:border-[#8ab40a] 
        focus:outline-none
        focus:ring-2
        focus:ring-[#c2fe0c]
        focus:ring-offset-2
        focus:ring-offset-neutral-100 

     
        dark:bg-black
        dark:border-[#c2fe0c]
        dark:text-[#c2fe0c]
        dark:hover:bg-[#c2fe0c]
        dark:hover:text-black
        dark:active:bg-[#a8e00a]
        dark:active:text-black
        dark:focus:ring-offset-black 
      `}
      onClick={() => setCount(count() + 1)}
    >
      Clicks: {count()}
    </button>
  );
}
