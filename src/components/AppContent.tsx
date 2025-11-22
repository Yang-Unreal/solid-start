import gsap from "gsap/all";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type JSX, onMount, Suspense } from "solid-js";
import Header from "./Header";
import MenuDrawer from "./nav/MenuDrawer";
import Preloader from "./Preloader";

export function AppContent(props: { children: JSX.Element }) {
	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.registerPlugin(CustomEase);

		// Create custom easings
		CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");
		CustomEase.create("slideUp", "M0,0 C0.343,0.923 0.137,1.011 1,1 ");
	});

	return (
		<>
			<Preloader />
			<Header />
			<MenuDrawer />
			<main class="grow">
				<Suspense fallback={null}>{props.children}</Suspense>
			</main>
		</>
	);
}
