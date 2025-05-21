import { createSignal, Index, Show } from "solid-js";
import { Editable, type EditableValueChangeDetails } from "@ark-ui/solid";

function IndexList() {
  const [inputs, setInputs] = createSignal(["input1", "input2", "input3"]);

  const handleValueChange = (
    index: number,
    details: EditableValueChangeDetails
  ) => {
    setInputs((prevInputs) => {
      const nextInputs = [...prevInputs];
      nextInputs[index] = details.value;
      // console.log(`Input at index ${index} updated to: ${details.value}`);
      return nextInputs;
    });
  };

  const baseButtonClass =
    "px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900";

  return (
    // Matched root container style with DynamicRender
    <div class="mx-auto p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg  space-y-6 sm:space-y-8">
      {/* Matched title style */}
      <h1 class=" text-center text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider">
        Index List
      </h1>

      {/* The form tag itself doesn't need extra styling if the parent div handles it */}
      <form onSubmit={(e) => e.preventDefault()}>
        {" "}
        {/* Added onSubmit to prevent default form submission */}
        <ul class="divide-y divide-neutral-200 dark:divide-neutral-700 border-t border-b border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
          <Index each={inputs()}>
            {(input, index) => {
              const inputId = `item-input-${index}`;
              return (
                <li class="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 even:bg-neutral-50 dark:even:bg-neutral-800/50">
                  <Editable.Root
                    defaultValue={input()}
                    onValueChange={(details) =>
                      handleValueChange(index, details)
                    }
                    // Ensure Editable.Root takes full width and aligns items
                    class="flex items-center justify-between gap-2 sm:gap-4 w-full"
                  >
                    {/* Hidden label for accessibility, associated with input */}
                    <Editable.Label for={inputId} class="sr-only">
                      Item {index + 1}
                    </Editable.Label>

                    <Editable.Area class="flex-grow min-w-0">
                      {" "}
                      {/* Allows input to shrink/grow */}
                      <Editable.Preview class="px-3 py-2 border-2 border-transparent rounded-md hover:border-neutral-300 dark:hover:border-neutral-600 truncate text-neutral-700 dark:text-neutral-300" />
                      <Editable.Input
                        id={inputId}
                        name={`item-${index}`}
                        class={`
                          w-full px-3 py-1.5
                          rounded-md shadow-sm
                          transition duration-150 ease-in-out
                     
                          bg-white text-neutral-900 border-2 border-neutral-300
                          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                 
                          dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600
                          dark:focus:ring-[#c2fe0c] dark:focus:border-[#c2fe0c]
                        `}
                      />
                    </Editable.Area>

                    <Editable.Context>
                      {(editable) => (
                        <Editable.Control class="flex items-center gap-2 flex-shrink-0">
                          <Show
                            when={editable().editing}
                            fallback={
                              <Editable.EditTrigger
                                class={`${baseButtonClass}
                                  text-sky-700 border-sky-500 hover:bg-sky-100 focus:ring-sky-500
                                  dark:text-sky-400 dark:border-sky-600 dark:hover:bg-sky-700/50 dark:focus:ring-sky-500`}
                              >
                                Edit
                              </Editable.EditTrigger>
                            }
                          >
                            <Editable.SubmitTrigger
                              class={`${baseButtonClass}
                                text-green-700 border-green-500 hover:bg-green-100 focus:ring-green-500
                                dark:text-green-400 dark:border-green-600 dark:hover:bg-green-700/50 dark:focus:ring-green-500`}
                            >
                              Save
                            </Editable.SubmitTrigger>
                            <Editable.CancelTrigger
                              class={`${baseButtonClass}
                                text-red-700 border-red-500 hover:bg-red-100 focus:ring-red-500
                                dark:text-red-400 dark:border-red-600 dark:hover:bg-red-700/50 dark:focus:ring-red-500`}
                            >
                              Cancel
                            </Editable.CancelTrigger>
                          </Show>
                        </Editable.Control>
                      )}
                    </Editable.Context>
                  </Editable.Root>
                </li>
              );
            }}
          </Index>
        </ul>
      </form>
    </div>
  );
}

export default IndexList;
