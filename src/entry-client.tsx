// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import Lenis from "lenis";

mount(() => {
  const lenis = new Lenis();

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return <StartClient />;
}, document.getElementById("app")!);
