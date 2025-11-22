import gsap from "gsap/all";
import { createEffect, createSignal, Show } from "solid-js";

interface TextAnimationProps {
	text: string;
	class?: string;
	originalClass?: string;
	duplicateClass?: string;
	externalTrigger?: "enter" | "leave" | null;
	navSlideTrigger?: "up" | "down" | null;
	isCopyable?: boolean;
	textStyle?: string;
	asButton?: boolean;
}

export default function TextAnimation(props: TextAnimationProps) {
	let originalRef: HTMLSpanElement | undefined;
	let duplicateRef: HTMLSpanElement | undefined;
	const [displayText, setDisplayText] = createSignal(props.text);
	const duration = 0.2;
	const animateEnter = () => {
		if (!originalRef || !duplicateRef) return;

		gsap.to(originalRef, {
			y: "-100%",
			rotation: -12,
			transformOrigin: "0% 100%",
			duration: duration,
			ease: "custom",
		});
		gsap.to(duplicateRef, {
			y: "0%",
			rotation: 0,
			transformOrigin: "100% 0%",
			duration: duration,
			ease: "custom",
		});
	};

	const animateLeave = () => {
		if (!originalRef || !duplicateRef) return;

		gsap.to(originalRef, {
			y: "0%",
			rotation: 0,
			transformOrigin: "0% 100%",
			duration: duration,
			ease: "custom",
		});
		gsap.to(duplicateRef, {
			y: "100%",
			rotation: -12,
			transformOrigin: "100% 0%",
			duration: duration,
			ease: "custom",
		});
	};

	const handleMouseEnter = () => {
		animateEnter();
	};

	const handleMouseLeave = () => {
		animateLeave();
		if (props.isCopyable) {
			setDisplayText(props.text);
		}
	};

	const handleClick = async () => {
		if (props.isCopyable) {
			try {
				await navigator.clipboard.writeText(props.text);
				setDisplayText("ADDED TO CLIPBOARD");
			} catch (err) {
				console.error("Failed to copy text: ", err);
			}
		}
	};

	createEffect(() => {
		if (props.externalTrigger === "enter") {
			animateEnter();
		} else if (props.externalTrigger === "leave") {
			animateLeave();
		}
	});

	createEffect(() => {
		if (!originalRef) return;

		if (props.navSlideTrigger === "up") {
			gsap.to(originalRef, {
				y: "-100%",
				rotation: -12,
				transformOrigin: "0% 0%",
				duration: 0.4,
				ease: "power3.inOut",
				delay: 0.1,
			});
		} else if (props.navSlideTrigger === "down") {
			gsap.to(originalRef, {
				y: "0%",
				rotation: 0,
				transformOrigin: "0% 0%",
				duration: 0.4,
				ease: "power3.inOut",
			});
		}
	});

	const isInteractive = props.isCopyable || props.asButton !== false;

	return (
		<Show
			when={isInteractive}
			fallback={
				<div class={`relative overflow-hidden ${props.class || ""}`}>
					<span
						ref={originalRef}
						class={`block ${props.textStyle} ${props.originalClass || ""}`}
					>
						{displayText()}
					</span>
					<span
						ref={duplicateRef}
						class={`absolute top-0 left-0 block ${props.textStyle} ${
							props.duplicateClass || ""
						}`}
						style={`transform: translateY(100%) rotate(-12deg); transform-origin: 100% 0%;`}
					>
						{displayText()}
					</span>
				</div>
			}
		>
			<button
				type="button"
				class={`relative overflow-hidden cursor-pointer ${props.class || ""}`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
			>
				<span
					ref={originalRef}
					class={`block ${props.textStyle} ${props.originalClass || ""}`}
				>
					{displayText()}
				</span>
				<span
					ref={duplicateRef}
					class={`absolute top-0 left-0 block ${props.textStyle} ${
						props.duplicateClass || ""
					}`}
					style={`transform: translateY(100%) rotate(-12deg); transform-origin: 100% 0%;`}
				>
					{displayText()}
				</span>
			</button>
		</Show>
	);
}
