import { A } from "@solidjs/router";
import gsap from "gsap";
import { createEffect, onCleanup } from "solid-js";
import TextAnimation from "~/components/TextAnimation";

interface ColorState {
	originalClass: string;
	duplicateClass: string;
}

interface NavLinkProps {
	href: string;
	label: string;
	index: number;
	colorState: ColorState | undefined;
	isMenuOpen: boolean;
	hiddenOnMobile?: boolean;
	onClick: (e: MouseEvent, href: string) => void;
	ref: (el: HTMLAnchorElement) => void;
}

export default function NavLink(props: NavLinkProps) {
	let underlineRef: HTMLDivElement | undefined;
	let linkRef: HTMLAnchorElement | undefined;

	// Handle hover animations
	const handleMouseEnter = () => {
		if (!props.isMenuOpen && underlineRef) {
			gsap.to(underlineRef, {
				scaleX: 1,
				transformOrigin: "0% 50%",
				duration: 0.3,
			});
		}
	};

	const handleMouseLeave = () => {
		if (!props.isMenuOpen && underlineRef) {
			gsap.to(underlineRef, {
				scaleX: 0,
				transformOrigin: "100% 50%",
				duration: 0.3,
			});
		}
	};

	// Handle menu open/close animations
	createEffect(() => {
		if (!linkRef) return;

		if (props.isMenuOpen) {
			gsap.to(linkRef, {
				y: "-100%",
				rotate: -12,
				transformOrigin: "0% 0%",
				duration: 0.4,
				ease: "power3.inOut",
				delay: props.index * 0.05,
			});
		} else {
			gsap.to(linkRef, {
				y: "0%",
				rotate: 0,
				transformOrigin: "0% 0%",
				duration: 0.4,
				ease: "power3.inOut",
				delay: props.index * 0.05,
			});
		}
	});

	onCleanup(() => {
		if (linkRef) gsap.killTweensOf(linkRef);
		if (underlineRef) gsap.killTweensOf(underlineRef);
	});

	return (
		<li class="link">
			<A
				ref={(el) => {
					linkRef = el;
					props.ref(el);
				}}
				href={props.href}
				class={`relative text-[1.25em] bg-transparent overflow-hidden ${
					props.hiddenOnMobile ? "hidden md:block" : "block"
				}`}
				onClick={(e) => {
					e.preventDefault();
					props.onClick(e, props.href);
				}}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<TextAnimation
					originalClass={props.colorState?.originalClass ?? "text-gray"}
					duplicateClass={props.colorState?.duplicateClass ?? "text-light"}
					text={props.label}
					textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
				/>
				<div
					ref={underlineRef}
					class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
						props.colorState?.duplicateClass ?? "text-light"
					).replace("text-", "bg-")}`}
				></div>
			</A>
		</li>
	);
}
