import { createSignal } from "solid-js";
import TextAnimation from "../TextAnimation";

interface MenuButtonProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  setMenuButtonRef: (el: HTMLElement | undefined) => void;
}

export default function MenuButton(props: MenuButtonProps) {
  let menuButtonRef: HTMLButtonElement | undefined;
  const [externalTrigger, setExternalTrigger] = createSignal<
    "enter" | "leave" | null
  >(null);

  return (
    <div class="fixed bottom-3 md:bottom-3 lg:bottom-7 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-[80]">
      <button
        ref={(el) => {
          menuButtonRef = el;
          props.setMenuButtonRef(el);
        }}
        onClick={() => props.setIsMenuOpen(!props.isMenuOpen)}
        class={`border rounded-m border-gray transition-colors duration-600 menu-button`}
      >
        <div class="flex justify-center items-center">
          <div class="bg-dark px-2.5 h-8.5 xl:h-10 flex justify-center items-center">
            <div
              class="menu-icon gap-0.5 xl:gap-1 text-yellow-300"
              onMouseEnter={() => setExternalTrigger("enter")}
              onMouseLeave={() => setExternalTrigger("leave")}
            >
              <span class="line line1 w-3 xl:w-5"></span>
              <span class="line line2 w-3 xl:w-5"></span>
              <span class="line line3 w-3 xl:w-5"></span>
            </div>
          </div>
          <div class="bg-gray px-2 xl:px-2.5 h-8.5 xl:h-10 flex justify-center items-center font-formula-bold text-base xl:text-xl">
            <span class="transform translate-y-0.25">
              <TextAnimation
                originalColor="rgba(0, 21, 20, 1)"
                duplicateColor="rgba(0, 21, 20, 1)"
                text="MENU"
                externalTrigger={externalTrigger()}
              />
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
