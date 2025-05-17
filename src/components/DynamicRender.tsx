import { createSignal, For } from "solid-js";
import { Dynamic } from "solid-js/web";

// --- Theme-Aware Dynamic Components with Rounded Corners ---
const dynamicBoxBaseClass =
  "p-6 mt-4 rounded-md border-2 bg-neutral-50 dark:bg-neutral-900";

const RedDiv = () => (
  <div class={`${dynamicBoxBaseClass} border-red-500 dark:border-red-600`}>
    <p class="text-2xl font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
      Red Variant
    </p>
    <p class="mt-2 text-neutral-700 dark:text-neutral-300">
      This content is dynamically rendered with a red accent.
    </p>
  </div>
);

const GreenDiv = () => (
  <div class={`${dynamicBoxBaseClass} border-green-500 dark:border-green-600`}>
    <p class="text-2xl font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
      Green Variant
    </p>
    <p class="mt-2 text-neutral-700 dark:text-neutral-300">
      This content is dynamically rendered with a green accent.
    </p>
  </div>
);

const BlueDiv = () => (
  <div class={`${dynamicBoxBaseClass} border-blue-500 dark:border-blue-600`}>
    <p class="text-2xl font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
      Blue Variant
    </p>
    <p class="mt-2 text-neutral-700 dark:text-neutral-300">
      This content is dynamically rendered with a blue accent.
    </p>
  </div>
);
// --- End Theme-Aware Dynamic Components ---

const options = {
  red: RedDiv,
  green: GreenDiv,
  blue: BlueDiv,
};
type ColorOption = keyof typeof options;

export default function DynamicRender() {
  const [selected, setSelected] = createSignal<ColorOption>("red");

  return (
    // Removed mx-auto from here, assuming parent layout handles centering if needed
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-neutral-800/50 space-y-6 sm:space-y-8">
      <h1 class="text-center text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider">
        Dynamic Renderer
      </h1>

      <div>
        <label
          for="colorSelectDR" // Changed id to be unique if both components are on same page
          class="block mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide"
        >
          Select Accent Variant:
        </label>
        <select
          id="colorSelectDR" // Changed id
          value={selected()}
          onInput={(e) => setSelected(e.currentTarget.value as ColorOption)}
          class={`
            block w-full
            py-2.5 px-3.5
            rounded-md
            shadow-sm
            transition duration-150 ease-in-out
            appearance-none
            bg-white text-neutral-900 border-2 border-neutral-300
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700
            dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]
          `}
        >
          <For each={Object.keys(options) as ColorOption[]}>
            {(color) => (
              <option
                value={color}
                class="text-neutral-800 bg-white dark:text-neutral-200 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            )}
          </For>
        </select>
      </div>

      <div class="min-h-[180px] pt-2">
        <Dynamic component={options[selected()]} />
      </div>
    </div>
  );
}
