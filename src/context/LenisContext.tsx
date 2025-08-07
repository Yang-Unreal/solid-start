import { createContext, useContext } from "solid-js";
import type Lenis from "lenis";

export const LenisContext = createContext<Lenis | undefined>();

export function useLenis() {
  return useContext(LenisContext);
}
