// src/routes/index.tsx

import gsap from "gsap/all";
import { onMount } from "solid-js";

import Footer from "~/components/Footer";

export default function Home() {
	let gatewayRef: HTMLSpanElement | undefined;
	let partnerRef: HTMLSpanElement | undefined;

	onMount(() => {
		const commonScrollTrigger = {
			trigger: ".hero",
			start: "top -1%",
			toggleActions: "play reverse play reverse",
			invalidateOnRefresh: true,
		};

		gsap.to(gatewayRef!, {
			y: "-100%",
			rotation: 12,
			transformOrigin: "100% 100%",
			duration: 0.6,
			ease: "circ.inOut",
			scrollTrigger: commonScrollTrigger,
		});

		gsap.fromTo(
			partnerRef!,
			{ y: "100%", rotation: 12, transformOrigin: "0% 0%" },
			{
				y: "0%",
				display: "inline",
				rotation: 0,
				transformOrigin: "0% 0%",
				duration: 0.6,
				ease: "circ.inOut",
				scrollTrigger: commonScrollTrigger,
			},
		);
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
										<span>
											<div>
												<div>YOUR</div>
											</div>
										</span>
										<span>
											<div>
												<div>YOUR</div>
											</div>
										</span>
									</h1>
								</div>
								<div class="col-row-usps">
									<div class="col-row-col">
										<span class="eyebrow text-gray">LIMING AGENCY</span>
										<h4 class="xxs text-light">ELIMINATE THE RISK</h4>
									</div>
									<div class="col-row-col">
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
