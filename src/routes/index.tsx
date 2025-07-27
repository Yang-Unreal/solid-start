// src/routes/index.tsx

import { onMount, onCleanup } from "solid-js";
import Footer from "~/components/Footer";
import { useHeroVisibility } from "~/context/HeroVisibilityContext";

export default function Home() {
  const { setHeroVisible } = useHeroVisibility();
  let heroRef: HTMLDivElement | undefined;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setHeroVisible(entry.isIntersecting);
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0.01, // Trigger when 1% of the hero is visible
      }
    );

    if (heroRef) {
      observer.observe(heroRef);
    }

    onCleanup(() => {
      if (heroRef) {
        observer.unobserve(heroRef);
      }
    });
  });

  return (
    <main>
      <div
        ref={heroRef}
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center bg-[url('/heroBackground.webp')]"
      ></div>

      <Footer />
    </main>
  );
}
