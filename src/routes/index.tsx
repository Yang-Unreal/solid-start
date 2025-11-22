// src/routes/index.tsx

import { onMount } from "solid-js";
import gsap from "gsap/all";

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
									<h1 class="h-1 text-light">
										<span class="block sm:inline">YOUR </span>
										<span class="relative overflow-hidden inline-block align-top">
											<span ref={gatewayRef} class="inline-block">
												GATEWAY
											</span>
											<span ref={partnerRef} class="absolute hidden left-0">
												PARTNER
											</span>
										</span>
										<br />
										<span class="block sm:inline">FOR CHINA </span>
										<span class="block sm:inline">SOURCING</span>
									</h1>
								</div>
								{/* <div class="absolute flex justify-between w-full bottom-[10%] px-3 lg:px-25 text-center font-formula-bold z-2">
          <div>
            <span class="text-sm xl:text-xl text-gray">LIMING AGENCY</span>
            <h4 class="text-xl xl:text-3xl text-light-white">
              ELIMINATE THE RISK
            </h4>
          </div>
          <div>
            <span class="text-sm xl:text-xl text-gray">SINCE 2015</span>
            <h4 class="text-xl xl:text-3xl text-light-white">
              WORKING GLOBALLY
            </h4>
          </div>
        </div> */}
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
