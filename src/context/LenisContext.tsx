import { createContext, onMount, useContext } from "solid-js";
import Lenis from "lenis";
import { isServer } from "solid-js/web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const LenisContext = createContext<Lenis | undefined>();

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider(props: { children: any }) {
  let lenis: Lenis | undefined;

  onMount(() => {
    if (!isServer) {
      lenis = new Lenis();

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis!.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  });

  return (
    <LenisContext.Provider value={lenis}>
      {props.children}
    </LenisContext.Provider>
  );
}
