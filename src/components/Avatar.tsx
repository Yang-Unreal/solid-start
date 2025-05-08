import { Avatar as ArkAvatar } from "@ark-ui/solid/avatar";
import { UserIcon } from "lucide-solid";
import { Show, splitProps } from "solid-js";

export interface AvatarProps extends ArkAvatar.RootProps {
  name?: string;
  src?: string;
}

export const Avatar = (props: AvatarProps) => {
  const [localProps, rootProps] = splitProps(props, ["name", "src"]);

  return (
    <ArkAvatar.Root
      class="w-15 h-15 rounded-full overflow-hidden"
      {...rootProps}
    >
      <ArkAvatar.Fallback class="w-full h-full bg-neutral-500 text-white text-2xl font-semibold leading-none flex items-center justify-center">
        <Show when={localProps.name} fallback={<UserIcon />}>
          {getInitials(localProps.name)}
        </Show>
      </ArkAvatar.Fallback>
      <ArkAvatar.Image
        class="w-full h-full object-cover"
        src={localProps.src}
        alt={localProps.name}
      />
    </ArkAvatar.Root>
  );
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .splice(0, 2)
    .join("")
    .toUpperCase();
