import { createSignal, For } from "solid-js";
import { Field } from "@ark-ui/solid"; // Import Ark UI Field component

export default function ForList() {
  const [items, setItems] = createSignal<string[]>([
    "Item 1",
    "Item 2",
    "Item 3",
  ]);

  const handleAddItem = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    // Use the target of the event, which should be the input element within Field.Root
    const input = e.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    setItems([...items(), value]);
    input.value = "";
  };

  return (
    <div class="container mx-auto p-4">
      <div class="bg-slate-100 dark:bg-slate-800 shadow-md rounded-lg p-6">
        {/* Use Ark UI Field component for the input */}
        <Field.Root class="mb-4">
          <Field.Label class="text-4xl font-bold text-sky-700 dark:text-sky-400">
            For List
          </Field.Label>

          <Field.Input
            type="text"
            onKeyDown={handleAddItem}
            placeholder="Press enter after your input"
            class="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </Field.Root>

        {/* Keep native ul and li for the list display, styled with Tailwind */}
        <ul class="divide-y divide-gray-200">
          <For each={items()}>
            {(item, index) => (
              <li class="flex items-center justify-between py-3 text-gray-700">
                <span>
                  {item} - {index()}
                </span>
                {/* Potential for adding delete or other actions here */}
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}
