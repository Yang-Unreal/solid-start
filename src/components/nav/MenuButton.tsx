import { createSignal, Show, createEffect, onMount } from "solid-js";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";

interface MenuButtonProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  setMenuButtonRef: (el: HTMLElement | undefined) => void;
}

export default function MenuButton(props: MenuButtonProps) {
  let menuButtonRef: HTMLButtonElement | undefined;
  let line1Ref: HTMLSpanElement | undefined;
  let line2Ref: HTMLSpanElement | undefined;
  let line3Ref: HTMLSpanElement | undefined;
  const [externalTrigger, setExternalTrigger] = createSignal<
    "enter" | "leave" | null
  >(null);
  createEffect(() => {
    if (line1Ref && line2Ref && line3Ref) {
      if (props.isMenuOpen) {
        // Animate to X
        gsap.to(line1Ref, {
          rotation: -135,
          y: 5.5,
          duration: 0.05,

          transformOrigin: "center",
        });
        gsap.to(line2Ref, { scaleX: 0, duration: 0.05 });
        gsap.to(line3Ref, {
          rotation: -45,
          y: -6,
          duration: 0.05,

          transformOrigin: "center",
        });
      } else {
        // Animate to hamburger
        gsap.to(line1Ref, {
          rotation: 0,
          y: 0,
          duration: 0.05,

          transformOrigin: "center",
        });
        gsap.to(line2Ref, { scaleX: 1, duration: 0.05 });
        gsap.to(line3Ref, {
          rotation: 0,
          y: 0,
          duration: 0.05,

          transformOrigin: "center",
        });
      }
    }
  });
  return (
    <div class="fixed bottom-3 md:bottom-3 lg:bottom-7 left-1/2 transform -translate-x-1/2 flex items-center justify-center z-[80]">
      <button
        ref={(el) => {
          menuButtonRef = el;
          props.setMenuButtonRef(el);
        }}
        onClick={() => props.setIsMenuOpen(!props.isMenuOpen)}
        onMouseEnter={() => {
          if (line1Ref && line3Ref) {
            gsap.to(line1Ref, {
              scaleX: 0.5,
              duration: 0.05,
              ease: "power2.out",
            });
            gsap.to(line3Ref, {
              scaleX: 0.5,
              duration: 0.05,
              ease: "power2.out",
            });
          }
        }}
        onMouseLeave={() => {
          if (line1Ref && line3Ref) {
            gsap.to(line1Ref, {
              scaleX: 1,

              duration: 0.05,
            });
            gsap.to(line3Ref, {
              scaleX: 1,
              duration: 0.05,
            });
          }
        }}
        class={`border rounded-m border-gray transition-colors duration-600 menu-button`}
      >
        <div class="flex justify-center items-center">
          <div class="bg-dark px-2.5 h-8.5 xl:h-10 flex justify-center items-center">
            <div
              class="menu-icon gap-0.5 xl:gap-1 text-yellow-300"
              onMouseEnter={() => setExternalTrigger("enter")}
              onMouseLeave={() => setExternalTrigger("leave")}
            >
              <span ref={line1Ref} class="line line1 w-3 xl:w-5"></span>
              <span ref={line2Ref} class="line line2 w-3 xl:w-5"></span>
              <span ref={line3Ref} class="line line3 w-3 xl:w-5"></span>
            </div>
          </div>
          <div class="bg-gray px-2 xl:px-2.5 h-8.5 xl:h-10 flex justify-center items-center font-formula-bold text-base xl:text-xl">
            <span class="transform translate-y-0.25 transition-opacity duration-300">
              <Show when={!props.isMenuOpen}>
                <TextAnimation
                  originalColor="rgba(0, 21, 20, 1)"
                  duplicateColor="rgba(0, 21, 20, 1)"
                  text="MENU"
                  externalTrigger={externalTrigger()}
                />
              </Show>
              <Show when={props.isMenuOpen}>
                <TextAnimation
                  originalColor="rgba(0, 21, 20, 1)"
                  duplicateColor="rgba(0, 21, 20, 1)"
                  text="CLOSE"
                  externalTrigger={externalTrigger()}
                />
              </Show>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
