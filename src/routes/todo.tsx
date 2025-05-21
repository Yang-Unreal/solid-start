import { Component, For, createSignal, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Checkbox as ArkCheckbox,
  type CheckboxCheckedChangeDetails,
} from "@ark-ui/solid/checkbox";
import { Trash2, Plus, Check } from "lucide-solid"; // Using Lucide's Check icon

interface TodoItem {
  id: number;
  text: string;
  completed: boolean; // Our store uses a boolean
}

interface ToDoState {
  items: TodoItem[];
  nextItemId: number;
}

const ToDo: Component = () => {
  const [state, setState] = createStore<ToDoState>({
    items: [
      { id: 1, text: "Use Ark UI Checkbox", completed: false },
      { id: 2, text: "Ensure Lucide Icons work", completed: true },
      { id: 3, text: "Verify Reactive Updates", completed: false },
    ],
    nextItemId: 4,
  });

  const [inputText, setInputText] = createSignal("");

  const addTodoItem = () => {
    const text = inputText().trim();
    if (!text) return;
    const newItem: TodoItem = { id: state.nextItemId, text, completed: false };
    setState(
      produce((s) => {
        s.items.push(newItem);
        s.nextItemId++;
      })
    );
    setInputText("");
  };

  // Correctly handles the checked state change from Ark UI Checkbox
  const handleCheckboxChange = (
    itemId: number,
    details: CheckboxCheckedChangeDetails
  ) => {
    const newCheckedState = details.checked; // This is boolean | "indeterminate"

    // For our to-do list, 'completed' is always boolean.
    // If Ark UI gives "indeterminate", we need to decide what our boolean state becomes.
    // Typically, for a direct click on a non-indeterminate checkbox, `details.checked` will be boolean.
    let finalBooleanState: boolean;
    if (typeof newCheckedState === "boolean") {
      finalBooleanState = newCheckedState;
    } else {
      // If checkbox somehow was indeterminate and got clicked,
      // a common behavior is to cycle it to true or based on previous state.
      // For simplicity, if it's indeterminate, let's assume it becomes true on next click.
      // Or, if you want to ensure it only toggles boolean, you'd get the current store value.
      // Since onCheckedChange gives the *new* state, we'll trust the boolean path mostly.
      console.warn(
        `Checkbox for item ${itemId} reported indeterminate. Defaulting to true.`
      );
      finalBooleanState = true; // Or `false`, or toggle previous based on a more complex logic
    }

    setState(
      produce((s) => {
        const todoToUpdate = s.items.find((item) => item.id === itemId);
        if (todoToUpdate) {
          todoToUpdate.completed = finalBooleanState;
        }
      })
    );
  };

  const deleteTodoItem = (id: number) => {
    setState("items", (prevItems) =>
      prevItems.filter((item) => item.id !== id)
    );
  };

  return (
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-neutral-800/50 space-y-6 sm:space-y-8">
      <h1 class="text-center text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider mb-4 sm:mb-6">
        To-Do List
      </h1>

      <div class="flex gap-x-3">
        <input
          type="text"
          value={inputText()}
          onInput={(e) => setInputText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodoItem();
          }}
          placeholder="What needs to be done?"
          class={`
            flex-grow block w-full py-2.5 px-3.5 rounded-md shadow-sm
            transition duration-150 ease-in-out
            bg-white text-neutral-900 border-2 border-neutral-300
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700
            dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]
          `}
        />
        <button
          onClick={addTodoItem}
          class={`
            px-4 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider
            transition-colors duration-150 ease-in-out border-2 flex items-center gap-x-2
            bg-sky-500 hover:bg-sky-600 border-sky-500 hover:border-sky-600 text-white
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white
            dark:bg-[#c2fe0c] dark:hover:bg-[#a8e00a] dark:border-[#c2fe0c] dark:hover:border-[#a8e00a] dark:text-black
            dark:focus:ring-offset-black
          `}
        >
          <Plus size={18} stroke-width={2.5} />
          <span>Add</span>
        </button>
      </div>

      <div class="border-t border-b border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
        <Show
          when={state.items.length > 0}
          fallback={
            <p class="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
              Your to-do list is empty. Well done!
            </p>
          }
        >
          <ul class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <For each={state.items}>
              {(item) => (
                <li
                  class="flex items-center p-3.5 text-neutral-700 dark:text-neutral-300 
                         bg-white dark:bg-neutral-900 
                         even:bg-neutral-50 dark:even:bg-neutral-800/50 group"
                >
                  <ArkCheckbox.Root
                    checked={item.completed} // Directly use the boolean from store
                    onCheckedChange={(details) =>
                      handleCheckboxChange(item.id, details)
                    }
                    // ArkCheckbox.Root is a <label> by default, so it will wrap the control.
                    // The item.text acts as the visible label, adjacent to it.
                    class="flex items-center shrink-0 mr-4 group/checkbox" // Removed justify-center, cursor-pointer is on Control
                  >
                    <ArkCheckbox.Control
                      class={`
                        w-5 h-5 rounded border-2 transition-colors duration-150
                        flex items-center justify-center cursor-pointer 
                        bg-white dark:bg-neutral-800 
                        border-neutral-400 dark:border-neutral-500 
                        group-data-[state=checked]/checkbox:bg-sky-500 dark:group-data-[state=checked]/checkbox:bg-[#c2fe0c]
                        group-data-[state=checked]/checkbox:border-sky-500 dark:group-data-[state=checked]/checkbox:border-[#c2fe0c]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900
                        focus-visible:ring-sky-500 dark:focus-visible:ring-[#c2fe0c]
                      `}
                    >
                      <ArkCheckbox.Indicator class="text-white dark:text-black">
                        <Check size={14} stroke-width={3} />
                      </ArkCheckbox.Indicator>
                    </ArkCheckbox.Control>
                    {/* <ArkCheckbox.Label class="sr-only">{item.text}</ArkCheckbox.Label> */}{" "}
                    {/* Optional for screen readers if needed */}
                    <ArkCheckbox.HiddenInput />{" "}
                    {/* IMPORTANT for form integration and accessibility */}
                  </ArkCheckbox.Root>

                  <span
                    class={`flex-grow ${
                      item.completed
                        ? "line-through text-neutral-400 dark:text-neutral-500"
                        : ""
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteTodoItem(item.id)}
                    aria-label={`Delete ${item.text}`}
                    class="ml-4 p-1.5 rounded-md text-neutral-400 dark:text-neutral-500 
                           hover:bg-red-100 dark:hover:bg-red-800/70 
                           hover:text-red-600 dark:hover:text-red-400 
                           opacity-0 group-hover:opacity-100 focus:opacity-100 
                           transition-all duration-150"
                  >
                    <Trash2 size={18} stroke-width={2} />
                  </button>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
};

export default ToDo;
