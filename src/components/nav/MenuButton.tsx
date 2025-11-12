import { createSignal, Show, createEffect } from "solid-js";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";
import { useMenu } from "~/context/MenuContext";

export default function MenuButton() {
  const { isMenuOpen, setIsMenuOpen, setMenuButtonRef } = useMenu();
  let menuButtonRef: HTMLButtonElement | undefined;
  let line1Ref: HTMLDivElement | undefined;
  let line2Ref: HTMLDivElement | undefined;
  let line3Ref: HTMLDivElement | undefined;
  const [externalTrigger, setExternalTrigger] = createSignal<
    "enter" | "leave" | null
  >(null);
  createEffect(() => {
    if (line1Ref && line2Ref && line3Ref) {
      if (isMenuOpen()) {
        // Animate to X
        gsap.to(line1Ref, {
          rotation: -135,
          y: 6,
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
    <div class="btn-hamburger">
      <button
        ref={(el) => {
          menuButtonRef = el;
          setMenuButtonRef(el);
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen())}
        onMouseEnter={() => {
          setExternalTrigger("enter");
          if (line1Ref && line3Ref) {
            if (isMenuOpen()) {
              gsap.to(line1Ref, {
                rotation: "-135",
                scaleX: 0.7,
                duration: 0.05,
              });
              gsap.to(line3Ref, {
                rotation: "-45",
                scaleX: 0.7,
                duration: 0.05,
              });
            } else {
              gsap.to(line1Ref, {
                scaleX: 0.7,
                duration: 0.05,
              });
              gsap.to(line3Ref, {
                scaleX: 0.7,
                duration: 0.05,
              });
            }
          }
        }}
        onMouseLeave={() => {
          setExternalTrigger("leave");
          if (line1Ref && line3Ref) {
            if (isMenuOpen()) {
              gsap.to(line1Ref, {
                rotation: "-45",
                scaleX: 1,
                duration: 0.05,
              });
              gsap.to(line3Ref, {
                rotation: "45",
                scaleX: 1,
                duration: 0.05,
              });
            } else {
              gsap.to(line1Ref, { scaleX: 1, duration: 0.05 });
              gsap.to(line3Ref, { scaleX: 1, duration: 0.05 });
            }
          }
        }}
        class={`btn-click`}
      >
        <div class="btn-icon">
          <div class="hamburger">
            <div ref={line1Ref} class="bar before line1"></div>
            <div ref={line2Ref} class="bar line2 "></div>
            <div ref={line3Ref} class="bar after line3 "></div>
          </div>
        </div>
        <div class="bg-gray px-2 xl:px-2.5 h-8.5 xl:h-10 flex justify-center items-center font-formula-bold text-base xl:text-xl">
          <span class="transform translate-y-px transition-opacity duration-300">
            <Show when={!isMenuOpen()}>
              <TextAnimation
                originalColor="rgba(0, 21, 20, 1)"
                duplicateColor="rgba(0, 21, 20, 1)"
                text="MENU"
                externalTrigger={externalTrigger()}
              />
            </Show>
            <Show when={isMenuOpen()}>
              <TextAnimation
                originalColor="rgba(0, 21, 20, 1)"
                duplicateColor="rgba(0, 21, 20, 1)"
                text="CLOSE"
                externalTrigger={externalTrigger()}
              />
            </Show>
          </span>
        </div>
      </button>
    </div>
  );
}
