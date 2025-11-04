// src/components/Nav.tsx

import { A, useLocation, useNavigate, useIsRouting } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js";
import YourLogo from "~/components/logo/YourLogo";
import TextAnimation from "~/components/TextAnimation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isServer } from "solid-js/web";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";

interface NavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  setMenuButtonRef: (el: HTMLElement | undefined) => void;
}

export default function Nav(props: NavProps) {
  const navigate = useNavigate();
  const lenisControls = useLenis();
  const isRouting = useIsRouting();
  const { triggerTransition } = usePageTransition();

  // Refs for animations
  let workUnderlineRef: HTMLDivElement | undefined;
  let servicesUnderlineRef: HTMLDivElement | undefined;
  let aboutUnderlineRef: HTMLDivElement | undefined;
  let contactUnderlineRef: HTMLDivElement | undefined;
  let productLinkRef: HTMLAnchorElement | undefined;
  let servicesLinkRef: HTMLAnchorElement | undefined;
  let aboutLinkRef: HTMLAnchorElement | undefined;
  let contactLinkRef: HTMLAnchorElement | undefined;

  // Signals for dynamic colors
  const [navColors, setNavColors] = createSignal({
    originalColor: "rgba(192, 202, 201, 1)",
    duplicateColor: "rgba(241, 241, 241, 1)",
  });
  const [logoColorClass, setLogoColorClass] = createSignal("text-gray");

  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    if (isServer) return;

    const sections = document.querySelectorAll("main section");
    if (sections.length === 0) return;

    // Set initial colors based on the first section in view
    let initialSectionFound = false;
    sections.forEach((section) => {
      if (initialSectionFound) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) {
        if (section.classList.contains("bg-light")) {
          setNavColors({
            originalColor: "#182b2a",
            duplicateColor: "rgba(0, 21, 20, 1)",
          });
          setLogoColorClass("text-darkgray");
        } else {
          setNavColors({
            originalColor: "rgba(192, 202, 201, 1)",
            duplicateColor: "rgba(241, 241, 241, 1)",
          });
          setLogoColorClass("text-gray");
        }
        initialSectionFound = true;
      }
    });

    // Create new triggers
    sections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 60px",
        end: "bottom 60px",
        onToggle: (self) => {
          if (self.isActive) {
            if (section.classList.contains("bg-light")) {
              setNavColors({
                originalColor: "#182b2a",
                duplicateColor: "rgba(0, 21, 20, 1)",
              });
              setLogoColorClass("text-darkgray");
            } else {
              setNavColors({
                originalColor: "rgba(192, 202, 201, 1)",
                duplicateColor: "rgba(241, 241, 241, 1)",
              });
              setLogoColorClass("text-gray");
            }
          }
        },
      });
      scrollTriggers.push(trigger);
    });
  };

  // Master effect to control navigation lifecycle
  createEffect(() => {
    if (isRouting()) {
      // Navigation has started. Stop the animation loop.
      lenisControls?.stop();
    } else {
      // Navigation has finished.
      // 1. Force scroll to top while Lenis is stopped.
      lenisControls?.lenis.scrollTo(0, { immediate: true });

      // 2. Kill all old scroll triggers.
      scrollTriggers.forEach((trigger) => trigger.kill());
      scrollTriggers = [];

      // 3. Wait for the next browser paint cycle.
      setTimeout(() => {
        if (isServer) return;

        // 4. Force GSAP to re-read the DOM.
        ScrollTrigger.refresh();

        // 5. Set up new triggers for the current page.
        setupNavTriggers();

        // 6. Give scrolling control back to the user.
        lenisControls?.start();
      }, 50);
    }
  });

  onMount(() => {
    if (!isServer) {
      gsap.registerPlugin(ScrollTrigger);
      // Run on initial page load
      setTimeout(() => {
        ScrollTrigger.refresh();
        setupNavTriggers();
      }, 100);
    }
  });

  // Effect for menu drawer to prevent conflicts
  createEffect(() => {
    if (props.isMenuOpen) {
      lenisControls?.stop();
      setLogoColorClass("text-gray");
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "-100%",
        rotate: -12,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });
    } else {
      // Only start Lenis if not in the middle of a route change.
      if (!isRouting()) {
        lenisControls?.start();
      }
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "0%",
        rotate: 0,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });

      // Reset logo color based on current section
      const sections = document.querySelectorAll("main section");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          if (section.classList.contains("bg-light")) {
            setLogoColorClass("text-darkgray");
          } else {
            setLogoColorClass("text-gray");
          }
        }
      });
    }
  });

  return (
    <nav class={`fixed w-full z-200 transition-all duration-200`}>
      <div class={`relative flex bg-transparent text-white`}>
        <div class="font-formula-bold text-2xl leading-none flex justify-between items-center nav overflow-hidden">
          <div class="overflow-hidden">
            <A
              ref={productLinkRef}
              href="/product"
              class="relative text-xl xl:text-2xl block"
              onClick={(e) => {
                e.preventDefault();
                triggerTransition("/product");
              }}
              onMouseEnter={() => {
                if (!props.isMenuOpen)
                  gsap.to(workUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
              }}
              onMouseLeave={() => {
                if (!props.isMenuOpen)
                  gsap.to(workUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
              }}
            >
              <TextAnimation
                originalColor={navColors().originalColor}
                duplicateColor={navColors().duplicateColor}
                text="PRODUCT"
              />
              <div
                ref={workUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px scale-x-0"
                style={{ "background-color": navColors().originalColor }}
              ></div>
            </A>
          </div>
          <div class="overflow-hidden">
            <A
              ref={servicesLinkRef}
              href="/services"
              class="relative text-xl xl:text-2xl hidden md:block"
              onClick={(e) => {
                e.preventDefault();
                triggerTransition("/services");
              }}
              onMouseEnter={() => {
                if (!props.isMenuOpen)
                  gsap.to(servicesUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
              }}
              onMouseLeave={() => {
                if (!props.isMenuOpen)
                  gsap.to(servicesUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
              }}
            >
              <TextAnimation
                originalColor={navColors().originalColor}
                duplicateColor={navColors().duplicateColor}
                text="SERVICES"
              />
              <div
                ref={servicesUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px scale-x-0"
                style={{ "background-color": navColors().originalColor }}
              ></div>
            </A>
          </div>
          <A
            href="/"
            aria-label="Homepage"
            title="Homepage"
            onClick={(e) => {
              if (props.isMenuOpen) {
                e.preventDefault();
                props.setIsMenuOpen(false);
                navigate("/");
              } else {
                e.preventDefault();
                triggerTransition("/");
              }
            }}
          >
            <YourLogo
              class={`h-4 xl:h-5 w-auto transition-colors duration-300 ${logoColorClass()}`}
            />
          </A>
          <div class="overflow-hidden">
            <A
              ref={aboutLinkRef}
              href="/about"
              class="relative text-xl xl:text-2xl hidden md:block"
              onClick={(e) => {
                e.preventDefault();
                triggerTransition("/about");
              }}
              onMouseEnter={() => {
                if (!props.isMenuOpen)
                  gsap.to(aboutUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
              }}
              onMouseLeave={() => {
                if (!props.isMenuOpen)
                  gsap.to(aboutUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
              }}
            >
              <TextAnimation
                originalColor={navColors().originalColor}
                duplicateColor={navColors().duplicateColor}
                text="ABOUT"
              />
              <div
                ref={aboutUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px scale-x-0"
                style={{ "background-color": navColors().originalColor }}
              ></div>
            </A>
          </div>
          <div class="overflow-hidden">
            <A
              ref={contactLinkRef}
              href="/contact"
              class="relative text-xl xl:text-2xl block"
              onClick={(e) => {
                e.preventDefault();
                triggerTransition("/contact");
              }}
              onMouseEnter={() => {
                if (!props.isMenuOpen)
                  gsap.to(contactUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
              }}
              onMouseLeave={() => {
                if (!props.isMenuOpen)
                  gsap.to(contactUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
              }}
            >
              <TextAnimation
                originalColor={navColors().originalColor}
                duplicateColor={navColors().duplicateColor}
                text="CONTACT"
              />
              <div
                ref={contactUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px scale-x-0"
                style={{ "background-color": navColors().originalColor }}
              ></div>
            </A>
          </div>
        </div>
      </div>
    </nav>
  );
}
