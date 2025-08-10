import type { Component, ComponentProps } from "solid-js";
import Hoverable from "./Hoverable";

const HoverableButton: Component<ComponentProps<typeof Hoverable>> = (
  props
) => {
  return (
    <div class="inline-block">
      <Hoverable
        {...props}
        class={`flex items-center justify-center ${props.class || ""}`}
      >
        {props.children}
      </Hoverable>
    </div>
  );
};

export default HoverableButton;
