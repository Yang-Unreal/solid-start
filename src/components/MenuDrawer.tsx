import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { animate } from "animejs";
import { A } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";

interface MenuDrawerProps {
  isVisible: boolean;
  onClose: () => void; // Add onClose prop
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false); // New signal for mobile detection

  // Function to close the drawer when a link is clicked
  const closeDrawer = () => {
    setIsOpen(false);
    // Do NOT call props.onClose here, as it would hide the button on mobile
  };

  // Function to toggle the drawer open/close state
  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };
  let menuButtonRef: HTMLButtonElement | undefined;
  let drawerRef: HTMLDivElement | undefined;
  // previousIsVisibleDesktop is only relevant for desktop scroll animation
  const [previousIsVisibleDesktop, setPreviousIsVisibleDesktop] = createSignal(
    props.isVisible
  );

  onMount(() => {
    if (!import.meta.env.SSR) {
      const mediaQuery = window.matchMedia("(max-width: 767px)"); // Tailwind's 'md' breakpoint is 768px
      setIsMobile(mediaQuery.matches);

      const handleMediaQueryChange = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      onCleanup(() => {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      });
    }
  });

  if (!import.meta.env.SSR) {
    createEffect(() => {
      if (menuButtonRef) {
        if (isMobile()) {
          // On mobile, ensure button is always visible. No animation based on props.isVisible.
          menuButtonRef.style.opacity = "1";
          menuButtonRef.style.transform = "scale(1)";
        } else {
          // On desktop, animate based on props.isVisible (scroll)
          if (props.isVisible) {
            animate(menuButtonRef, {
              opacity: [0, 1],
              scale: [0, 1],
              duration: 500,
              easing: "easeOutQuad",
            });
          } else if (previousIsVisibleDesktop()) {
            // Use desktop-specific previous state
            animate(menuButtonRef, {
              opacity: [1, 0],
              scale: [1, 0],
              duration: 500,
              easing: "easeOutQuad",
            });
          }
        }
      }
      // Update desktop-specific previous state only if not mobile
      if (!isMobile()) {
        setPreviousIsVisibleDesktop(props.isVisible);
      }
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

    // Effect to disable/enable scroll when drawer is open/closed
    createEffect(() => {
      const handleWheel = (event: WheelEvent) => {
        if (isOpen()) {
          event.preventDefault();
        }
      };

      if (isOpen()) {
        document.body.addEventListener("wheel", handleWheel, {
          passive: false,
        });
      } else {
        document.body.removeEventListener("wheel", handleWheel);
      }

      onCleanup(() => {
        document.body.removeEventListener("wheel", handleWheel);
      });
    });
  }

  return (
    <>
      <MagneticLink
        ref={(el) => (menuButtonRef = el)}
        onClick={toggleDrawer}
        class="fixed top-4 right-8 w-12 h-12 bg-black rounded-full shadow-lg z-101 flex flex-col justify-center items-center md:w-24 md:h-24"
        // Initial style: visible on mobile, invisible on desktop (to be animated)
        style={
          isMobile()
            ? "opacity: 1; transform: scale(1);"
            : "opacity: 0; transform: scale(0);"
        }
        aria-label="Toggle menu"
      >
        {(tx, ty, innerRef) => (
          <div ref={innerRef}>
            <div
              class="w-6 h-1 bg-white mb-1 md:w-10"
              style={`transform: translate(${tx}px, ${ty}px);`}
            ></div>
            <div
              class="w-6 h-1 bg-white md:w-10"
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
