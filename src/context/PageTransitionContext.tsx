import { createContext, createSignal, useContext } from "solid-js";
import gsap from "gsap";
import { useNavigate } from "@solidjs/router";
import { useLenis } from "~/context/LenisContext";

interface PageTransitionContextType {
  triggerTransition: (
    href: string,
    navElements?: {
      links: (HTMLElement | undefined)[];
      logo: HTMLElement | undefined;
    },
    linkPositions?: { x: number; width: number }[],
    onMenuHide?: () => void
  ) => void;
  setNavLinkColors: (
    colors: { originalClass: string; duplicateClass: string }[]
  ) => void;
  navLinkColors: () => { originalClass: string; duplicateClass: string }[];
  logoColor: () => string;
  setLogoColor: (color: string) => void;
  setupNavTriggers: () => () => void;
  setSetupNavTriggers: (callback: () => void) => void;
  setKillScrollTriggers: (callback: () => void) => void;
  setMenuClosedCallback: (callback: () => void) => void;
  setMenuVisibility: (callback: () => void) => void;
  isVisible: () => boolean;
  isPreloaderFinished: () => boolean;
  setIsPreloaderFinished: (value: boolean) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>();

export function PageTransitionProvider(props: { children: any }) {
  const navigate = useNavigate();
  const lenis = useLenis();
  const [isVisible, setIsVisible] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<string | null>(
    null
  );
  const [navLinkColors, setNavLinkColors] = createSignal(
    Array(4).fill({
      originalClass: "text-gray",
      duplicateClass: "text-light",
    })
  );
  const [logoColor, setLogoColor] = createSignal("text-gray");
  const [setupNavTriggers, setSetupNavTriggers] = createSignal<() => void>(
    () => {}
  );
  const [killScrollTriggers, setKillScrollTriggers] = createSignal<() => void>(
    () => {}
  );
  const [menuClosedCallback, setMenuClosedCallback] = createSignal<() => void>(
    () => {}
  );
  const [menuVisibility, setMenuVisibility] = createSignal<() => void>(
    () => {}
  );
  const [isPreloaderFinished, setIsPreloaderFinished] = createSignal(false);

  const triggerTransition = (
    href: string,
    navElements?: {
      links: (HTMLElement | undefined)[];
      logo: HTMLElement | undefined;
    },
    linkPositions?: { x: number; width: number }[],
    onMenuHide?: () => void
  ) => {
    if (isVisible()) return; // Prevent multiple transitions

    // Fallback to query DOM if elements are not provided
    if (!navElements || !linkPositions) {
      const productLink =
        document.querySelector<HTMLElement>('a[href="/product"]');
      const servicesLink = document.querySelector<HTMLElement>(
        'a[href="/services"]'
      );
      const aboutLink = document.querySelector<HTMLElement>('a[href="/about"]');
      const contactLink =
        document.querySelector<HTMLElement>('a[href="/contact"]');
      const logoEl = document.querySelector<HTMLElement>('a[href="/"]');

      const queriedLinks = [productLink, servicesLink, aboutLink, contactLink];

      navElements = {
        links: queriedLinks.map((el) => el || undefined),
        logo: logoEl || undefined,
      };

      linkPositions = queriedLinks.map((el) => {
        if (!el) return { x: 0, width: 0 };
        const rect = el.getBoundingClientRect();
        return { x: rect.x, width: rect.width };
      });
    }

    setPendingNavigation(href);
    setIsVisible(true);

    // Kill old scroll triggers before transition
    killScrollTriggers()();

    // Use the preloader columns for transition
    const columns = document.querySelectorAll(".column2");

    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        // Set up new triggers after transition completes
        setupNavTriggers()();
        // Call menu closed callback if set
        const callback = menuClosedCallback();
        if (callback) callback();
      },
    });

    // Set initial state
    tl.set(columns, {
      y: "100vh",
      scaleX: 1.1,
      scaleY: 1.05,
      rotate: -6,
      transformOrigin: "100% 0%",
    });

    // Start transition: columns slide from bottom (100vh) to cover (0%)
    tl.to(columns, {
      y: "0%",
      rotate: 0,
      duration: 0.5,
      ease: "circ.inOut",
      stagger: 0.02,
      onComplete: () => {
        // Call menu hide callback when columns reach 0%
        if (onMenuHide) onMenuHide();
      },
      onUpdate: function () {
        const navBar = document.querySelector(".main-nav-bar");
        if (!navBar || !navElements || !linkPositions) return;

        const navBarTop = navBar.getBoundingClientRect().top;
        const resetColors = {
          originalClass: "text-gray",
          duplicateClass: "text-light",
        };
        const resetLogoColor = "text-gray";

        const currentLinkColors = navLinkColors();
        const newLinkColors = [...currentLinkColors];
        let colorsChanged = false;

        columns.forEach((column) => {
          const colRect = column.getBoundingClientRect();
          if (colRect.top <= navBarTop) {
            // Check against nav links
            linkPositions.forEach((linkPos, index) => {
              if (
                linkPos.x < colRect.right &&
                linkPos.x + linkPos.width > colRect.left &&
                JSON.stringify(newLinkColors[index]) !==
                  JSON.stringify(resetColors)
              ) {
                newLinkColors[index] = resetColors;
                colorsChanged = true;
              }
            });

            // Check against logo
            if (navElements.logo && logoColor() !== resetLogoColor) {
              const logoRect = navElements.logo.getBoundingClientRect();
              if (
                logoRect.x < colRect.right &&
                logoRect.x + logoRect.width > colRect.left
              ) {
                setLogoColor(resetLogoColor);
              }
            }
          }
        });

        if (colorsChanged) {
          setNavLinkColors(newLinkColors);
        }
      },
    });

    // Scroll to top using Lenis
    tl.add(() => {
      lenis?.lenis.scrollTo(0, { immediate: true });
    });

    // Navigate to the new page
    tl.add(() => {
      if (pendingNavigation()) {
        navigate(pendingNavigation()!);
        setPendingNavigation(null);
      }
    });

    // Slide columns up to reveal the new page
    tl.to(columns, {
      y: "-100vh",
      rotate: 6,
      transformOrigin: "100% 100%",
      duration: 0.5,
      ease: "circ.inOut",
      stagger: 0.02,
      onUpdate: function () {
        const navBar = document.querySelector(".main-nav-bar");
        if (!navBar || !navElements) return;

        const navBarBottom = navBar.getBoundingClientRect().bottom;

        // Determine target colors from the new page's section
        const sections = document.querySelectorAll("main section");
        let targetLinkColors = {
          originalClass: "text-gray",
          duplicateClass: "text-light",
        };
        let targetLogoColor = "text-gray";
        let sectionFound = false;
        sections.forEach((section) => {
          if (sectionFound) return;
          const rect = section.getBoundingClientRect();
          if (rect.top <= 1 && rect.bottom > 0) {
            if (section.classList.contains("bg-light")) {
              targetLinkColors = {
                originalClass: "text-darkgray",
                duplicateClass: "text-dark",
              };
              targetLogoColor = "text-darkgray";
            }
            sectionFound = true;
          }
        });

        const currentLinkColors = navLinkColors();
        const newLinkColors = [...currentLinkColors];
        let colorsChanged = false;

        columns.forEach((column) => {
          const colRect = column.getBoundingClientRect();
          if (colRect.bottom <= navBarBottom) {
            // Check against nav links
            linkPositions.forEach((linkPos, index) => {
              if (
                linkPos.x < colRect.right &&
                linkPos.x + linkPos.width > colRect.left &&
                JSON.stringify(newLinkColors[index]) !==
                  JSON.stringify(targetLinkColors)
              ) {
                newLinkColors[index] = targetLinkColors;
                colorsChanged = true;
              }
            });

            // Check against logo
            if (navElements.logo && logoColor() !== targetLogoColor) {
              const logoRect = navElements.logo.getBoundingClientRect();
              if (
                logoRect.x < colRect.right &&
                logoRect.x + logoRect.width > colRect.left
              ) {
                setLogoColor(targetLogoColor);
              }
            }
          }
        });

        if (colorsChanged) {
          setNavLinkColors(newLinkColors);
        }
      },
    });
  };

  return (
    <PageTransitionContext.Provider
      value={{
        triggerTransition,
        setNavLinkColors,
        navLinkColors,
        logoColor,
        setLogoColor,
        setupNavTriggers,
        setSetupNavTriggers,
        setKillScrollTriggers,
        setMenuClosedCallback,
        setMenuVisibility,
        isVisible,
        isPreloaderFinished,
        setIsPreloaderFinished,
      }}
    >
      {props.children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider"
    );
  }
  return context;
}
