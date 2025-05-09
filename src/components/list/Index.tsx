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
      console.log(`Input at index ${index} updated to: ${details.value}`);
      return nextInputs;
    });
  };

  return (
    <form class="container mx-auto p-4">
      <div class="bg-slate-100 dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-4">
        <h2 class="text-4xl font-bold text-sky-700 dark:text-sky-400">
          Index list
        </h2>
        <ul class="divide-y divide-gray-200">
          <Index each={inputs()}>
            {(input, index) => {
              console.log(`Rendering item at index: ${index}`);
              const inputId = `item-input-${index}`;
              return (
                <li class="flex items-center justify-between py-3 text-gray-700">
                  <Editable.Root
                    defaultValue={input()}
                    onValueChange={(details) =>
                      handleValueChange(index, details)
                    }
                    class="flex items-center justify-between gap-4"
                  >
                    <Editable.Label
                      for={inputId}
                      class="block text-sm font-medium text-gray-700 sr-only"
                    >
                      Item {index + 1}
                    </Editable.Label>
                    <Editable.Area class="flex-grow min-w-0">
                      <Editable.Preview class="px-3 py-2 border border-transparent rounded-md hover:border-gray-300 truncate" />{" "}
                      <Editable.Input
                        id={inputId}
                        name={`item-${index}`}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </Editable.Area>

                    <Editable.Context>
                      {(editable) => (
                        <Editable.Control class="flex items-center gap-2">
                          <Show
                            when={editable().editing}
                            fallback={
                              <Editable.EditTrigger class="px-3 py-1 text-sm font-semibold text-blue-600 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                Edit
                              </Editable.EditTrigger>
                            }
                          >
                            <Editable.SubmitTrigger class="px-3 py-1 text-sm font-semibold text-green-600 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                              Save
                            </Editable.SubmitTrigger>
                            <Editable.CancelTrigger class="px-3 py-1 text-sm font-semibold text-red-600 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
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
      </div>
    </form>
  );
}

export default IndexList;
