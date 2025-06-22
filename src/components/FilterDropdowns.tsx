import { createSignal, For, Show } from "solid-js";

interface FilterDropdownProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onSelect: (option: string) => void;
}

const FilterDropdown = (props: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const toggleDropdown = () => setIsOpen(!isOpen());

  const handleSelect = (option: string) => {
    props.onSelect(option);
  };

  return (
    <div class="relative inline-block text-left">
      <div>
        <button
          type="button"
          class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id={`menu-button-${props.title}`}
          aria-expanded="true"
          aria-haspopup="true"
          onClick={toggleDropdown}
        >
          {props.title}
          <svg
            class="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <Show when={isOpen()}>
        <div
          class="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={`menu-button-${props.title}`}
        >
          <div class="py-1" role="none">
            <For each={props.options}>
              {(option) => (
                <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  <input
                    type="checkbox"
                    class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    checked={props.selectedOptions.includes(option)}
                    onChange={() => handleSelect(option)}
                  />
                  <span class="ml-2">{option}</span>
                </label>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default FilterDropdown;
