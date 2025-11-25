import { useNavigate } from "@solidjs/router";
import gsap from "gsap";
import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { useLenis } from "~/context/LenisContext";

// --- Constants & Configuration ---
const SELECTORS = {
	COLUMNS: ".column2",
	NAV_BAR: ".main-nav-bar",
	SECTIONS: "main section",
	LINKS: {
		PRODUCT: 'a[href="/product"]',
		SERVICES: 'a[href="/services"]',
		ABOUT: 'a[href="/about"]',
		CONTACT: 'a[href="/contact"]',
		LOGO: 'a[href="/"]',
	},
};

const COLORS = {
	GRAY: "text-gray",
	LIGHT: "text-light",
	DARK: "text-dark",
	DARKGRAY: "text-darkgray",
};

const DEFAULT_LINK_COLORS = {
	originalClass: COLORS.GRAY,
	duplicateClass: COLORS.LIGHT,
};

const DARK_LINK_COLORS = {
	originalClass: COLORS.DARKGRAY,
	duplicateClass: COLORS.DARK,
};

// --- Types ---
interface NavElements {
	links: (HTMLElement | undefined)[];
	logo: HTMLElement | undefined;
}

interface LinkPosition {
	x: number;
	width: number;
}

interface ColorState {
	originalClass: string;
	duplicateClass: string;
}

interface PageTransitionContextType {
	triggerTransition: (
		href: string,
		navElements?: NavElements,
		linkPositions?: LinkPosition[],
		onMenuHide?: () => void,
	) => void;
	setNavLinkColors: (colors: ColorState[]) => void;
	navLinkColors: () => ColorState[];
	logoColor: () => string;
	setLogoColor: (color: string) => void;
	setupNavTriggers: () => () => void;
	setSetupNavTriggers: (callback: () => void) => void;
	setKillScrollTriggers: (callback: () => void) => void;
	setMenuClosedCallback: (callback: () => void) => void;
	isVisible: () => boolean;
	isPreloaderFinished: () => boolean;
	setIsPreloaderFinished: (value: boolean) => void;
	setHeroRevealCallback: (el: HTMLElement, callback: () => void) => void;
	heroRevealConfig: () => { el: HTMLElement; callback: () => void } | null;
}

const PageTransitionContext = createContext<PageTransitionContextType>();

// --- Helper Functions ---
const getNavElements = (): NavElements => {
	if (typeof document === "undefined") return { links: [], logo: undefined };

	const productLink = document.querySelector<HTMLElement>(
		SELECTORS.LINKS.PRODUCT,
	);
	const servicesLink = document.querySelector<HTMLElement>(
		SELECTORS.LINKS.SERVICES,
	);
	const aboutLink = document.querySelector<HTMLElement>(SELECTORS.LINKS.ABOUT);
	const contactLink = document.querySelector<HTMLElement>(
		SELECTORS.LINKS.CONTACT,
	);
	const logoEl = document.querySelector<HTMLElement>(SELECTORS.LINKS.LOGO);

	return {
		links: [productLink, servicesLink, aboutLink, contactLink].map(
			(el) => el || undefined,
		),
		logo: logoEl || undefined,
	};
};

const getLinkPositions = (elements: NavElements): LinkPosition[] => {
	return elements.links.map((el) => {
		if (!el) return { x: 0, width: 0 };
		const rect = el.getBoundingClientRect();
		return { x: rect.x, width: rect.width };
	});
};

