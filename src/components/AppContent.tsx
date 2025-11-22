import { Suspense, onMount } from "solid-js";
import Header from "./Header";
import MenuDrawer from "./nav/MenuDrawer";
import Preloader from "./Preloader";
import gsap from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

export function AppContent(props: { children: any }) {
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
