import { onMount, type Component } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import YourLogo from "./logo/YourLogo";
import MobileLogo from "./logo/MobileLogo";
import { usePageTransition } from "~/context/PageTransitionContext";

// Constants for animation timings and eases for better maintainability
const DURATION = {
  LOGO_REVEAL: 1,
  LOGO_SLIDE: 0.4,
  COPYRIGHT_FADE: 0.6,
  COLUMN_SLIDE: 0.6,
};

const EASE = {
  LOGO_REVEAL: "circ.inOut",
  LOGO_SLIDE: "circ.in",
  COPYRIGHT_FADE: "circ.inOut",
  COLUMN_SLIDE: "circ.inOut",
};

/**
 * A modern, production-ready preloader component for SolidJS applications.
 * It uses GSAP for a sophisticated animation sequence and ensures smooth
 * page transitions by coordinating with Lenis and PageTransition contexts.
 */
const Preloader: Component = () => {
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
  /**
   * Initializes and runs the entire preloader animation sequence.
   */
  const runEnterAnimation = () => {
    // Ensure all required DOM elements are available before starting the animation
    if (!preloaderRef || !logoContainerRef || !copyrightRef) {
      console.error("Preloader refs not found, aborting animation.");
      // Fallback to ensure the site is usable if refs are missing
      setIsPreloaderFinished(true);
      return;
    }

    const columns = preloaderRef.querySelectorAll<HTMLDivElement>(".column");
    const columns2 = preloaderRef.querySelectorAll<HTMLDivElement>(".column2");
    const grayLogo =
      logoContainerRef.querySelector<SVGSVGElement>("svg:first-child");
    const whiteLogo =
      logoContainerRef.querySelector<SVGSVGElement>("svg:last-child");

    if (
      !whiteLogo ||
      !grayLogo ||
      columns.length === 0 ||
      columns2.length === 0
    ) {
      console.error("Preloader animation targets not found, aborting.");
      // Fallback to ensure the site is usable if elements are missing
      setIsPreloaderFinished(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        setIsPreloaderFinished(true);
        // setupNavTriggers returns the actual setup function, which we then call.
        const setup = setupNavTriggers();
        if (setup) {
          setup();
        }
      },
    });

    // Stop user scrolling during the preloader animation
    lenis?.stop();
    lenis?.lenis.scrollTo(0, { immediate: true });

    // Build the animation timeline in a readable, chained manner
    tl.add(animateLogoReveal(whiteLogo))
      .add(animateLogoSlide(grayLogo, whiteLogo), "-=0.2")
      .add(animateCopyright(copyrightRef), "<")
      .add(
        animateColumns(columns, { y: "-100vh", rotate: -6, stagger: 0.03 }),
        "<0.2"
      )
      .add(
        animateColumns(columns2, {
          y: "-100vh",
          rotate: 6,
          stagger: 0.03,
          onUpdate: handleNavColorUpdate,
        }),
        ">-0.4"
      );
  };

  /**
   * Creates a GSAP animation for the logo reveal effect using clip-path.
   */
  const animateLogoReveal = (target: SVGSVGElement) => {
    gsap.set(target, { clipPath: "inset(0 100% 0 0)", visibility: "visible" });
    return gsap.to(target, {
      clipPath: "inset(0 0% 0 0)",
      duration: DURATION.LOGO_REVEAL,
      ease: EASE.LOGO_REVEAL,
    });
  };

  /**
   * Creates a GSAP animation for the logo slide-up and rotate effect.
   */
  const animateLogoSlide = (target1: SVGSVGElement, target2: SVGSVGElement) => {
    return gsap.to([target1, target2], {
      rotation: 2,
      transformOrigin: "100% 100%",
      y: "-100%",
      duration: DURATION.LOGO_SLIDE,
      ease: EASE.LOGO_SLIDE,
    });
  };

  /**
   * Creates a GSAP animation for the copyright section fade-out and scale effect.
   */
  const animateCopyright = (target: HTMLDivElement) => {
    return gsap.to(target, {
      scale: 0.9,
      opacity: 0,
      duration: DURATION.COPYRIGHT_FADE,
      ease: EASE.COPYRIGHT_FADE,
    });
  };

  const handleNavColorUpdate = () => {
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

    const columns2 = preloaderRef?.querySelectorAll(".column2");
    if (!columns2) return;

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
          linkRect.left < colRect.right && linkRect.right > colRect.left;
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
      let isCovered = false;

      columns2.forEach((column) => {
        const colRect = column.getBoundingClientRect();
        const isOverlappingHorizontally =
          logoRect.left < colRect.right && logoRect.right > colRect.left;

        // Check if column is overlapping horizontally AND still covering vertically (bottom is below logo top)
        if (
          isOverlappingHorizontally &&
          colRect.bottom > logoRect.top + logoRect.height
        ) {
          isCovered = true;
        }
      });

      if (!isCovered) {
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
      } else {
        targetLogoColor = "text-gray";
      }

      if (logoColor() !== targetLogoColor) {
        setLogoColor(targetLogoColor);
      }
    }
  };

  /**
   * Creates a GSAP animation for the columns sliding up to reveal the page.
   * @param targets - The column elements to animate.
   * @param vars - GSAP tween variables (y, rotate, stagger).
   */
  const animateColumns = (
    targets: NodeListOf<HTMLDivElement>,
    vars: gsap.TweenVars
  ) => {
    const { y, rotate, stagger, onUpdate } = vars;
    const isFirstSet = rotate === -6;

    gsap.set(targets, {
      scaleX: 1.1,
      scaleY: 1.05,
      transformOrigin: isFirstSet ? "0% 100%" : "100% 100%",
    });

    return gsap.to(targets, {
      y,
      rotate,
      duration: DURATION.COLUMN_SLIDE,
      ease: EASE.COLUMN_SLIDE,
      stagger,
      onUpdate,
    });
  };

  onMount(() => {
    // Ensure animation runs only on the client-side
    if (typeof window !== "undefined") {
      // Use requestAnimationFrame to ensure the DOM is painted before starting
      requestAnimationFrame(runEnterAnimation);
    }
  });

  return (
    <div
      ref={preloaderRef}
      class="preloader-root"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Background columns - First layer */}
      <div class="loading-container">
        <div class="column flex h-full w-full bg-dark rounded"></div>
        <div class="column flex h-full w-full bg-dark rounded"></div>
        <div class="column h-full w-full bg-dark rounded hidden sm:block"></div>
        <div class="column h-full w-full bg-dark rounded hidden sm:block"></div>

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
              <div class="flex border-b border-gray/25 justify-center items-center py-[0.3em] px-[0.35em] font-formula-bold uppercase">
                <h4 class="text-[1rem] leading-[1.1] tracking-[0.02em] text-nowrap text-center">
                  2025 © All rights reserved
                </h4>
              </div>
              <div class="flex justify-center items-center py-[0.4em] px-[0.3em] text-center overflow-hidden min-h-[1.72em]">
                <p class="text-[0.425em]">
                  LIMING is a Export Company specializing in Used Car Parallel
                  Exports from China.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition columns - Second layer that reveals the page */}
      <div class="transition-container">
        <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
        <div class="column2 flex h-full w-full bg-darkgray rounded"></div>
        <div class="column2 h-full w-full bg-darkgray rounded hidden sm:block"></div>
        <div class="column2 h-full w-full bg-darkgray rounded hidden sm:block"></div>
      </div>
    </div>
  );
};

export default Preloader;
