import { createSignal, For } from "solid-js";
import { Dynamic } from "solid-js/web";

// Styled Dynamic Components using Tailwind classes
const RedDiv = () => (
  <div class="p-6 mt-4 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
    <p class="text-2xl font-semibold text-red-700 dark:text-red-300">
      Red Component
    </p>
    <p class="mt-2 text-red-600 dark:text-red-400">
      This content is dynamically rendered and styled red.
    </p>
  </div>
);

const GreenDiv = () => (
  <div class="p-6 mt-4 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700">
    <p class="text-2xl font-semibold text-green-700 dark:text-green-300">
      Green Component
    </p>
    <p class="mt-2 text-green-600 dark:text-green-400">
      This content is dynamically rendered and styled green.
    </p>
  </div>
);

const BlueDiv = () => (
  <div class="p-6 mt-4 rounded-lg bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700">
    <p class="text-2xl font-semibold text-blue-700 dark:text-blue-300">
      Blue Component
    </p>
    <p class="mt-2 text-blue-600 dark:text-blue-400">
      This content is dynamically rendered and styled blue.
    </p>
  </div>
);

const options = {
  red: RedDiv,
  green: GreenDiv,
  blue: BlueDiv,
};
type ColorOption = keyof typeof options;

export default function DynamicRender() {
  const [selected, setSelected] = createSignal<ColorOption>("red");

  return (
    <div class="mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl space-y-6">
      <h1 class="text-4xl font-bold text-sky-700 dark:text-sky-400">
        Dynamic Component Renderer
      </h1>

      <div>
        <label
          for="colorSelect"
          class="block mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Select a color theme:
        </label>
        <select
          id="colorSelect" // Added id for label association
          value={selected()}
          onInput={(e) => setSelected(e.currentTarget.value as ColorOption)}
          class="block w-full py-3 px-4 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800
                 text-zinc-900 dark:text-zinc-100 rounded-lg shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                 focus:border-sky-500 dark:focus:border-sky-400 transition duration-150 ease-in-out"
        >
          <For each={Object.keys(options) as ColorOption[]}>
            {(color) => (
              <option
                value={color}
                class="text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-700" // Basic styling for options
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}{" "}
                {/* Capitalize */}
              </option>
            )}
          </For>
        </select>
      </div>

      {/* Container for the dynamic component for consistent spacing */}
      <div class="min-h-[150px]">
        {" "}
        {/* Ensures space even if component changes height */}
        <Dynamic component={options[selected()]} />
      </div>
    </div>
  );
}
