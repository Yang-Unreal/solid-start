import { createSignal, type Component, type JSX, splitProps } from "solid-js";
import MagneticLink from "~/components/MagneticLink";

interface NavButtonProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  onClick: () => void;
  "aria-label": string;
  isTransparent?: boolean;
  children: (ref: (el: HTMLElement) => void) => JSX.Element;
}

const NavButton: Component<NavButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["onClick", "aria-label", "isTransparent", "children", "class"]);
  const [shouldTriggerLeaveAnimation, setShouldTriggerLeaveAnimation] =
    createSignal(false);

  return (
    <div
      {...others}
      onMouseEnter={() => setShouldTriggerLeaveAnimation(false)}
      onMouseLeave={() => setShouldTriggerLeaveAnimation(true)}
      class={`group ${local.isTransparent ? "text-light" : "text-black"} ${local.class || ''}`}>
      <MagneticLink
        onClick={local.onClick}
        class="w-auto h-8 px-1.5 md:px-3 flex justify-center items-center rounded-full"
        aria-label={local["aria-label"]}
        enableHoverCircle={false}
        hoverCircleColor="hsl(75, 99%, 52%)"
        applyOverflowHidden={true}
        triggerLeaveAnimation={shouldTriggerLeaveAnimation}
        setTriggerLeaveAnimation={setShouldTriggerLeaveAnimation}
      >
        {props.children}
      </MagneticLink>
    </div>
  );
};

export default NavButton;
