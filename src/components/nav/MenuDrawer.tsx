import { useLocation } from "@solidjs/router";
import gsap from "gsap";
import { createEffect, createSignal, For, onCleanup, onMount } from "solid-js";
import { useLenis } from "~/context/LenisContext";
import { useMenu } from "~/context/MenuContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import TextAnimation from "../TextAnimation";
import MenuImages from "./MenuImages";

const MenuDrawer = () => {
	const lenis = useLenis();
	const { triggerTransition, setLogoColor, isVisible, isPreloaderFinished } =
		usePageTransition();
	const { isMenuOpen, setIsMenuOpen } = useMenu();
	const location = useLocation();

	let menuContainer: HTMLDivElement | undefined;
	let addressRef: HTMLDivElement | undefined;
	let contactRef: HTMLDivElement | undefined;
	let currentTl: gsap.core.Timeline | undefined;

	const navLinks = [
		{ href: "/product", label: "PRODUCT", image: "/images/menu/PRODUCT.webp" },
		{
			href: "/services",
			label: "SERVICES",
			image: "/images/menu/SERVICES.webp",
		},
		{ href: "/about", label: "ABOUT", image: "/images/menu/ABOUT.webp" },
		{ href: "/contact", label: "CONTACT", image: "/images/menu/CONTACT.webp" },
	] as const;

	const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);
	const [activeIndex, setActiveIndex] = createSignal<number>(-1);
	const [hasHoveredOther, setHasHoveredOther] = createSignal(false);

	// Refs for animations
	const underlineRefs: (HTMLDivElement | undefined)[] = new Array(
		navLinks.length,
	).fill(undefined);
	const linkRefs: (HTMLLIElement | undefined)[] = new Array(
		navLinks.length,
	).fill(undefined);

	// Update active index based on route
	createEffect(() => {
		const index = navLinks.findIndex((link) => link.href === location.pathname);
		setActiveIndex(index);
	});

	// Initial setup
	onMount(() => {
		if (menuContainer) {
			gsap.set(menuContainer, { visibility: "hidden" });
			gsap.set(linkRefs, { y: "100%" });
			gsap.set([addressRef, contactRef], { y: "100%" });
		}
	});

	// Cleanup
	onCleanup(() => {
		if (currentTl) currentTl.kill();
	});

	// Main Open/Close Animation Logic
	createEffect(() => {
		const columns = menuContainer?.querySelectorAll(".column");
		if (!columns || !menuContainer) return;

		if (currentTl) currentTl.kill();

		if (isMenuOpen()) {
			// OPEN ANIMATION
			setHasHoveredOther(false);
			gsap.set(menuContainer, { visibility: "visible" });
			lenis?.stop();

			// Reset elements for animation
			gsap.set(columns, {
				scaleX: 1.1,
				scaleY: 1.05,
				rotate: -6,
				y: "100%",
				transformOrigin: "100% 0%",
			});

			// Set initial underline state
			underlineRefs.forEach((ref, i) => {
				if (ref) {
					gsap.set(ref, { scaleX: i === activeIndex() ? 1 : 0 });
				}
			});

			currentTl = gsap.timeline();

			// 1. Columns
			currentTl.to(columns, {
				y: "0%",
				rotate: 0,
				duration: 0.4,
				stagger: 0.02,
				ease: "circ.inOut",
			});

			// 2. Logo Color
			currentTl.add(() => {
				setLogoColor("text-gray");
			}, ">-0.1");

			// 3. Links
			currentTl.to(
				linkRefs,
				{
					y: "0%",
					rotation: 0,
					transformOrigin: "100% 0%",
					duration: 0.4,
					stagger: 0.05,
					ease: "back.out(1)",
				},
				"-=0.2",
			);

			// 4. Footer Info
			currentTl.to(
				[addressRef, contactRef],
				{
					y: "0%",
					rotation: 0,
					transformOrigin: "0% 0%",
					duration: 0.4,
					stagger: 0.05,
					ease: "back.out(1)",
				},
				"-=0.4",
			);
		} else {
			// CLOSE ANIMATION
			// Only animate if not transitioning to a new page (page transition handles its own exit)
			if (!isVisible()) {
				currentTl = gsap.timeline({
					onComplete: () => {
						if (isPreloaderFinished() && !isVisible()) {
							lenis?.start();
						}
						if (menuContainer)
							gsap.set(menuContainer, { visibility: "hidden" });
					},
				});

				// Reset Logo Color Logic
				const setLogoColorCallback = () => {
					const sections = document.querySelectorAll("main section");
					let found = false;
					sections.forEach((section) => {
						const rect = section.getBoundingClientRect();
						if (rect.top <= 0 && rect.bottom > 0) {
							if (section.classList.contains("bg-light")) {
								setLogoColor("text-darkgray");
							} else {
								setLogoColor("text-gray");
							}
							found = true;
						}
					});
					if (!found) setLogoColor("text-gray"); // Default fallback
				};
				currentTl.add(setLogoColorCallback, 0.1);

				// 1. Links & Footer (Simultaneous)
				currentTl.to(
					linkRefs,
					{
						y: "100%",
						rotation: -12,
						transformOrigin: "100% 0%",
						duration: 0.4,
						stagger: 0.05,
						ease: "back.out(1)",
					},
					0,
				);
				currentTl.to(
					[addressRef, contactRef],
					{
						y: "100%",
						rotation: 12,
						transformOrigin: "0% 0%",
						duration: 0.4,
						stagger: 0.05,
						ease: "back.out(1)",
					},
					0,
				);

				// 2. Columns
				currentTl.to(
					columns,
					{
						y: "100%",
						rotate: -6,
						duration: 0.4,
						stagger: 0.02,
						ease: "circ.inOut",
					},
					0,
				);
			} else {
				// If page transition is active, just hide immediately/reset
				if (menuContainer) gsap.set(menuContainer, { visibility: "hidden" });
				lenis?.start(); // Ensure scroll is back if we just closed without animation (rare case)
			}
		}
	});

	const handleLinkClick = (e: MouseEvent, href: string) => {
		e.preventDefault();
		triggerTransition(href, undefined, undefined, () => {
			if (menuContainer) {
				menuContainer.style.visibility = "hidden";
			}
			setIsMenuOpen(false);
		});
	};

	const handleMouseEnter = (index: number) => {
		setHoveredIndex(index);

		if (index !== activeIndex()) {
			setHasHoveredOther(true);
		}

		// Animate underlines
		underlineRefs.forEach((ref, i) => {
			if (ref) {
				gsap.to(ref, {
					scaleX: i === index ? 1 : 0,
					transformOrigin: i === index ? "0% 50%" : "100% 50%",
					duration: 0.3,
				});
			}
		});
	};

	const handleMouseLeave = (index: number) => {
		setHoveredIndex(null);

		const ref = underlineRefs[index];
		if (!ref) return;

		// If it's the active link and we haven't hovered other links yet, keep it visible
		if (index === activeIndex() && !hasHoveredOther()) {
			return;
		}

		gsap.to(ref, {
			scaleX: 0,
			transformOrigin: "100% 50%",
			duration: 0.3,
		});
	};

	return (
		<nav
			ref={menuContainer}
			aria-label="Navigation Overlay and Mobile"
			class="navigation-full"
		>
			{/* Background Columns */}
			<div class="column navigation-tile"></div>
			<div class="column navigation-tile"></div>
			<div class="column navigation-tile last"></div>
			<div class="column navigation-tile last"></div>

			{/* Image Container */}
			<MenuImages
				links={navLinks}
				activeLinkIndex={activeIndex()}
				hoveredLinkIndex={hoveredIndex()}
				isOpen={isMenuOpen()}
			/>

			{/* Foreground Text */}
			<ul class="navigation-center">
				<For each={navLinks}>
					{(item, index) => (
						<div class="link-wrap">
							<li
								class="link"
								ref={(el) => {
									linkRefs[index()] = el;
								}}
							>
								<a
									href={item.href}
									class="link-click"
									onClick={(e) => handleLinkClick(e, item.href)}
									onMouseEnter={() => handleMouseEnter(index())}
									onMouseLeave={() => handleMouseLeave(index())}
								>
									<div class="link-content">
										<TextAnimation
											originalClass="text-light"
											duplicateClass="text-light"
											text={item.label}
											externalTrigger={
												hoveredIndex() === index() ? "enter" : "leave"
											}
										/>
										<div
											ref={(el) => {
												underlineRefs[index()] = el;
											}}
											class="underline bg-light"
										></div>
									</div>
								</a>
							</li>
						</div>
					)}
				</For>
			</ul>

			<div class="navigation-bottom-usps">
				<div class="container large">
					<div class="col-row" ref={addressRef}>
						<span class="eyebrow inactive">Address</span>
						<h4 class="xxs">Taizhou, Zhejiang, China</h4>
					</div>
					<div class="col-row" ref={contactRef}>
						<span class="eyebrow inactive">CONTACT</span>
						<div class="link">
							<div class="link-content">
								<TextAnimation
									originalClass="text-gray"
									duplicateClass="text-light"
									text="yang@limingcn.com"
									isCopyable={true}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default MenuDrawer;
