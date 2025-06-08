// src/components/RefsExample.tsx
import { createSignal, Show } from "solid-js";
import type { Component } from "solid-js";

export const RefsExample: Component = () => {
  let myInputRef: HTMLInputElement | undefined;
  const [inputValue, setInputValue] = createSignal("");
  const [message, setMessage] = createSignal("");

  const handleFocusInput = () => {
    if (myInputRef) myInputRef.focus();
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
    if (myInputRef)
      setMessage(`Current input value via ref: "${myInputRef.value}"`);
  };

  // Define a single button style to match Counter.tsx for consistency and accessibility
  const compliantButtonStyle = `
    px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
    bg-[#c2fe0c] text-black hover:bg-[#a8e00a] active:bg-[#8ab40a]
    focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:ring-offset-2
  `;

  return (
    <div class="p-6 sm:p-8 bg-white text-neutral-800 rounded-lg space-y-6 sm:space-y-8 h-full flex flex-col">
      <h2 class="text-center block text-2xl font-medium text-neutral-800 mb-5">
        Refs Example
      </h2>
      <p class="text-sm text-neutral-700 text-center">
        Click buttons to interact with the input field using a direct DOM
        reference.
      </p>
      <label for="refs-example-text-input" class="sr-only">
        Sample Input for Refs Example
      </label>
      <input
        ref={myInputRef}
        id="refs-example-text-input"
        name="refs_example_value"
        type="text"
        value={inputValue()}
        onInput={(e) => setInputValue(e.currentTarget.value)}
        placeholder="Type something..."
        autocomplete="off"
        class="block w-full py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      />
      <div class="flex flex-wrap justify-center gap-3 mt-4">
        <button onClick={handleFocusInput} class={compliantButtonStyle}>
          Focus Input
        </button>
        <button onClick={handleClearAndFocus} class={compliantButtonStyle}>
          Clear & Focus
        </button>
        <button onClick={handleShowValue} class={compliantButtonStyle}>
          Show Value (from ref)
        </button>
      </div>
      <Show when={message()}>
        <p class="mt-4 text-sm text-center text-green-600 bg-green-50 p-2 rounded-md">
          {message()}
        </p>
      </Show>
      <div class="mt-auto pt-4 text-xs text-neutral-600 text-center">
        <p>
          Input value (via signal):{" "}
          <span class="font-mono bg-neutral-100 p-1 rounded">
            {inputValue()}
          </span>
        </p>
      </div>
    </div>
  );
};
export default RefsExample;
