// src/components/FilterDropdowns.tsx
import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { isServer } from "solid-js/web"; // Import the isServer utility
import { ChevronDown } from "lucide-solid";

interface FilterDropdownProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onSelect: (option: string) => void;
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  // --- THE FIX ---
  // This entire effect contains browser-only code (document, MouseEvent).
  // We wrap it in a check to ensure it ONLY runs on the client, not on the server.
  if (!isServer) {
    createEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // If the dropdown is open and the click is not inside the ref, close it.
        if (
          isOpen() &&
          dropdownRef &&
          !dropdownRef.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      // Add the event listener to the document
      document.addEventListener("mousedown", handleClickOutside);

      // Important: clean up the event listener when the component is destroyed
      onCleanup(() => {
        document.removeEventListener("mousedown", handleClickOutside);
      });
    });
  }

  const toggleDropdown = () => setIsOpen(!isOpen());
  const selectedCount = () => props.selectedOptions.length;

  return (
    <div class="relative font-sans" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        class="w-full h-12 px-4 py-2 text-left bg-white border border-neutral-300 rounded-md shadow-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-black"
      >
        <span class="flex items-center">
          <span class="text-neutral-800 font-medium">{props.title}</span>
          <Show when={selectedCount() > 0}>
            <span class="ml-2 bg-black text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
              {selectedCount()}
            </span>
          </Show>
        </span>
        <ChevronDown
          size={20}
          class={`text-neutral-500 transition-transform duration-200 ${
            isOpen() ? "rotate-180" : ""
          }`}
        />
      </button>

      <Show when={isOpen()}>
        <div class="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          <ul>
            <For each={props.options}>
              {(option) => (
                <li
                  onClick={() => props.onSelect(option)}
                  class="px-4 py-2 text-neutral-700 hover:bg-neutral-100 cursor-pointer flex items-center justify-between"
                >
                  <label
                    for={`filter-${props.title}-${option}`}
                    class="flex items-center justify-between w-full cursor-pointer"
                  >
                    <span>{option}</span>
                    <input
                      id={`filter-${props.title}-${option}`}
                      name={`filter-${props.title}`}
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      checked={props.selectedOptions.includes(option)}
                      readOnly
                    />
                  </label>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}
