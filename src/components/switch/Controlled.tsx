import { Switch as ArkSwitch } from "@ark-ui/solid/switch";
import { createSignal, Switch as SolidSwitch, Match } from "solid-js";

// Changed from a named export to a standard function declaration
const Controlled = () => {
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
            bg-neutral-300
            data-[state=checked]:bg-[#c2fe0c]
            data-[hover]:not([data-state=checked]):bg-neutral-400
            data-[state=checked]:data-[hover]:bg-[#a8e00a]
            data-[focus-visible]:outline-none
            data-[focus-visible]:ring-2
            data-[focus-visible]:ring-[#c2fe0c]
            data-[focus-visible]:ring-offset-2
            data-[focus-visible]:ring-offset-white
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

export default Controlled;
