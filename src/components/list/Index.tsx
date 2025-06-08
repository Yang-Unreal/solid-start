// src/components/list/Index.tsx
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
      return nextInputs;
    });
  };

  const baseButtonClass =
    "px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div class="mx-auto p-6 sm:p-8 bg-white text-neutral-800 rounded-lg space-y-6 sm:space-y-8">
      <h1 class="text-center text-2xl font-medium text-neutral-800 mb-5">
        Index List
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <ul class="border border-neutral-200 rounded-md overflow-hidden">
          <Index each={inputs()}>
            {(input, index) => {
              const inputId = `item-input-${index}`;
              return (
                <li class="flex items-center justify-between px-3 py-2.5 bg-white border-b border-neutral-200 last:border-b-0">
                  <Editable.Root
                    defaultValue={input()}
                    onValueChange={(details) =>
                      handleValueChange(index, details)
                    }
                    class="flex items-center justify-between gap-2 sm:gap-4 w-full"
                  >
                    <Editable.Label for={inputId} class="sr-only">
                      Item {index + 1}
                    </Editable.Label>

                    <Editable.Area class="flex-grow min-w-0">
                      <Editable.Preview class="w-full px-2 py-1.5 rounded-md hover:bg-neutral-100 truncate text-neutral-700 cursor-text" />
                      <Editable.Input
                        id={inputId}
                        name={`item-${index}`}
                        class="w-full px-2 py-1 rounded-md border border-neutral-300 transition duration-150 ease-in-out bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#c2fe0c] focus:border-[#c2fe0c]"
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
                                  text-sky-700 hover:bg-sky-500/10 focus:ring-sky-500`}
                              >
                                Edit
                              </Editable.EditTrigger>
                            }
                          >
                            <Editable.SubmitTrigger
                              class={`${baseButtonClass} bg-[#c2fe0c] text-black hover:bg-[#a8e00a] focus:ring-[#c2fe0c]`}
                            >
                              Save
                            </Editable.SubmitTrigger>
                            <Editable.CancelTrigger
                              class={`${baseButtonClass} text-neutral-700 border border-neutral-300 hover:bg-neutral-100 focus:ring-neutral-500`}
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
