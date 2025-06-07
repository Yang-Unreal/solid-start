// src/components/Todo.tsx
import { For, createSignal, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Checkbox as ArkCheckbox,
  type CheckboxCheckedChangeDetails,
} from "@ark-ui/solid/checkbox";
import { Trash2, Plus, Check } from "lucide-solid";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}
interface ToDoState {
  items: TodoItem[];
  nextItemId: number;
}

const ToDo = () => {
  const [state, setState] = createStore<ToDoState>({
    items: [
      { id: 1, text: "Review Ark UI Checkbox", completed: false },
      { id: 2, text: "Style with Google aesthetic", completed: true },
      { id: 3, text: "Ensure reactive updates", completed: false },
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

  const handleCheckboxChange = (
    itemId: number,
    details: CheckboxCheckedChangeDetails
  ) => {
    const finalBooleanState =
      typeof details.checked === "boolean" ? details.checked : true;
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

  // ACCESSIBILITY FIX: Using high-contrast button style consistent with Counter.tsx
  const primaryButtonClass = `
    px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
    bg-[#c2fe0c] text-black hover:bg-[#a8e00a] active:bg-[#8ab40a]
    focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:ring-offset-2 dark:focus:ring-offset-black
  `;

  return (
    <div class="w-full max-w-sm mx-auto space-y-4 text-left">
      <h1 class="text-center text-2xl font-bold text-neutral-800 dark:text-neutral-200">
        To-Do List
      </h1>
      <div class="flex gap-x-3">
        <label for="todo-input" class="sr-only">
          Add new todo item
        </label>
        <input
          id="todo-input"
          type="text"
          value={inputText()}
          onInput={(e) => setInputText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodoItem();
          }}
          placeholder="What needs to be done?"
          class="flex-grow block w-full py-2 px-3 rounded-md border transition duration-150 ease-in-out bg-white text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]"
        />
        <button
          onClick={addTodoItem}
          class={`${primaryButtonClass} flex items-center gap-x-1.5`}
        >
          <Plus size={18} stroke-width={2.5} />
          <span>Add</span>
        </button>
      </div>
      <div class="rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <Show
          when={state.items.length > 0}
          fallback={
            <p class="px-4 py-5 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Your to-do list is empty.
            </p>
          }
        >
          <ul class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <For each={state.items}>
              {(item) => (
                <li class="flex items-center p-3 text-sm text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 group">
                  <ArkCheckbox.Root
                    checked={item.completed}
                    onCheckedChange={(details) =>
                      handleCheckboxChange(item.id, details)
                    }
                    class="flex items-center shrink-0 w-full group/checkbox cursor-pointer"
                  >
                    <ArkCheckbox.Control class="w-5 h-5 rounded border transition-colors duration-150 flex items-center justify-center shrink-0 bg-white dark:bg-neutral-800 border-neutral-400 dark:border-neutral-500 group-data-[state=checked]/checkbox:bg-sky-600 dark:group-data-[state=checked]/checkbox:bg-[#c2fe0c] group-data-[state=checked]/checkbox:border-sky-600 dark:group-data-[state=checked]/checkbox:border-[#c2fe0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 focus-visible:ring-sky-500 dark:focus-visible:ring-[#c2fe0c]" />
                    <ArkCheckbox.Label
                      class={`ml-3 flex-grow transition-colors ${
                        item.completed
                          ? "line-through text-neutral-500 dark:text-neutral-400"
                          : "text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      {item.text}
                    </ArkCheckbox.Label>
                    <ArkCheckbox.HiddenInput />
                  </ArkCheckbox.Root>
                  <button
                    onClick={() => deleteTodoItem(item.id)}
                    aria-label={`Delete ${item.text}`}
                    class="ml-3 p-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-red-100/70 dark:hover:bg-red-800/40 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                  >
                    <Trash2 size={16} stroke-width={2} />
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
