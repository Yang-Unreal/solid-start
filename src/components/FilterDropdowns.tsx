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

  const toggleDropdown = () => setIsOpen(!isOpen());
  const selectedCount = () => props.selectedOptions.length;

  return (
    <div class="relative font-sans" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        class="w-full h-12 px-4 py-2 text-left bg-white  flex items-center justify-between"
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
        <div class="mt-2 w-full bg-white max-h-60 overflow-y-auto max-w-full overflow-x-hidden">
          <ul>
            <For each={props.options}>
              {(option) => (
                <li
                  onClick={() => props.onSelect(option)}
                  class={`px-4  text-neutral-700 my-1 text-sm rounded-full hover:bg-primary-accent cursor-pointer flex items-center justify-between ${
                    props.selectedOptions.includes(option)
                      ? "bg-primary-accent"
                      : ""
                  }`}
                >
                  <span>{option}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}
