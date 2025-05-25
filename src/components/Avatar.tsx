import { Avatar as ArkAvatar } from "@ark-ui/solid/avatar";
import { UserIcon } from "lucide-solid";
import { Show, splitProps } from "solid-js";
import type { Component } from "solid-js";

export interface AvatarProps extends ArkAvatar.RootProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  // If this component were to accept children, you'd add:
  // children?: JSX.Element;
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-lg",
  lg: "w-20 h-20 text-xl",
};

const iconSizeClasses = {
  sm: "w-5 h-5", // For UserIcon inside fallback
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export const Avatar: Component<AvatarProps> = (props) => {
  const [localProps, rootProps] = splitProps(props, [
    "name",
    "src",
    "class",
    "size",
  ]);

  const currentSize = localProps.size || "md";

  return (
    <ArkAvatar.Root
      class={`
        inline-flex items-center justify-center align-middle 
        overflow-hidden select-none 
        rounded-full                
        ${sizeClasses[currentSize]}  
        ${localProps.class || ""}  
      `}
      {...rootProps}
    >
      <ArkAvatar.Fallback
        class={`
          w-full h-full 
          bg-neutral-200 dark:bg-neutral-700            
          text-neutral-700 dark:text-neutral-100            
          font-medium 
          flex items-center justify-center 
          leading-none               
        `}
      >
        <Show
          when={localProps.name}
          fallback={<UserIcon class={`${iconSizeClasses[currentSize]}`} />} // Pass the correct icon size
        >
          {getInitials(localProps.name)}
        </Show>
      </ArkAvatar.Fallback>
      <ArkAvatar.Image
        class="w-full h-full object-cover"
        src={localProps.src}
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
