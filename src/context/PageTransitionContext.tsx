import { createContext, createSignal, useContext } from "solid-js";
import gsap from "gsap";
import { useNavigate } from "@solidjs/router";

interface PageTransitionContextType {
  triggerTransition: (href: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>();

export function PageTransitionProvider(props: { children: any }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);
  const [pendingNavigation, setPendingNavigation] = createSignal<string | null>(
    null
  );

  // Function to trigger transition and navigation
  const triggerTransition = (href: string) => {
    if (isVisible()) return; // Prevent multiple transitions

    setPendingNavigation(href);
    setIsVisible(true);

    // Use the preloader columns for transition
    const columns = document.querySelectorAll(".column2");

    // Start transition: columns slide from bottom (100vh) to cover (0%)
    gsap.set(columns, {
      y: "100vh",
      scaleX: 1.1,
      scaleY: 1.05,
      rotate: -6,
      transformOrigin: "100% 0%",
    });
    gsap.to(columns, {
      y: "0%",
      rotate: 0,
      duration: 0.6,
      ease: "circ.inOut",
      stagger: 0.03,
      onComplete: () => {
        // After columns cover the screen, navigate to the new page
        if (pendingNavigation()) {
          navigate(pendingNavigation()!);
          setPendingNavigation(null);

          // Then slide columns up to reveal the new page
          gsap.to(columns, {
            y: "-100vh",
            rotate: 6,
            transformOrigin: "100% 100%",
            duration: 0.6,
            ease: "circ.inOut",
            stagger: 0.03,
            onComplete: () => {
              setIsVisible(false);
            },
          });
        }
      },
    });
  };

  return (
    <PageTransitionContext.Provider value={{ triggerTransition }}>
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
