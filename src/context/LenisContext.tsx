// src/context/LenisContext.tsx

import { createContext, onMount, useContext } from "solid-js";
import Lenis from "lenis";
import { isServer } from "solid-js/web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Define a type for our context value for better type safety
interface LenisContextValue {
  lenis: Lenis;
  start: () => void;
  stop: () => void;
}

// Create the context with the new type
export const LenisContext = createContext<LenisContextValue | undefined>();

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider(props: { children: any }) {
  let lenisInstance: LenisContextValue | undefined;

  if (!isServer) {
    const instance = new Lenis({ autoRaf: false });

    // Define the ticker function separately so we can add/remove it by reference
    const raf = (time: number) => {
      instance.raf(time * 1000);
    };

    // Create the robust control functions
    const start = () => {
      instance.start();
      gsap.ticker.add(raf);
    };

    const stop = () => {
      instance.stop();
      gsap.ticker.remove(raf);
    };

    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    // Build the object that our context will provide
    lenisInstance = {
      lenis: instance,
      start,
      stop,
    };
  }

  onMount(() => {
    // Start the animation loop when the component mounts
    lenisInstance?.start();
  });

  return (
    <LenisContext.Provider value={lenisInstance}>
      {props.children}
    </LenisContext.Provider>
  );
}
