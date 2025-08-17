import { createSignal, type Component, type JSX } from "solid-js";
import MagneticLink from "~/components/MagneticLink";

interface NavButtonProps {
  onClick: () => void;
  "aria-label": string;
  isHomepage?: boolean;
  children: (ref: (el: HTMLElement) => void) => JSX.Element;
}

const NavButton: Component<NavButtonProps> = (props) => {
  const [shouldTriggerLeaveAnimation, setShouldTriggerLeaveAnimation] =
    createSignal(false);

  return (
    <div
      onMouseEnter={() => setShouldTriggerLeaveAnimation(false)}
      onMouseLeave={() => setShouldTriggerLeaveAnimation(true)}
      class={`group ${props.isHomepage ? "text-light" : ""}`}
    >
      <MagneticLink
        onClick={props.onClick}
        class="w-auto h-8 px-1.5 md:px-3 flex justify-center items-center rounded-full"
        aria-label={props["aria-label"]}
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
