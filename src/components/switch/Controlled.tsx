import { Switch } from "@ark-ui/solid/switch";
import { createSignal } from "solid-js";
import { Switch as SwitchRender, Match } from "solid-js";
export const Controlled = () => {
  const [checked, setChecked] = createSignal(false);

  return (
    <div>
      <Switch.Root
        checked={checked()}
        onCheckedChange={(e) => setChecked(e.checked)}
        class="group flex items-center gap-3 cursor-pointer"
      >
        <Switch.Control class="relative w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200 data-[state=checked]:bg-blue-500 data-[hover]:bg-gray-300 data-[state=checked]:data-[hover]:bg-blue-600">
          <Switch.Thumb class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 transform data-[state=checked]:translate-x-5" />
        </Switch.Control>
        <Switch.Label class="text-gray-700 data-[state=checked]:text-gray-900">
          <SwitchRender>
            <Match when={checked()}>
              <p>On</p>
            </Match>
            <Match when={!checked()}>
              <p>Off</p>
            </Match>
          </SwitchRender>
        </Switch.Label>
        <Switch.HiddenInput class="sr-only" />
      </Switch.Root>
    </div>
  );
};
