import { createSignal, Show } from "solid-js";
import type { Component } from "solid-js";

export const RefsExample: Component = () => {
  let myInputRef: HTMLInputElement | undefined;
  const [inputValue, setInputValue] = createSignal("");
  const [message, setMessage] = createSignal("");

  const handleFocusInput = () => {
    if (myInputRef) {
      myInputRef.focus();
    }
  };

  const handleClearAndFocus = () => {
    if (myInputRef) {
      myInputRef.value = "";
      setInputValue("");
      myInputRef.focus();
      setMessage("Input cleared and focused using ref!");
    }
  };

  const handleShowValue = () => {
    if (myInputRef) {
      setMessage(`Current input value via ref: "${myInputRef.value}"`);
    }
  };

  return (
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg space-y-6 sm:space-y-8 h-full flex flex-col">
      <h2 class="text-center block text-2xl font-medium text-neutral-800 dark:text-neutral-200 mb-5">
        Refs Example
      </h2>

      <p class="text-sm text-neutral-600 dark:text-neutral-400 text-center">
        Click buttons to interact with the input field using a direct DOM
        reference.
      </p>

      <input
        ref={myInputRef}
        type="text"
        value={inputValue()}
        onInput={(e) => setInputValue(e.currentTarget.value)}
        placeholder="Type something..."
        class={`
          block w-full
          py-2 px-3
          rounded-md
          border
          transition duration-150 ease-in-out
          bg-white text-neutral-900 border-neutral-300
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
          dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
          dark:focus:ring-sky-400 dark:focus:border-sky-400
        `}
      />

      <div class="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={handleFocusInput}
          class="px-4 py-2 text-sm font-medium rounded-md bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          Focus Input
        </button>
        <button
          onClick={handleClearAndFocus}
          class="px-4 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          Clear & Focus
        </button>
        <button
          onClick={handleShowValue}
          class="px-4 py-2 text-sm font-medium rounded-md bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-500 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          Show Value (from ref)
        </button>
      </div>

      <Show when={message()}>
        <p class="mt-4 text-sm text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-800/30 p-2 rounded-md">
          {message()}
        </p>
      </Show>
      <div class="mt-auto pt-4 text-xs text-neutral-500 dark:text-neutral-400/80 text-center">
        <p>
          Input value (via signal):{" "}
          <span class="font-mono bg-neutral-100 dark:bg-neutral-700 p-1 rounded">
            {inputValue()}
          </span>
        </p>
      </div>
    </div>
  );
};
