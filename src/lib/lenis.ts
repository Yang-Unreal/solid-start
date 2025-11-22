import Lenis from "lenis";
import { isServer } from "solid-js/web";

let lenis: Lenis | undefined;

if (!isServer) {
	// lenis = new Lenis();
	//
	// const raf = (time: number) => {
	//   lenis!.raf(time);
	//   requestAnimationFrame(raf);
	// };
	//
	// requestAnimationFrame(raf);
}

export default lenis;
