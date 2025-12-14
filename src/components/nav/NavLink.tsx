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
	let linkRef: HTMLAnchorElement | undefined;

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
	});

	return (
		<li class={`link ${props.hiddenOnMobile ? "fold" : ""}`}>
			<A
				ref={(el) => {
					linkRef = el;
					props.ref(el);
				}}
				href={props.href}
				class="link-click"
				onClick={(e) => {
					e.preventDefault();
					props.onClick(e, props.href);
				}}
			>
				<div
					class={`link-content ${props.colorState?.duplicateClass ?? "text-light"}`}
				>
					<TextAnimation
						originalClass={props.colorState?.originalClass ?? "text-gray"}
						duplicateClass={props.colorState?.duplicateClass ?? "text-light"}
						text={props.label}
					/>
				</div>
			</A>
		</li>
	);
}
