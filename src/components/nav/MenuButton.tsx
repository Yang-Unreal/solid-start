import {
	createSignal,
	Show,
	createEffect,
	onCleanup,
	batch,
	type Component,
} from "solid-js";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";
import { useMenu } from "~/context/MenuContext";

// ============================================================================
// Types
// ============================================================================

type TriggerState = "enter" | "leave" | null;

interface LineRefs {
	line1: HTMLDivElement;
	line2: HTMLDivElement;
	line3: HTMLDivElement;
}

// ============================================================================
// Constants & Configuration
// ============================================================================

const ANIMATION_CONFIG = {
	duration: 0.3,
	ease: "power2.inOut",
} as const;

const HAMBURGER_STATE = {
	line1: { rotation: 0, y: "-250%", scaleX: 1 },
	line2: { scaleX: 1 },
	line3: { rotation: 0, y: "250%", scaleX: 1 },
} as const;

const CLOSE_STATE = {
	line1: { rotation: -135, y: "0%", scaleX: 1 },
	line2: { scaleX: 0 },
	line3: { rotation: -45, y: "0%", scaleX: 1 },
} as const;

const HOVER_SCALE = 0.7;

// ============================================================================
// Animation Helpers
// ============================================================================

/**
 * Animates the menu button lines to the hamburger state
 */
function animateToHamburger(refs: LineRefs): void {
	const { line1, line2, line3 } = refs;

	gsap.to(line1, {
		...HAMBURGER_STATE.line1,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
		transformOrigin: "center",
	});

	gsap.to(line2, {
		...HAMBURGER_STATE.line2,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
	});

	gsap.to(line3, {
		...HAMBURGER_STATE.line3,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
		transformOrigin: "center",
	});
}

/**
 * Animates the menu button lines to the close (X) state
 */
function animateToClose(refs: LineRefs): void {
	const { line1, line2, line3 } = refs;

	gsap.to(line1, {
		...CLOSE_STATE.line1,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
		transformOrigin: "center",
	});

	gsap.to(line2, {
		...CLOSE_STATE.line2,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
	});

	gsap.to(line3, {
		...CLOSE_STATE.line3,
		duration: ANIMATION_CONFIG.duration,
		ease: ANIMATION_CONFIG.ease,
		transformOrigin: "center",
	});
}

/**
 * Handles hover enter animation
 */
function handleHoverEnter(refs: Partial<LineRefs>, isOpen: boolean): void {
	const { line1, line3 } = refs;
	if (!line1 || !line3) return;

	if (isOpen) {
		gsap.to(line1, {
			rotation: -135,
			scaleX: HOVER_SCALE,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
		gsap.to(line3, {
			rotation: -45,
			scaleX: HOVER_SCALE,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
	} else {
		gsap.to([line1, line3], {
			scaleX: HOVER_SCALE,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
	}
}

/**
 * Handles hover leave animation
 */
function handleHoverLeave(refs: Partial<LineRefs>, isOpen: boolean): void {
	const { line1, line3 } = refs;
	if (!line1 || !line3) return;

	if (isOpen) {
		gsap.to(line1, {
			rotation: -45,
			scaleX: 1,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
		gsap.to(line3, {
			rotation: 45,
			scaleX: 1,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
	} else {
		gsap.to([line1, line3], {
			scaleX: 1,
			duration: ANIMATION_CONFIG.duration,
			ease: ANIMATION_CONFIG.ease,
		});
	}
}

/**
 * Validates that all line refs are available
 */
function validateRefs(refs: Partial<LineRefs>): refs is LineRefs {
	return Boolean(refs.line1 && refs.line2 && refs.line3);
}

// ============================================================================
// Component
// ============================================================================

const MenuButton: Component = () => {
	// Context
	const { isMenuOpen, setIsMenuOpen, setMenuButtonRef } = useMenu();

	// Local refs
	let line1Ref: HTMLDivElement | undefined;
	let line2Ref: HTMLDivElement | undefined;
	let line3Ref: HTMLDivElement | undefined;

	// Local state
	const [externalTrigger, setExternalTrigger] =
		createSignal<TriggerState>(null);

	// ============================================================================
	// Effects & Lifecycle
	// ============================================================================

	/**
	 * Animate menu state changes (hamburger ↔ close)
	 */
	createEffect(() => {
		const refs = { line1: line1Ref, line2: line2Ref, line3: line3Ref };

		if (!validateRefs(refs)) return;

		if (isMenuOpen()) {
			animateToClose(refs);
		} else {
			animateToHamburger(refs);
		}
	});

	/**
	 * Cleanup GSAP animations on unmount
	 */
	onCleanup(() => {
		if (line1Ref) gsap.killTweensOf(line1Ref);
		if (line2Ref) gsap.killTweensOf(line2Ref);
		if (line3Ref) gsap.killTweensOf(line3Ref);
	});

	// ============================================================================
	// Event Handlers
	// ============================================================================

	const handleClick = () => {
		setIsMenuOpen(!isMenuOpen());
	};

	const handleMouseEnter = () => {
		batch(() => {
			setExternalTrigger("enter");
			handleHoverEnter({ line1: line1Ref, line3: line3Ref }, isMenuOpen());
		});
	};

	const handleMouseLeave = () => {
		batch(() => {
			setExternalTrigger("leave");
			handleHoverLeave({ line1: line1Ref, line3: line3Ref }, isMenuOpen());
		});
	};

	const handleButtonRef = (el: HTMLButtonElement) => {
		setMenuButtonRef(el);
	};

	// ============================================================================
	// Render
	// ============================================================================

	return (
		<div class="btn-hamburger">
			<button
				ref={handleButtonRef}
				onClick={handleClick}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				class="btn-click"
				aria-label={isMenuOpen() ? "Close menu" : "Open menu"}
				aria-expanded={isMenuOpen()}
			>
				{/* Icon */}
				<div class="btn-icon">
					<div class="hamburger">
						<div ref={line1Ref} class="bar before line1" />
						<div ref={line2Ref} class="bar line2" />
						<div ref={line3Ref} class="bar after line3" />
					</div>
				</div>

				{/* Text Label */}
				<div class="btn-content font-formula-bold">
					<div class="btn-text text-[1em]">
						<Show when={!isMenuOpen()}>
							<TextAnimation
								originalClass="text-dark"
								duplicateClass="text-dark"
								text="MENU"
								externalTrigger={externalTrigger()}
								textStyle="pt-[0.2em] leading-[0.86em] tracking-wide"
							/>
						</Show>
						<Show when={isMenuOpen()}>
							<TextAnimation
								originalClass="text-dark"
								duplicateClass="text-dark"
								text="CLOSE"
								externalTrigger={externalTrigger()}
								textStyle="pt-[0.2em] leading-[0.86em] tracking-wide"
							/>
						</Show>
					</div>
				</div>
			</button>
		</div>
	);
};

export default MenuButton;
