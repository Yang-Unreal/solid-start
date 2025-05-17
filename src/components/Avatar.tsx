import { Avatar as ArkAvatar } from "@ark-ui/solid/avatar";
import { UserIcon } from "lucide-solid"; // Assuming you have lucide-solid for icons
import { Show, splitProps, Component } from "solid-js";

// Define the props for the Avatar component
export interface AvatarProps extends ArkAvatar.RootProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg"; // Optional size prop
}

// Helper to map size prop to Tailwind classes
const sizeClasses = {
  sm: "w-10 h-10 text-sm", // Small avatar
  md: "w-14 h-14 text-lg", // Medium avatar (default)
  lg: "w-20 h-20 text-xl", // Large avatar
};

const iconSizeClasses = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-10 h-10",
};

export const Avatar: Component<AvatarProps> = (props) => {
  // Split props for local handling and passing to Ark UI root
  const [localProps, rootProps] = splitProps(props, [
    "name",
    "src",
    "class",
    "size",
  ]);

  const currentSize = localProps.size || "md"; // Default to medium size

  return (
    <ArkAvatar.Root
      // Base classes for the avatar root
      class={`
        inline-flex items-center justify-center align-middle 
        overflow-hidden select-none 
        bg-black                  
        rounded-full                 
        border-2 border-[#c2fe0c]  
        ${sizeClasses[currentSize]}  
        ${localProps.class || ""}  
      `}
      {...rootProps}
    >
      <ArkAvatar.Fallback
        class={`
          w-full h-full 
          bg-black            
          text-[#c2fe0c]            
          font-semibold 
          flex items-center justify-center 
          leading-none               
        `}
      >
        <Show
          when={localProps.name}
          fallback={<UserIcon class={`${iconSizeClasses[currentSize]}`} />} // Default user icon with dynamic size
        >
          {/* Ensure getInitials is defined and works as expected */}
          {getInitials(localProps.name)}
        </Show>
      </ArkAvatar.Fallback>
      <ArkAvatar.Image
        class="w-full h-full object-cover" // Image should cover the area
        src={localProps.src}
        alt={localProps.name || "User avatar"} // Provide a default alt text
      />
    </ArkAvatar.Root>
  );
};

// Helper function to get initials from a name
const getInitials = (name: string | undefined = ""): string =>
  name
    ? name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2) // Take first two initials
        .join("")
        .toUpperCase()
    : "";