export function PageTransitionProvider(props: { children: JSX.Element }) {
	const navigate = useNavigate();
	const lenis = useLenis();

	// State
	const [isVisible, setIsVisible] = createSignal(false);
	const [pendingNavigation, setPendingNavigation] = createSignal<string | null>(
		null,
	);
	const [navLinkColors, setNavLinkColors] = createSignal<ColorState[]>(
		Array(4).fill(DEFAULT_LINK_COLORS),
	);
	const [logoColor, setLogoColor] = createSignal(COLORS.GRAY);
	const [isPreloaderFinished, setIsPreloaderFinished] = createSignal(false);

	// Callbacks
	const [setupNavTriggers, setSetupNavTriggers] = createSignal<() => void>(
		() => {},
	);
	const [killScrollTriggers, setKillScrollTriggers] = createSignal<() => void>(
		() => {},
	);
	const [menuClosedCallback, setMenuClosedCallback] = createSignal<() => void>(
		() => {},
	);
	const [heroRevealConfig, setHeroRevealConfig] = createSignal<{
		el: HTMLElement;
		callback: () => void;
	} | null>(null);

	const setHeroRevealCallback = (el: HTMLElement, callback: () => void) => {
		setHeroRevealConfig({ el, callback });
	};

	const triggerTransition = (
		href: string,
		providedNavElements?: NavElements,
		providedLinkPositions?: LinkPosition[],
		onMenuHide?: () => void,
	) => {
		if (isVisible()) return;

		// 1. Prepare Elements & Data
		const navElements = providedNavElements || getNavElements();
		const linkPositions =
			providedLinkPositions || getLinkPositions(navElements);
		const columns = document.querySelectorAll(SELECTORS.COLUMNS);
		const navBar = document.querySelector(SELECTORS.NAV_BAR);

		if (!columns.length) {
			console.warn("Transition columns not found");
			navigate(href);
			return;
		}

		setPendingNavigation(href);
		setIsVisible(true);
		lenis?.stop();
		killScrollTriggers()();

		// 2. Pre-calculate static values for the animation loop
		const navBarRect = navBar?.getBoundingClientRect();
		const navBarTop = navBarRect?.top ?? 0;
		const navBarBottom = navBarRect?.bottom ?? 0;

		// 3. GSAP Timeline
		const tl = gsap.timeline({
			onComplete: () => {
				gsap.set(columns, { display: "none" });
				setIsVisible(false);
				setupNavTriggers()();
				const callback = menuClosedCallback();
				if (callback) callback();
			},
		});

		// --- ENTER ANIMATION (Slide Up) ---
		tl.set(columns, {
			clearProps: "display",
			y: "100vh",
			scaleX: 1.1,
			scaleY: 1.05,
			rotate: -6,
			transformOrigin: "100% 0%",
		});

		tl.to(columns, {
			y: "0%",
			rotate: 0,
			duration: 0.5,
			ease: "circ.inOut",
			stagger: 0.02,
			onComplete: () => {
				if (onMenuHide) onMenuHide();
			},
			onUpdate: () => {
				// Optimization: Skip if essential elements are missing
				if (!navBar) return;

				const currentColors = navLinkColors();
				const newColors = [...currentColors];
				let colorsChanged = false;
				let currentLogoColor = logoColor();
				let logoChanged = false;

				// Check collisions
				columns.forEach((column) => {
					const colRect = column.getBoundingClientRect();

					// Only check if column is high enough to touch navbar
					if (colRect.top <= navBarTop) {
						// Check Links
						linkPositions.forEach((linkPos, index) => {
							if (
								linkPos.x < colRect.right &&
								linkPos.x + linkPos.width > colRect.left
							) {
								// Collision detected -> Reset to default colors
								if (
									JSON.stringify(newColors[index]) !==
									JSON.stringify(DEFAULT_LINK_COLORS)
								) {
									newColors[index] = DEFAULT_LINK_COLORS;
									colorsChanged = true;
								}
							}
						});

						// Check Logo
						if (navElements.logo) {
							const logoRect = navElements.logo.getBoundingClientRect();
							if (
								logoRect.x < colRect.right &&
								logoRect.x + logoRect.width > colRect.left
							) {
								if (currentLogoColor !== COLORS.GRAY) {
									currentLogoColor = COLORS.GRAY;
									logoChanged = true;
								}
							}
						}
					}
				});

				if (colorsChanged) setNavLinkColors(newColors);
				if (logoChanged) setLogoColor(currentLogoColor);
			},
		});

		// --- NAVIGATION & SCROLL RESET ---
		tl.add(() => {
			lenis?.lenis.scrollTo(0, { immediate: true });
		});

		tl.add(() => {
			const href = pendingNavigation();
			if (href) {
				navigate(href);
				setPendingNavigation(null);
			}
		});

		// --- EXIT ANIMATION (Slide Away) ---
		// Track hero reveal trigger state across frames
		let hasTriggeredReveal = false;

		tl.to(columns, {
			y: "-100vh",
			rotate: 6,
			transformOrigin: "100% 100%",
			duration: 0.5,
			ease: "circ.inOut",
			stagger: 0.02,
			onStart: () => {
				// Reset hero text animation state when starting exit animation
				const heroConfig = heroRevealConfig();
				if (heroConfig) {
					const { el } = heroConfig;
					const wordAnims = el.querySelectorAll(".word-anim");
					gsap.set(wordAnims, {
						y: "115%",
						rotation: 12,
						transformOrigin: "0% 0%",
					});
				}
			},
			onUpdate: () => {
				if (!navBar) return;

				// Determine target colors based on the new page's first section
				const sections = document.querySelectorAll(SELECTORS.SECTIONS);
				let targetLinkColors = DEFAULT_LINK_COLORS;
				let targetLogoColor = COLORS.GRAY;

				// Find the first visible section at the top
				for (const section of sections) {
					const rect = section.getBoundingClientRect();
					// We check if the section is at the top of the viewport
					if (rect.top <= 1 && rect.bottom > 0) {
						if (section.classList.contains("bg-light")) {
							targetLinkColors = DARK_LINK_COLORS;
							targetLogoColor = COLORS.DARKGRAY;
						}
						break; // Found the top section
					}
				}

				const currentColors = navLinkColors();
				const newColors = [...currentColors];
				let colorsChanged = false;
				let currentLogoColor = logoColor();
				let logoChanged = false;

				columns.forEach((column) => {
					const colRect = column.getBoundingClientRect();

					// Only check if column is still covering the navbar
					if (colRect.bottom <= navBarBottom) {
						// Check Links
						linkPositions.forEach((linkPos, index) => {
							if (
								linkPos.x < colRect.right &&
								linkPos.x + linkPos.width > colRect.left
							) {
								// Collision detected (column passing *up* past link) -> Change to target color
								if (
									JSON.stringify(newColors[index]) !==
									JSON.stringify(targetLinkColors)
								) {
									newColors[index] = targetLinkColors;
									colorsChanged = true;
								}
							}
						});

						// Check Logo
						if (navElements.logo) {
							const logoRect = navElements.logo.getBoundingClientRect();
							if (
								logoRect.x < colRect.right &&
								logoRect.x + logoRect.width > colRect.left
							) {
								if (currentLogoColor !== targetLogoColor) {
									currentLogoColor = targetLogoColor;
									logoChanged = true;
								}
							}
						}
					}
				});

				if (colorsChanged) setNavLinkColors(newColors);
				if (logoChanged) setLogoColor(currentLogoColor);

				// Check Hero Reveal
				const heroConfig = heroRevealConfig();
				if (heroConfig && !hasTriggeredReveal) {
					const { el, callback } = heroConfig;
					const elRect = el.getBoundingClientRect();
					let maxBottom = 0;
					columns.forEach((col) => {
						const rect = col.getBoundingClientRect();
						if (rect.bottom > maxBottom) maxBottom = rect.bottom;
					});

					if (maxBottom < elRect.top) {
						callback();
						hasTriggeredReveal = true;
					}
				}
			},
		});
	};

	return (
		<PageTransitionContext.Provider
			value={{
				triggerTransition,
				setNavLinkColors,
				navLinkColors,
				logoColor,
				setLogoColor,
				setupNavTriggers,
				setSetupNavTriggers,
				setKillScrollTriggers,
				setMenuClosedCallback,
				isVisible,
				isPreloaderFinished,
				setIsPreloaderFinished,
				setHeroRevealCallback,
				heroRevealConfig,
			}}
		>
			{props.children}
		</PageTransitionContext.Provider>
	);
}

export function usePageTransition() {
	const context = useContext(PageTransitionContext);
	if (!context) {
		throw new Error(
			"usePageTransition must be used within PageTransitionProvider",
		);
	}
	return context;
}
