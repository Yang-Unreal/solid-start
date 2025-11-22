import { onMount, onCleanup, type Component, For } from "solid-js";
import gsap from "gsap";
import { useLenis } from "~/context/LenisContext";
import YourLogo from "./logo/YourLogo";
import MobileLogo from "./logo/MobileLogo";
import { usePageTransition } from "~/context/PageTransitionContext";

// Animation constants
const DURATION = {
	LOGO_REVEAL: 1,
	LOGO_SLIDE: 0.4,
	COPYRIGHT_FADE: 0.6,
	COLUMN_SLIDE: 0.6,
};

const EASE = {
	LOGO_REVEAL: "circ.inOut",
	LOGO_SLIDE: "circ.in",
	COPYRIGHT_FADE: "circ.inOut",
	COLUMN_SLIDE: "circ.inOut",
};

const COLUMNS_CONFIG = [
	{ visibleMobile: true },
	{ visibleMobile: true },
	{ visibleMobile: false },
	{ visibleMobile: false },
];

/**
 * A modern, production-ready preloader component for SolidJS applications.
 * It uses GSAP for a sophisticated animation sequence and ensures smooth
 * page transitions by coordinating with Lenis and PageTransition contexts.
 */
const Preloader: Component = () => {
	let containerRef: HTMLDivElement | undefined;
	let logoContainerRef: HTMLDivElement | undefined;
	let copyrightRef: HTMLDivElement | undefined;

	const lenis = useLenis();
	const {
		setIsPreloaderFinished,
		setupNavTriggers,
		navLinkColors,
		setNavLinkColors,
		logoColor,
		setLogoColor,
	} = usePageTransition();

	// GSAP Context for proper cleanup
	let ctx: gsap.Context;

	onMount(() => {
		if (typeof window === "undefined") return;

		// Disable scrolling immediately when preloader mounts
		lenis?.stop();
		lenis?.lenis.scrollTo(0, { immediate: true });

		ctx = gsap.context(() => {
			// Select elements within the context of containerRef
			const columns = gsap.utils.toArray<HTMLDivElement>(".column");
			const columns2 = gsap.utils.toArray<HTMLDivElement>(".column2");
			const grayLogo =
				logoContainerRef?.querySelector<SVGSVGElement>("svg:first-child");
			const whiteLogo =
				logoContainerRef?.querySelector<SVGSVGElement>("svg:last-child");

			if (
				!whiteLogo ||
				!grayLogo ||
				columns.length === 0 ||
				columns2.length === 0 ||
				!copyrightRef
			) {
				console.warn("Preloader: Animation targets not found, skipping.");
				setIsPreloaderFinished(true);
				return;
			}

			// Cache navigation elements for performance optimization during animation loop
			const navLinks = [
				document.querySelector('a[href="/product"]'),
				document.querySelector('a[href="/services"]'),
				document.querySelector('a[href="/about"]'),
				document.querySelector('a[href="/contact"]'),
			].filter((el): el is HTMLAnchorElement => !!el);

			const navLogo = document.querySelector('a[href="/"]');
			const sections = document.querySelectorAll("main section");

			const tl = gsap.timeline({
				onComplete: () => {
					gsap.set([...columns, ...columns2], { display: "none" });
					lenis?.start();
					setIsPreloaderFinished(true);
					// Initialize nav triggers after preloader finishes
					const setup = setupNavTriggers();
					setup?.();
				},
			});

			// Animation Sequence
			tl.add(animateLogoReveal(whiteLogo))
				.add(animateLogoSlide(grayLogo, whiteLogo), "-=0.2")
				.add(animateCopyright(copyrightRef), "<")
				.add(
					animateColumns(columns, { y: "-100vh", rotate: -6, stagger: 0.03 }),
					"<0.2",
				)
				.add(
					animateColumns(columns2, {
						y: "-100vh",
						rotate: 6,
						stagger: 0.03,
						onUpdate: () => {
							// Run color update logic on every frame of the column reveal
							handleNavColorUpdate(navLinks, navLogo, sections, columns2);
						},
					}),
					">-0.4",
				);
		}, containerRef);
	});

	onCleanup(() => {
		ctx?.revert();
	});

	// --- Animation Helpers ---

	const animateLogoReveal = (target: SVGSVGElement) => {
		gsap.set(target, { clipPath: "inset(0 100% 0 0)", visibility: "visible" });
		return gsap.to(target, {
			clipPath: "inset(0 0% 0 0)",
			duration: DURATION.LOGO_REVEAL,
			ease: EASE.LOGO_REVEAL,
		});
	};

	const animateLogoSlide = (target1: SVGSVGElement, target2: SVGSVGElement) => {
		return gsap.to([target1, target2], {
			rotation: 2,
			transformOrigin: "100% 100%",
			y: "-100%",
			duration: DURATION.LOGO_SLIDE,
			ease: EASE.LOGO_SLIDE,
		});
	};

	const animateCopyright = (target: HTMLDivElement) => {
		return gsap.to(target, {
			scale: 0.9,
			opacity: 0,
			duration: DURATION.COPYRIGHT_FADE,
			ease: EASE.COPYRIGHT_FADE,
		});
	};

	const animateColumns = (targets: HTMLDivElement[], vars: gsap.TweenVars) => {
		const { y, rotate, stagger, onUpdate } = vars;
		const isFirstSet = rotate === -6;

		gsap.set(targets, {
			scaleX: 1.1,
			scaleY: 1.05,
			transformOrigin: isFirstSet ? "0% 100%" : "100% 100%",
		});

		return gsap.to(targets, {
			y,
			rotate,
			duration: DURATION.COLUMN_SLIDE,
			ease: EASE.COLUMN_SLIDE,
			stagger,
			onUpdate,
		});
	};

	// --- Logic Helpers ---

	const handleNavColorUpdate = (
		navLinks: HTMLAnchorElement[],
		navLogo: Element | null,
		sections: NodeListOf<Element>,
		columns: HTMLDivElement[],
	) => {
		if (sections.length === 0) return;

		const currentLinkColors = navLinkColors();
		const newLinkColors = [...currentLinkColors];
		let linkColorsChanged = false;

		// 1. Update Nav Links
		navLinks.forEach((link, index) => {
			const linkRect = link.getBoundingClientRect();
			const currentColor = newLinkColors[index];
			if (!currentColor) return;

			let targetLinkColors = currentColor;
			let isCrossed = false;

			// Check if any column has revealed this link
			// "Revealed" means the column (moving up) has passed the link's vertical center
			for (const column of columns) {
				const colRect = column.getBoundingClientRect();
				const isOverlappingHorizontally =
					linkRect.left < colRect.right && linkRect.right > colRect.left;

				if (
					isOverlappingHorizontally &&
					colRect.bottom <= linkRect.top + linkRect.height / 2
				) {
					isCrossed = true;
					break; // Optimized: once crossed by one column, it's revealed
				}
			}

			if (isCrossed) {
				let determinedColors = {
					originalClass: "text-gray",
					duplicateClass: "text-light",
				};

				// Find which section is underneath the link
				for (const section of sections) {
					const sectionRect = section.getBoundingClientRect();
					if (
						sectionRect.top < linkRect.bottom &&
						sectionRect.bottom > linkRect.top
					) {
						if (section.classList.contains("bg-light")) {
							determinedColors = {
								originalClass: "text-darkgray",
								duplicateClass: "text-dark",
							};
						}
						break; // Found the section
					}
				}
				targetLinkColors = determinedColors;
			}

			if (
				JSON.stringify(newLinkColors[index]) !==
				JSON.stringify(targetLinkColors)
			) {
				newLinkColors[index] = targetLinkColors;
				linkColorsChanged = true;
			}
		});

		if (linkColorsChanged) {
			setNavLinkColors(newLinkColors);
		}

		// 2. Update Logo
		if (navLogo) {
			const logoRect = navLogo.getBoundingClientRect();
			let targetLogoColor = logoColor();
			let isCovered = false;

			for (const column of columns) {
				const colRect = column.getBoundingClientRect();
				const isOverlappingHorizontally =
					logoRect.left < colRect.right && logoRect.right > colRect.left;

				// Check if column is still covering the logo
				if (
					isOverlappingHorizontally &&
					colRect.bottom > logoRect.top + logoRect.height
				) {
					isCovered = true;
					break;
				}
			}

			if (!isCovered) {
				let determinedColor = "text-gray";
				for (const section of sections) {
					const sectionRect = section.getBoundingClientRect();
					if (
						sectionRect.top < logoRect.bottom &&
						sectionRect.bottom > logoRect.top
					) {
						if (section.classList.contains("bg-light")) {
							determinedColor = "text-darkgray";
						}
						break;
					}
				}
				targetLogoColor = determinedColor;
			} else {
				targetLogoColor = "text-gray";
			}

			if (logoColor() !== targetLogoColor) {
				setLogoColor(targetLogoColor);
			}
		}
	};

	return (
		<div
			ref={containerRef}
			class="preloader-root"
			aria-live="polite"
			aria-busy="true"
		>
			{/* Background columns - First layer */}
			<div class="loading-container">
				<For each={COLUMNS_CONFIG}>
					{(config) => (
						<div
							class={`column loading-screen ${
								config.visibleMobile ? "" : "last"
							}`}
						/>
					)}
				</For>

				<div ref={logoContainerRef} class="logo">
					<YourLogo class="h-auto w-full text-gray" />
					<YourLogo class="h-auto w-full text-light absolute invisible" />
				</div>

				<div ref={copyrightRef} class="copyright-row">
					<div class="copyright-visual">
						<div class="visual">
							<MobileLogo class="text-gray/25 w-10 h-auto" />
						</div>
						<div class="text">
							<div class="top">
								<h4 class="xxs">2025 © All rights reserved</h4>
							      </div>
							<div class="bottom">
								<p>
									LIMING is a Export Company specializing in Used Car Parallel
									Exports from China.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Transition columns - Second layer that reveals the page */}
			<div class="transition-container">
				<For each={COLUMNS_CONFIG}>
					{(config) => (
						<div
							class={`column2 transition-screen ${
								config.visibleMobile ? "" : "last"
							}`}
						/>
					)}
				</For>
			</div>
		</div>
	);
};

export default Preloader;
