import { createSignal, For, Show } from "solid-js";
import { Field } from "@ark-ui/solid";

export default function ForList() {
  const [items, setItems] = createSignal<string[]>([
    "Item 1",
    "Item 2",
    "Item 3",
  ]);

  const handleAddItem = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const input = e.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    setItems([...items(), value]);
    input.value = "";
  };

  return (
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg space-y-6 sm:space-y-8">
      <h2 class="text-center block text-2xl font-medium text-neutral-800 dark:text-neutral-200 mb-5">
        For List
      </h2>

      {/* Field.Root helps associate Field.Label and Field.Input */}
      <Field.Root class="w-full">
        {/* The content of Field.Label is used as the accessible name.
            It will be associated with the Field.Input by Ark UI. */}
        <Field.Label class="sr-only">
          {" "}
          {/* Visually hidden, but provides accessible name */}
          Add new item
        </Field.Label>
        <Field.Input // No explicit id needed here if Field.Label doesn't have 'for'
          type="text"
          onKeyDown={handleAddItem}
          placeholder="Type item and press Enter..."
          class={`
            block w-full
            py-2 px-3
            rounded-md
            border
            transition duration-150 ease-in-out
            bg-white text-neutral-900 border-neutral-300
            focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:border-[#c2fe0c]
            dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
            dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]
          `}
        />
      </Field.Root>

      <ul class="divide-y divide-neutral-200 dark:divide-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
        <Show
          when={items().length > 0}
          fallback={
            <li class="px-3 py-2.5 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No items yet. Add some above!
            </li>
          }
        >
          <For each={items()}>
            {(item, index) => (
              <li class="flex items-center justify-between px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900">
                <span>
                  {index() + 1}. {item}
                </span>
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  );
}
