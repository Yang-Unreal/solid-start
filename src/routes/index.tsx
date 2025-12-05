// src/routes/index.tsx

import gsap from "gsap/all";
import { onMount } from "solid-js";
import Footer from "~/components/Footer";
import { usePageTransition } from "~/context/PageTransitionContext";

export default function Home() {
	let gatewayRef: HTMLSpanElement | undefined;
	const { setHeroRevealCallback, isVisible } = usePageTransition();

	onMount(() => {
		if (!gatewayRef) return;

		const q = gsap.utils.selector(gatewayRef);

		if (isVisible()) {
			gsap.set(q(".word-anim"), {
				y: "115%",
				rotation: 12,
				transformOrigin: "0% 0%",
			});
			gsap.set(".usps-anim", {
				y: "100%",
			});
		}

		const uspsAnims = document.querySelectorAll(".usps-anim");

		setHeroRevealCallback(gatewayRef, () => {
			const tl = gsap.timeline();

			tl.fromTo(
				q(".word-anim"),
				{ y: "115%", rotation: 12, transformOrigin: "0% 0%" },
				{
					y: "0%",
					rotation: 0,
					transformOrigin: "0% 0%",
					duration: 1,
					stagger: 0.05,
					ease: "elastic.out(1,1)",
					overwrite: true,
				},
			);

			if (uspsAnims.length > 0) {
				tl.fromTo(
					uspsAnims,
					{ y: "100%" },
					{
						y: "0%",
						duration: 1,
						ease: "elastic.out(1,1)",
						overwrite: true,
					},
					"<",
				);
			}
		});
	});

	return (
		<main class="main">
			<div class="main-wrap">
				<section class="section default-header full-height section-home-header bg-dark">
					<div class="single-video-background">
						<video
							autoplay
							muted
							loop
							src="https://minio.limingcn.com/solid-start/byd-3.webm"
							poster="https://minio.limingcn.com/solid-start/poster-1.webp"
						></video>
						<div class="overlay bg-dark opacity-25"></div>
					</div>
					<div class="container large">
						<div class="row">
							<div class="col">
								<div class="col-row-title">
									<h1 class="h1 text-light">
										<span class="split-words" ref={gatewayRef}>
											{"Most Trusted".split(" ").map((word) => (
												<div class="single-word inline-block">
													<div class="word-anim single-word-inner">{word}</div>
												</div>
											))}
											<br />
											{"Chinese Car Supplier".split(" ").map((word) => (
												<div class="single-word inline-block">
													<div class="word-anim single-word-inner">{word}</div>
												</div>
											))}
										</span>
									</h1>
								</div>
								<div class="col-row-usps">
									<div class="col-row-col usps-anim">
										<span class="eyebrow text-gray">LICENSED EXPORTER</span>
										<h4 class="xxs text-light">ELIMINATE IMPORT RISKS</h4>
									</div>
									<div class="col-row-col usps-anim">
										<span class="eyebrow text-gray">SINCE 2015</span>
										<h4 class="xxs text-light">WORKING GLOBALLY</h4>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section class="h-screen bg-dark w-full"></section>
				<section class="h-screen bg-light w-full"></section>
				<Footer />
			</div>
		</main>
	);
}
