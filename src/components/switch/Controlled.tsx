import { Switch as ArkSwitch } from "@ark-ui/solid/switch";
import {
  createSignal,
  Switch as SolidSwitch,
  Match,
  Component,
} from "solid-js";

interface ControlledSwitchProps {}

export const Controlled: Component<ControlledSwitchProps> = () => {
  const [checked, setChecked] = createSignal(false);

  return (
    <div>
      <ArkSwitch.Root
        checked={checked()}
        onCheckedChange={(e) => setChecked(e.checked)}
        class="group flex items-center gap-x-3 sm:gap-x-4 cursor-pointer"
      >
        <ArkSwitch.Control
          class={`
            relative inline-flex shrink-0
            w-10 h-5
            rounded-full
            transition-colors duration-150 ease-in-out
            bg-neutral-300 dark:bg-neutral-600
            data-[state=checked]:bg-[#c2fe0c]
            data-[hover]:not([data-state=checked]):bg-neutral-400
            dark:data-[hover]:not([data-state=checked]):bg-neutral-500
            data-[state=checked]:data-[hover]:bg-[#a8e00a]
            data-[focus-visible]:outline-none
            data-[focus-visible]:ring-2
            data-[focus-visible]:ring-[#c2fe0c]
            data-[focus-visible]:ring-offset-2
            data-[focus-visible]:ring-offset-white
            dark:data-[focus-visible]:ring-offset-black
          `}
        >
          <ArkSwitch.Thumb
            class={`
              block
              w-4 h-4
              rounded-full
              absolute top-[2px] left-[2px]
              transition-transform duration-150 ease-in-out
              bg-white
              data-[state=checked]:translate-x-[20px]
            `}
          />
        </ArkSwitch.Control>
        <ArkSwitch.Label
          class={`
            select-none
            text-sm sm:text-base font-medium
            transition-colors duration-200
            text-neutral-700
            group-data-[state=checked]:text-neutral-900
            dark:text-neutral-300
            dark:group-data-[state=checked]:text-[#c2fe0c]
          `}
        >
          <SolidSwitch>
            <Match when={checked()}>
              <p>On</p>
            </Match>
            <Match when={!checked()}>
              <p>Off</p>
            </Match>
          </SolidSwitch>
        </ArkSwitch.Label>
        <ArkSwitch.HiddenInput class="sr-only" />
      </ArkSwitch.Root>
    </div>
  );
};
