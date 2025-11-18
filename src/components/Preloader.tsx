import { onMount } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import YourLogo from "./logo/YourLogo";
import MobileLogo from "./logo/MobileLogo";
import { usePageTransition } from "~/context/PageTransitionContext";

export default function Preloader() {
  let preloaderRef: HTMLDivElement | undefined;
  let logoContainerRef: HTMLDivElement | undefined;
  let copyrightRef: HTMLDivElement | undefined;
  const lenis = useLenis();
  const {
    setIsPreloaderFinished,
    setupNavTriggers,
    navLinkColors,
    setNavLinkColors,
    logoColor,
    setLogoColor,
  } = usePageTransition();

  onMount(() => {
    if (typeof window === "undefined") return;

    if (!preloaderRef || !logoContainerRef) return;
    lenis?.lenis.scrollTo(0);

    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        setIsPreloaderFinished(true);
        const setupFunc = setupNavTriggers();
        if (setupFunc) {
          setupFunc();
        }
      },
    });

    // Animate reveal from left to right using clip-path
    const whiteLogoRef = logoContainerRef?.querySelector(
      "svg:last-child"
    ) as SVGSVGElement;
    if (whiteLogoRef) {
      gsap.set(whiteLogoRef, {
        clipPath: "inset(0 100% 0 0)",
        visibility: "hidden",
      });
      tl.to(whiteLogoRef, {
        clipPath: "inset(0 0% 0 0)",
        visibility: "visible",
        duration: 1,
        ease: "circ.inOut",
      });
    }

    // Rotate and slide up logos
    const grayLogoRef = logoContainerRef?.querySelector(
      "svg:first-child"
    ) as SVGSVGElement;
    const whiteLogoRef2 = logoContainerRef?.querySelector(
      "svg:last-child"
    ) as SVGSVGElement;
    if (grayLogoRef && whiteLogoRef2) {
      tl.to([grayLogoRef, whiteLogoRef2], {
        rotation: 2,
        transformOrigin: "100% 100%",
        y: "-100%",
        duration: 0.4,
        ease: "circ.in",
      });
    }

    // Animate copyright container
    if (copyrightRef) {
      tl.to(
        copyrightRef,
        {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: "circ.inOut",
        },
        "<"
      );
    }

    // Animate columns slide up
    const columns = preloaderRef?.querySelectorAll(".column");
    if (columns) {
      gsap.set(columns, {
        scaleX: 1.1,
        scaleY: 1.05,
        transformOrigin: "0% 100%",
      });
      tl.to(
        columns,
        {
          y: "-100vh",
          rotate: -6,
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
        },
        "<0.2"
      );
    }

    // Animate second layer columns
    const columns2 = preloaderRef?.querySelectorAll(".column2");
    if (columns2) {
      gsap.set(columns2, {
        scaleX: 1.1,
        scaleY: 1.05,
        transformOrigin: "100% 100%",
      });
      tl.to(
        columns2,
        {
          y: "-100vh",
          rotate: 6,
          duration: 0.6,
          ease: "circ.inOut",
          stagger: 0.03,
          onUpdate: function () {
            const navElements = {
              links: [
                document.querySelector('a[href="/product"]'),
                document.querySelector('a[href="/services"]'),
                document.querySelector('a[href="/about"]'),
                document.querySelector('a[href="/contact"]'),
              ],
              logo: document.querySelector('a[href="/"]'),
            };

            const sections = document.querySelectorAll("main section");
            if (sections.length === 0) return;

            const currentLinkColors = navLinkColors();
            const newLinkColors = [...currentLinkColors];
            let linkColorsChanged = false;

            // Handle Nav Links
            navElements.links.forEach((link, index) => {
              if (!link) return;
              const linkRect = link.getBoundingClientRect();

              const currentColor = newLinkColors[index];
              if (!currentColor) return; // Fix for potential undefined
              let targetLinkColors = currentColor;

              let isCrossed = false;
              columns2.forEach((column) => {
                const colRect = column.getBoundingClientRect();
                const isOverlappingHorizontally =
                  linkRect.left < colRect.right &&
                  linkRect.right > colRect.left;
                if (
                  isOverlappingHorizontally &&
                  colRect.bottom <= linkRect.top + linkRect.height / 2 // Check against vertical center
                ) {
                  isCrossed = true;
                }
              });

              if (isCrossed) {
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
              }

              if (
                JSON.stringify(newLinkColors[index]) !==
                JSON.stringify(targetLinkColors)
              ) {
                newLinkColors[index] = targetLinkColors;
                linkColorsChanged = true;
              }
            });

            if (linkColorsChanged) {
              setNavLinkColors(newLinkColors);
            }

            // Handle Logo
            if (navElements.logo) {
              const logoRect = navElements.logo.getBoundingClientRect();
              let targetLogoColor = logoColor();
              let isCrossed = false;

              columns2.forEach((column) => {
                const colRect = column.getBoundingClientRect();
                const isOverlappingHorizontally =
                  logoRect.left < colRect.right &&
                  logoRect.right > colRect.left;
                if (
                  isOverlappingHorizontally &&
                  colRect.bottom <= logoRect.top + logoRect.height / 2 // Check against vertical center
                ) {
                  isCrossed = true;
                }
              });

              if (isCrossed) {
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
              }

              if (logoColor() !== targetLogoColor) {
                setLogoColor(targetLogoColor);
              }
            }
          },
        },
        ">-0.4"
      );
    }
  });

  return (
    <div ref={preloaderRef}>
      {/* Background columns */}
      <div class="loading-container">
        <div class="column flex h-full w-full bg-dark rounded"></div>
        <div class="column flex h-full w-full bg-dark rounded"></div>
        <div class="column h-full w-full bg-dark rounded hidden sm:block"></div>
        <div class="column  h-full w-full bg-dark rounded hidden sm:block"></div>
        <div ref={logoContainerRef} class="logo">
          <YourLogo class="h-auto w-full text-gray" />
          <YourLogo class="h-auto w-full text-light absolute invisible" />
        </div>
        <div ref={copyrightRef} class="copyright-row">
          <div class="copyright-visual">
            <div
              class="aspect-square h-full border border-gray/25 flex justify-center items-center"
              style="border-radius: 0 var(--border-radius) var(--border-radius) 0;"
            >
              <MobileLogo class="text-gray/25 w-10 h-auto" />
            </div>
            <div
              class="flex flex-col border border-gray/25 border-l-0 text-gray/25"
              style="border-radius: 0 var(--border-radius) var(--border-radius) 0;"
            >
              <div class="flex border-b border-gray/25  justify-center items-center py-[0.3em] px-[0.35em] font-formula-bold uppercase">
                <h4 class="text-[1rem] leading-[1.1] tracking-[0.02em] text-nowrap text-center">
                  2025 © All rights reserved
                </h4>
              </div>
              <div class="flex  justify-center items-center py-[0.4em] px-[0.3em] text-center overflow-hidden min-h-[1.72em]">
                <p class="text-[0.425em]">
                  LIMING is a Export Company specializing in Used Car Parallel
                  Exports from China.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="transition-container">
        <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
        <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
        <div class="column2 h-full w-full bg-darkgray rounded hidden sm:block"></div>
        <div class="column2 h-full w-full bg-darkgray rounded hidden sm:block"></div>
      </div>
    </div>
  );
}
