import { createContext, useContext } from "solid-js";
import Lenis from "lenis";
import { isServer } from "solid-js/web";

export const LenisContext = createContext<Lenis | undefined>();

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider(props: { children: any }) {
  let lenis: Lenis | undefined;
  if (!isServer) {
    lenis = new Lenis();

    function raf(time: number) {
      lenis!.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return (
    <LenisContext.Provider value={lenis}>
      {props.children}
    </LenisContext.Provider>
  );
}
