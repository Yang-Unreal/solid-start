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
    // This div is now the root of the component and matches DynamicRender's root styling
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg space-y-6 sm:space-y-8">
      <Field.Root class="w-full">
        {/* Title styling matches DynamicRender's h1 */}
        <Field.Label class="text-center block text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider mb-4 sm:mb-6">
          For List
        </Field.Label>

        <Field.Input
          type="text"
          onKeyDown={handleAddItem}
          placeholder="Type item and press Enter..."
          class={`
            mt-1 w-full 
            py-2.5 px-3.5 
            rounded-md 
            shadow-sm 
            transition duration-150 ease-in-out
            
            /* Light Theme */
            bg-white 
            text-neutral-900 
            border-2 border-neutral-300 
            focus:outline-none 
            focus:ring-2 focus:ring-sky-500 
            focus:border-sky-500
            
            /* Dark Theme */
            dark:bg-neutral-900 
            dark:text-neutral-200 
            dark:border-neutral-700 
            dark:focus:ring-[#c2fe0c] 
            dark:focus:border-[#c2fe0c]
          `}
        />
      </Field.Root>

      <ul class="divide-y divide-neutral-200 dark:divide-neutral-700 border-t border-b border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
        <Show
          when={items().length > 0}
          fallback={
            <li class="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">
              No items yet. Add some above!
            </li>
          }
        >
          <For each={items()}>
            {(item, index) => (
              <li class="flex items-center justify-between px-4 py-3 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 even:bg-neutral-50 dark:even:bg-neutral-800/50">
                <span>
                  {index() + 1}. {item}
                </span>
                {/* Delete button placeholder */}
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  );
}
