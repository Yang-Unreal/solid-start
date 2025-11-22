// src/context/LenisContext.tsx

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
	createContext,
	onCleanup,
	onMount,
	type ParentComponent,
	useContext,
} from "solid-js";
import { isServer } from "solid-js/web";

interface LenisContextValue {
	lenis: Lenis;
	start: () => void;
	stop: () => void;
}

// Extend Lenis type to include the isStopped property
interface LenisWithState extends Lenis {
	isStopped: boolean;
}

// Create the context with the new type
export const LenisContext = createContext<LenisContextValue | undefined>();

export function useLenis() {
	return useContext(LenisContext);
}

export const LenisProvider: ParentComponent = (props) => {
	let lenisContextValue: LenisContextValue | undefined;

	if (!isServer) {
		const instance = new Lenis({
			autoRaf: false,
		});

		const raf = (time: number) => {
			instance.raf(time * 1000);
		};

		const start = () => {
			instance.start();
			// Ensure we don't add duplicate listeners
			gsap.ticker.remove(raf);
			gsap.ticker.add(raf);
		};

		const stop = () => {
			instance.stop();
			gsap.ticker.remove(raf);
		};

		lenisContextValue = {
			lenis: instance,
			start,
			stop,
		};

		onMount(() => {
			// Connect GSAP ScrollTrigger
			instance.on("scroll", ScrollTrigger.update);

			// Start the ticker only if not already stopped (e.g. by a child component like Preloader)
			// We check the internal state of the Lenis instance.
			// Note: isStopped is a public property on the Lenis instance.
			if (!(instance as LenisWithState).isStopped) {
				gsap.ticker.add(raf);
			}
			gsap.ticker.lagSmoothing(0);
		});

		onCleanup(() => {
			// Clean up resources
			instance.destroy();
			gsap.ticker.remove(raf);
		});
	}

	return (
		<LenisContext.Provider value={lenisContextValue}>
			{props.children}
		</LenisContext.Provider>
	);
};
