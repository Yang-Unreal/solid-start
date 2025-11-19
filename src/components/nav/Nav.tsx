// --- START OF FILE Nav.tsx ---

import { A, useIsRouting } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js";
import YourLogo from "~/components/logo/YourLogo";
import TextAnimation from "~/components/TextAnimation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isServer } from "solid-js/web";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import { useMenu } from "~/context/MenuContext";

export default function Nav() {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const lenisControls = useLenis();
  const isRouting = useIsRouting();
  const {
    triggerTransition,
    navLinkColors,
    setNavLinkColors: setContextNavLinkColors,
    logoColor,
    setLogoColor: setContextLogoColor,
    setSetupNavTriggers,
    setKillScrollTriggers,
    setMenuClosedCallback,
    isPreloaderFinished,
  } = usePageTransition();

  // Refs for animations
  let workUnderlineRef: HTMLDivElement | undefined;
  let servicesUnderlineRef: HTMLDivElement | undefined;
  let aboutUnderlineRef: HTMLDivElement | undefined;
  let contactUnderlineRef: HTMLDivElement | undefined;
  let productLinkRef: HTMLAnchorElement | undefined;
  let servicesLinkRef: HTMLAnchorElement | undefined;
  let aboutLinkRef: HTMLAnchorElement | undefined;
  let contactLinkRef: HTMLAnchorElement | undefined;
  let logoRef: HTMLAnchorElement | undefined;

  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    if (isServer || !isPreloaderFinished()) {
      return;
    }

    const sections = document.querySelectorAll("main section");
    if (sections.length === 0) return;

    const navElements = {
      links: [productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef],
      logo: logoRef,
    };

    /**
     * Extracted logic to detect colors.
     * This allows us to call it on scroll AND on window resize.
     */
    const detectColors = () => {
      const currentLinkColors = navLinkColors();
      const newLinkColors = [...currentLinkColors];
      let linkColorsChanged = false;

      // Handle Nav Links
      navElements.links.forEach((link, index) => {
        if (!link) return;
        
        // On mobile -> desktop resize, this rect changes from 0x0 to valid dimensions
        const linkRect = link.getBoundingClientRect();
        
        // If element is hidden (width/height 0), skip logic to preserve state or default
        if (linkRect.width === 0 && linkRect.height === 0) return;

        const currentColor = newLinkColors[index];
        if (!currentColor) return;

        let targetLinkColors = currentColor;
        let determinedColors = {
          originalClass: "text-gray",
          duplicateClass: "text-light",
        };
        let sectionFound = false;

        sections.forEach((section) => {
          if (sectionFound) return;
          const sectionRect = section.getBoundingClientRect();
          
          // Check intersection
          if (
            sectionRect.top < linkRect.bottom &&
            sectionRect.bottom > linkRect.top
          ) {
            if (section.classList.contains("bg-light")) {
              determinedColors = {
                originalClass: "text-darkgray",
                duplicateClass: "text-dark",
              };
            }
            sectionFound = true;
          }
        });
        targetLinkColors = determinedColors;

        if (
          JSON.stringify(newLinkColors[index]) !==
          JSON.stringify(targetLinkColors)
        ) {
          newLinkColors[index] = targetLinkColors;
          linkColorsChanged = true;
        }
      });

      if (linkColorsChanged) {
        setContextNavLinkColors(newLinkColors);
      }

      // Handle Logo
      if (navElements.logo) {
        const logoRect = navElements.logo.getBoundingClientRect();
        let targetLogoColor = logoColor();
        let determinedColor = "text-gray";
        let sectionFound = false;

        sections.forEach((section) => {
          if (sectionFound) return;
          const sectionRect = section.getBoundingClientRect();
          if (
            sectionRect.top < logoRect.bottom &&
            sectionRect.bottom > logoRect.top
          ) {
            if (section.classList.contains("bg-light")) {
              determinedColor = "text-darkgray";
            }
            sectionFound = true;
          }
        });
        targetLogoColor = determinedColor;

        if (logoColor() !== targetLogoColor) {
          setContextLogoColor(targetLogoColor);
        }
      }
    };

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      // 1. Runs when you scroll
      onUpdate: (self) => {
        if (!isPreloaderFinished() || self.scroll() < 10) {
          return;
        }
        detectColors();
      },
      // 2. Runs when you resize the window (Mobile -> Desktop)
      onRefresh: () => {
        if (!isPreloaderFinished()) {
            return;
        }
        detectColors();
      }
    });
    scrollTriggers.push(trigger);
  };

  createEffect(() => {
    if (isRouting()) {
      lenisControls?.stop();
    } else {
      lenisControls?.lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
      lenisControls?.start();
    }
  });

  onMount(() => {
    if (!isServer) {
      gsap.registerPlugin(ScrollTrigger);
      setSetupNavTriggers(() => setupNavTriggers);
      setKillScrollTriggers(() => () => {
        scrollTriggers.forEach((trigger) => trigger.kill());
        scrollTriggers = [];
      });
      setMenuClosedCallback(() => {
        ScrollTrigger.refresh();
      });
    }
  });

  createEffect(() => {
    if (isMenuOpen()) {
      lenisControls?.stop();
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "-100%",
        rotate: -12,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });
    } else {
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
    }
  });

  const handleTransition = (href: string, onMenuHide?: () => void) => {
    const navElements = {
      links: [productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef],
      logo: logoRef,
    };

    const linkPositions = navElements.links.map((el) => {
      if (!el) return { x: 0, width: 0 };
      const rect = el.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });

    triggerTransition(href, navElements, linkPositions, onMenuHide);
  };

  return (
    <div class="main-nav-bar">
      <div class="w-full relative flex items-center justify-between">
        <nav class="w-full flex" aria-label="Navigation Desktop">
          <ul class="w-full font-formula-bold flex flex-row justify-between items-center overflow-hidden pointer-events-auto p-0 m-0  ">
            {/* PRODUCT LINK */}
            <li class="relative">
              <A
                ref={productLinkRef}
                href="/product"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/product");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(workUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(workUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={
                    navLinkColors()[0]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    navLinkColors()[0]?.duplicateClass ?? "text-light"
                  }
                  text="PRODUCT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={workUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    navLinkColors()[0]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* SERVICES LINK */}
            <li class="relative">
              <A
                ref={servicesLinkRef}
                href="/services"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/services");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={
                    navLinkColors()[1]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    navLinkColors()[1]?.duplicateClass ?? "text-light"
                  }
                  text="SERVICES"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={servicesUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    navLinkColors()[1]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* LOGO */}
            <li class="relative flex items-center justify-center">
              <A
                ref={logoRef}
                href="/"
                aria-label="Homepage"
                title="Homepage"
                onClick={(e) => {
                  e.preventDefault();
                  if (isMenuOpen()) {
                    handleTransition("/", () => {
                      const menuContainer = document.querySelector(
                        ".navigation-full"
                      ) as HTMLElement;
                      if (menuContainer) menuContainer.style.display = "none";
                      setIsMenuOpen(false);
                    });
                  } else {
                    handleTransition("/");
                  }
                }}
              >
                <YourLogo class={`h-auto w-[11em] ${logoColor()}`} />
              </A>
            </li>
            {/* ABOUT LINK */}
            <li class="relative">
              <A
                ref={aboutLinkRef}
                href="/about"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/about");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={
                    navLinkColors()[2]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    navLinkColors()[2]?.duplicateClass ?? "text-light"
                  }
                  text="ABOUT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={aboutUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    navLinkColors()[2]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* CONTACT LINK */}
            <li class="relative">
              <A
                ref={contactLinkRef}
                href="/contact"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/contact");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={
                    navLinkColors()[3]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    navLinkColors()[3]?.duplicateClass ?? "text-light"
                  }
                  text="CONTACT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={contactUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    navLinkColors()[3]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}