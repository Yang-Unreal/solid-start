import { Avatar as ArkAvatar } from "@ark-ui/solid/avatar";
import { UserIcon } from "lucide-solid";
import { Show, splitProps } from "solid-js";
import type { Component } from "solid-js";

export interface AvatarProps extends ArkAvatar.RootProps {
  name?: string;
  src?: string;
  srcset?: string; // Added srcset for responsive images
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-lg",
  lg: "w-20 h-20 text-xl",
};

const iconSizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

const Avatar: Component<AvatarProps> = (props) => {
  const [localProps, rootProps] = splitProps(props, [
    "name",
    "src",
    "srcset", // Split srcset prop
    "class",
    "size",
  ]);

  const currentSize = localProps.size || "md";

  // The 'sizes' attribute tells the browser the display size of the image, helping it pick the right source from srcset.
  const imageSizes = () => {
    if (currentSize === "lg") return "80px";
    if (currentSize === "md") return "56px";
    return "40px";
  };

  return (
    <ArkAvatar.Root
      class={`inline-flex items-center justify-center align-middle overflow-hidden select-none rounded-full ${
        sizeClasses[currentSize]
      } ${localProps.class || ""}`}
      {...rootProps}
    >
      <ArkAvatar.Fallback class="w-full h-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-100 font-medium flex items-center justify-center leading-none">
        <Show
          when={localProps.name}
          fallback={<UserIcon class={`${iconSizeClasses[currentSize]}`} />}
        >
          {getInitials(localProps.name)}
        </Show>
      </ArkAvatar.Fallback>
      <ArkAvatar.Image
        class="w-full h-full object-cover"
        src={localProps.src}
        srcset={localProps.srcset}
        sizes={imageSizes()}
        alt={localProps.name || "User avatar"}
      />
    </ArkAvatar.Root>
  );
};

const getInitials = (name: string | undefined = ""): string =>
  name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

export default Avatar;
