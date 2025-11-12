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

  const barDuration = 0.3;
  createEffect(() => {
    if (line1Ref && line2Ref && line3Ref) {
      if (isMenuOpen()) {
        // Animate to X
        gsap.to(line1Ref, {
          rotation: -135,
          y: "0%",
          duration: barDuration,
          transformOrigin: "center",
        });
        gsap.to(line2Ref, { scaleX: 0, duration: barDuration });
        gsap.to(line3Ref, {
          rotation: -45,
          y: "0%",
          duration: barDuration,

          transformOrigin: "center",
        });
      } else {
        // Animate to hamburger
        gsap.to(line1Ref, {
          rotation: 0,
          y: "-250%",
          duration: barDuration,
          transformOrigin: "center",
        });
        gsap.to(line2Ref, {
          scaleX: 1,
          duration: barDuration,
        });
        gsap.to(line3Ref, {
          rotation: 0,
          y: "250%",
          duration: barDuration,
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
                duration: barDuration,
              });
              gsap.to(line3Ref, {
                rotation: "-45",
                scaleX: 0.7,
                duration: barDuration,
              });
            } else {
              gsap.to(line1Ref, {
                scaleX: 0.7,
                duration: barDuration,
              });
              gsap.to(line3Ref, {
                scaleX: 0.7,
                duration: barDuration,
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
                duration: barDuration,
              });
              gsap.to(line3Ref, {
                rotation: "45",
                scaleX: 1,
                duration: barDuration,
              });
            } else {
              gsap.to(line1Ref, { scaleX: 1, duration: barDuration });
              gsap.to(line3Ref, { scaleX: 1, duration: barDuration });
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
        <div class="btn-content font-formula-bold">
          <div class="btn-text text-[1em]">
            <Show when={!isMenuOpen()}>
              <TextAnimation
                originalColor="rgba(0, 21, 20, 1)"
                duplicateColor="rgba(0, 21, 20, 1)"
                text="MENU"
                externalTrigger={externalTrigger()}
                textStyle="pt-[0.2em] leading-[0.86em] tracking-wide"
              />
            </Show>
            <Show when={isMenuOpen()}>
              <TextAnimation
                originalColor="rgba(0, 21, 20, 1)"
                duplicateColor="rgba(0, 21, 20, 1)"
                text="CLOSE"
                externalTrigger={externalTrigger()}
                textStyle="pt-[0.2em] leading-[0.86em] tracking-wide"
              />
            </Show>
          </div>
        </div>
      </button>
    </div>
  );
}
