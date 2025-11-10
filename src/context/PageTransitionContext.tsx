import { createContext, createSignal, useContext } from "solid-js";
import gsap from "gsap";
import { useNavigate } from "@solidjs/router";
import { useLenis } from "~/context/LenisContext";

interface PageTransitionContextType {
  triggerTransition: (href: string, onMenuHide?: () => void) => void;
  setNavColors: (colors: {
    originalColor: string;
    duplicateColor: string;
  }) => void;
  navColors: () => { originalColor: string; duplicateColor: string };
  logoColor: () => string;
  setLogoColor: (color: string) => void;
  setSetupNavTriggers: (callback: () => void) => void;
  setKillScrollTriggers: (callback: () => void) => void;
  setMenuClosedCallback: (callback: () => void) => void;
  setMenuVisibility: (callback: () => void) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>();

export function PageTransitionProvider(props: { children: any }) {
  const navigate = useNavigate();
  const lenis = useLenis();
  const [isVisible, setIsVisible] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<string | null>(
    null
  );
  const [navColors, setNavColors] = createSignal({
    originalColor: "rgba(192, 202, 201, 1)",
    duplicateColor: "rgba(241, 241, 241, 1)",
  });
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

  // Function to trigger transition and navigation
  const triggerTransition = (href: string, onMenuHide?: () => void) => {
    if (isVisible()) return; // Prevent multiple transitions

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

    // Set nav colors to gray during transition 0.02s before columns reach 0%

    // Start transition: columns slide from bottom (100vh) to cover (0%)
    tl.to(columns, {
      y: "0%",
      rotate: 0,
      duration: 0.6,
      ease: "circ.inOut",
      stagger: 0.03,
      onComplete: () => {
        // Call menu hide callback when columns reach 0%
        if (onMenuHide) onMenuHide();
      },
    });

    tl.add(() => {
      setNavColors({
        originalColor: "rgba(192, 202, 201, 1)",
        duplicateColor: "rgba(241, 241, 241, 1)",
      });
      setLogoColor("text-gray");
    }, ">-0.2");

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
      duration: 0.6,
      ease: "circ.inOut",
      stagger: 0.03,
    });

    // Reset nav colors and logo color to be dynamic again after transition
    tl.add(() => {
      if (typeof window !== "undefined") {
        const sections = document.querySelectorAll("main section");
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 0 && rect.bottom > 0) {
            if (section.classList.contains("bg-light")) {
              setNavColors({
                originalColor: "#182b2a",
                duplicateColor: "rgba(0, 21, 20, 1)",
              });
              setLogoColor("text-darkgray");
            } else {
              setNavColors({
                originalColor: "rgba(192, 202, 201, 1)",
                duplicateColor: "rgba(241, 241, 241, 1)",
              });
              setLogoColor("text-gray");
            }
          }
        });
      }
    }, ">-0.2");

    // For menu transitions, set colors 0.2s before columns move to -100%
    if (onMenuHide) {
      tl.add(() => {
        if (typeof window !== "undefined") {
          const sections = document.querySelectorAll("main section");
          sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom > 0) {
              if (section.classList.contains("bg-light")) {
                setNavColors({
                  originalColor: "#182b2a",
                  duplicateColor: "rgba(0, 21, 20, 1)",
                });
                setLogoColor("text-darkgray");
              } else {
                setNavColors({
                  originalColor: "rgba(192, 202, 201, 1)",
                  duplicateColor: "rgba(241, 241, 241, 1)",
                });
                setLogoColor("text-gray");
              }
            }
          });
        }
      }, ">-0.2");
    }
  };

  return (
    <PageTransitionContext.Provider
      value={{
        triggerTransition,
        setNavColors,
        navColors,
        logoColor,
        setLogoColor,
        setSetupNavTriggers,
        setKillScrollTriggers,
        setMenuClosedCallback,
        setMenuVisibility,
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
