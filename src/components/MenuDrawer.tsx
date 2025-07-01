import { createSignal, createEffect, onMount } from "solid-js";
import { animate } from "animejs";
import { A } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";

interface MenuDrawerProps {
  isVisible: boolean;
  onClose: () => void; // Add onClose prop
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  // Function to close the drawer
  const closeDrawer = () => {
    setIsOpen(false);
    props.onClose(); // Call the onClose prop
  };

  // Modify toggleDrawer to use closeDrawer if needed, or keep it separate
  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };
  let menuButtonRef: HTMLButtonElement | undefined;
  let drawerRef: HTMLDivElement | undefined;
  const [previousIsVisible, setPreviousIsVisible] = createSignal(
    props.isVisible
  );

  if (!import.meta.env.SSR) {
    createEffect(() => {
      if (menuButtonRef) {
        if (props.isVisible) {
          animate(menuButtonRef, {
            opacity: [0, 1],
            scale: [0, 1],
            duration: 500,
            easing: "easeOutQuad",
          });
        } else if (previousIsVisible()) {
          animate(menuButtonRef, {
            opacity: [1, 0],
            scale: [1, 0],
            duration: 500,
            easing: "easeOutQuad",
          });
        }
      }
      setPreviousIsVisible(props.isVisible);
    });

    createEffect(() => {
      if (drawerRef) {
        if (isOpen()) {
          animate(drawerRef, {
            translateX: ["100%", "0%"],
            duration: 300,
            easing: "easeOutQuad",
          });
        } else {
          drawerRef.style.transform = "translateX(100%)";
        }
      }
    });
  }

  return (
    <>
      <MagneticLink
        ref={(el) => (menuButtonRef = el)}
        onClick={toggleDrawer}
        class="fixed top-4 right-8 w-24 h-24 bg-black rounded-full shadow-lg z-101 flex flex-col justify-center items-center"
        style="opacity: 0; transform: scale(0);"
        aria-label="Toggle menu"
      >
        {(tx, ty, innerRef) => (
          <div ref={innerRef}>
            <div
              class="w-10 h-1 bg-white mb-1"
              style={`transform: translate(${tx}px, ${ty}px);`}
            ></div>
            <div
              class="w-10 h-1 bg-white"
              style={`transform: translate(${tx}px, ${ty}px);`}
            ></div>
          </div>
        )}
      </MagneticLink>

      <div
        ref={drawerRef}
        class="fixed top-0 right-0 h-full w-64 bg-gray-800 text-white shadow-xl z-100"
        style="transform: translateX(100%);"
      >
        <div class="p-4">
          <h2 class="text-xl font-bold mb-4">Navigation</h2>
          <ul>
            <li class="mb-2">
              <A
                href="/"
                class="block hover:text-blue-300"
                onClick={closeDrawer}
              >
                Home
              </A>
            </li>
            <li class="mb-2">
              <A
                href="/about"
                class="block hover:text-blue-300"
                onClick={closeDrawer}
              >
                About
              </A>
            </li>
            <li class="mb-2">
              <A
                href="/products"
                class="block hover:text-blue-300"
                onClick={closeDrawer}
              >
                Products
              </A>
            </li>
            <li class="mb-2">
              <A
                href="/services"
                class="block hover:text-blue-300"
                onClick={closeDrawer}
              >
                Services
              </A>
            </li>
            <li class="mb-2">
              <A
                href="/contact"
                class="block hover:text-blue-300"
                onClick={closeDrawer}
              >
                Contact
              </A>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
