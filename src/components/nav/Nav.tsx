// --- START OF FILE Nav.tsx ---

import { A, useIsRouting } from "@solidjs/router";
import { createEffect, onMount, For } from "solid-js";
import YourLogo from "~/components/logo/YourLogo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isServer } from "solid-js/web";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import { useMenu } from "~/context/MenuContext";
import NavLink from "./NavLink";

interface LinkConfig {
  href: string;
  label: string;
  hiddenOnMobile: boolean;
}

const LINKS: LinkConfig[] = [
  { href: "/product", label: "PRODUCT", hiddenOnMobile: false },
  { href: "/services", label: "SERVICES", hiddenOnMobile: true },
  { href: "/about", label: "ABOUT", hiddenOnMobile: true },
  { href: "/contact", label: "CONTACT", hiddenOnMobile: false },
];

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

  // Refs
  let logoRef: HTMLAnchorElement | undefined;
  const linkRefs: HTMLAnchorElement[] = new Array(LINKS.length);
  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    if (isServer || !isPreloaderFinished()) {
      return;
    }

    const sections = document.querySelectorAll("main section");
    if (sections.length === 0) return;

    const detectColors = () => {
      const currentLinkColors = navLinkColors();
      const newLinkColors = [...currentLinkColors];
      let linkColorsChanged = false;

      // Handle Nav Links
      linkRefs.forEach((link, index) => {
        if (!link) return;

        const linkRect = link.getBoundingClientRect();
        // Skip hidden elements
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
      if (logoRef) {
        const logoRect = logoRef.getBoundingClientRect();
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

        // Check for transition column overlap
        const columns = document.querySelectorAll(".column2");
        columns.forEach((column) => {
          const colRect = column.getBoundingClientRect();
          if (
            logoRect.x < colRect.right &&
            logoRect.x + logoRect.width > colRect.left
          ) {
            if (colRect.bottom > logoRect.top) {
              targetLogoColor = "text-gray";
            }
          }
        });

        if (logoColor() !== targetLogoColor) {
          setContextLogoColor(targetLogoColor);
        }
      }
    };

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (!isPreloaderFinished() || self.scroll() < 10) {
          return;
        }
        detectColors();
      },
      onRefresh: () => {
        if (!isPreloaderFinished()) {
          return;
        }
        detectColors();
      },
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

  // Note: Link animations (enter/exit) are now handled within NavLink component
  // But we still need to handle the Lenis control when menu opens
  createEffect(() => {
    if (isMenuOpen()) {
      lenisControls?.stop();
    } else {
      if (!isRouting()) {
        lenisControls?.start();
      }
    }
  });

  const handleTransition = (href: string, onMenuHide?: () => void) => {
    const navElements = {
      links: linkRefs,
      logo: logoRef,
    };

    const linkPositions = linkRefs.map((el) => {
      if (!el) return { x: 0, width: 0 };
      const rect = el.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });

    triggerTransition(href, navElements, linkPositions, onMenuHide);
  };

  const onLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isMenuOpen()) {
      handleTransition("/", () => {
        const menuContainer = document.querySelector(
          ".navigation-full"
        ) as HTMLElement;
        if (menuContainer) menuContainer.style.visibility = "hidden";
        setIsMenuOpen(false);
      });
    } else {
      handleTransition("/");
    }
  };

  return (
    <div class="main-nav-bar">
      <div class="w-full relative flex items-center justify-between">
        <nav class="w-full flex" aria-label="Navigation Desktop">
          <ul class="w-full font-formula-bold flex flex-row justify-between items-center overflow-hidden pointer-events-auto p-0 m-0">
            <For each={LINKS.slice(0, 2)}>
              {(link, i) => (
                <NavLink
                  {...link}
                  index={i()}
                  colorState={navLinkColors()[i()]}
                  isMenuOpen={isMenuOpen()}
                  onClick={(e, href) => handleTransition(href)}
                  ref={(el) => (linkRefs[i()] = el)}
                />
              )}
            </For>

            {/* LOGO */}
            <li class="relative flex items-center justify-center">
              <A
                ref={logoRef}
                href="/"
                aria-label="Homepage"
                title="Homepage"
                onClick={onLogoClick}
              >
                <YourLogo class={`h-auto w-[11em] ${logoColor()}`} />
              </A>
            </li>

            <For each={LINKS.slice(2)}>
              {(link, i) => (
                <NavLink
                  {...link}
                  index={i() + 2}
                  colorState={navLinkColors()[i() + 2]}
                  isMenuOpen={isMenuOpen()}
                  onClick={(e, href) => handleTransition(href)}
                  ref={(el) => (linkRefs[i() + 2] = el)}
                />
              )}
            </For>
          </ul>
        </nav>
      </div>
    </div>
  );
}