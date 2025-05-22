import { createSignal, For } from "solid-js";
import { Dynamic } from "solid-js/web";

const dynamicBoxBaseClass =
  "p-5 mt-4 rounded-lg border bg-neutral-50 dark:bg-neutral-800/30";

const RedDiv = () => (
  <div
    class={`${dynamicBoxBaseClass} border-red-400/70 dark:border-red-500/50`}
  >
    <p class="text-xl font-medium text-red-700 dark:text-red-400">
      Red Variant
    </p>
    <p class="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
      This content is dynamically rendered with a red accent.
    </p>
  </div>
);

const GreenDiv = () => (
  <div
    class={`${dynamicBoxBaseClass} border-green-400/70 dark:border-green-500/50`}
  >
    <p class="text-xl font-medium text-green-700 dark:text-green-400">
      Green Variant
    </p>
    <p class="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
      This content is dynamically rendered with a green accent.
    </p>
  </div>
);

const BlueDiv = () => (
  <div
    class={`${dynamicBoxBaseClass} border-blue-400/70 dark:border-blue-500/50`}
  >
    <p class="text-xl font-medium text-blue-700 dark:text-blue-400">
      Blue Variant
    </p>
    <p class="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
      This content is dynamically rendered with a blue accent.
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
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-xl dark:shadow-neutral-950/50 space-y-6 sm:space-y-8">
      <h1 class="text-center text-2xl font-medium text-neutral-800 dark:text-neutral-200">
        Dynamic Renderer
      </h1>

      <div>
        <label
          for="colorSelectDR"
          class="block mb-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400"
        >
          Select Accent Variant:
        </label>
        <select
          id="colorSelectDR"
          value={selected()}
          onInput={(e) => setSelected(e.currentTarget.value as ColorOption)}
          class={`
            block w-full
            py-2 px-3
            rounded-md
            border
            transition duration-150 ease-in-out
            appearance-none
            bg-white text-neutral-900 border-neutral-300
            focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:border-[#c2fe0c]
            dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
            dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]
          `}
        >
          <For each={Object.keys(options) as ColorOption[]}>
            {(color) => (
              <option
                value={color}
                class="text-neutral-800 bg-white dark:text-neutral-200 dark:bg-neutral-800"
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </option>
            )}
          </For>
        </select>
      </div>

      <div class="min-h-[160px] pt-1">
        <Dynamic component={options[selected()]} />
      </div>
    </div>
  );
}
