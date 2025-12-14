import { A } from "@solidjs/router";
import gsap from "gsap";
import { type Component, createSignal } from "solid-js";
import YourLogo from "./logo/YourLogo";
import TextAnimation from "./TextAnimation";

type TriggerState = "enter" | "leave" | null;

const Footer: Component = () => {
	const [externalTrigger, setExternalTrigger] =
		createSignal<TriggerState>(null);
	let iconRef: SVGSVGElement | undefined;

	const handleMouseEnter = () => {
		setExternalTrigger("enter");
		if (iconRef) {
			gsap.to(iconRef, {
				x: "-83.333%",
				duration: 1,
				ease: "steps(5)",
				repeat: -1,
			});
		}
	};

	const handleMouseLeave = () => {
		setExternalTrigger("leave");
		if (iconRef) {
			gsap.to(iconRef, {
				x: "0%",
				duration: 0,
				overwrite: true,
			});
		}
	};

	return (
		<footer class="section section-footer" data-theme-section="dark">
			<div class="container wide">
				<div class="row row-logo grid">
					<div class="col-logo">
						<div class="col-row">
							<p>Most trusted Chinese car supplier</p>
						</div>
						<div class="col-row">
							<YourLogo />
						</div>
					</div>
					<div class="col col-text styled-col">
						<div class="col-row col-row-text">
							<p>
								We're a marketing agency and audiovisual production company
								dedicated to offering all-encompassing services to help you
								stand out in the digital world.
							</p>
						</div>
						<div class="col-row col-row-btn">
							<div class="btn">
								<A
									href="/contact"
									class="btn-click"
									onMouseEnter={handleMouseEnter}
									onMouseLeave={handleMouseLeave}
								>
									<div class="btn-icon">
										<div class="icon-sprite">
											<svg
												ref={iconRef}
												width="144"
												height="24"
												viewBox="0 0 144 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												role="img"
												aria-labelledby="contactIconTitle"
											>
												<title id="contactIconTitle">Contact Us Icon</title>
												<path
													d="M102.5 6.5H113.5V17.5H102.5V6.5ZM111.718 15.7179V8.28207H104.282V15.7179H111.718Z"
													fill="black"
												/>
												<path
													d="M30 12C30 8.70046 32.7005 6 36 6C39.2995 6 42 8.70046 42 12C42 15.2995 39.2995 18 36 18C32.7005 18 30 15.2995 30 12ZM40.1309 12C40.1309 9.73824 38.2618 7.86913 36 7.86913C33.7383 7.86913 31.8691 9.73824 31.8691 12C31.8691 14.2617 33.7383 16.1309 36 16.1309C38.2618 16.1309 40.1309 14.2617 40.1309 12Z"
													fill="black"
												/>
												<path
													d="M84.8248 13.9873V18H83.1752V13.9873L80.0625 17.1L78.8999 15.9375L82.0127 12.8248H78V11.1752H82.0127L78.8999 8.06247L80.0625 6.89995L83.1752 10.0127V6H84.8248V10.0127L87.9375 6.89995L89.1001 8.06247L85.9873 11.1752H90V12.8248H85.9873L89.1001 15.9375L87.9375 17.1L84.8248 13.9873Z"
													fill="black"
												/>
												<path
													d="M136.5 14.6138V17.5045L131.889 14.3058L127.5 17.5045V14.6138L131.889 11.5477L136.5 14.6138ZM136.5 9.56106V12.4731L131.889 9.27443L127.5 12.4731V9.56106L131.889 6.495L136.5 9.56106Z"
													fill="black"
												/>
												<path
													d="M59.6043 8.435V11.9362L57.3022 15.5638H55L57.3022 11.9362H55.9461V8.435H59.6065H59.6043ZM64.9978 8.435V11.9362L62.6957 15.5638H60.3935L62.6957 11.9362H61.3397V8.435H65H64.9978Z"
													fill="black"
												/>
												<path
													d="M10.1016 16.6517L8.36246 15.5498L10.2178 12.7367L7.1175 12.7367L7.57904 9.77938L10.9712 10.7932V7.345H13.0288V10.7952L16.421 9.78139L16.8825 12.7367L13.7822 12.7367L15.6075 15.5518L13.8684 16.6538L11.983 13.7545L10.0976 16.6538L10.1016 16.6517Z"
													fill="black"
												/>
											</svg>
										</div>
									</div>
									<div class="btn-content">
										<div class="btn-text">
											<TextAnimation
												originalClass="text-light"
												duplicateClass="text-light"
												text="CONTACT US"
												externalTrigger={externalTrigger()}
												textStyle="pt-[0.2em] leading-[0.86em] tracking-wide"
												asButton={false}
											/>
										</div>
									</div>
								</A>
							</div>
						</div>
					</div>
				</div>
				<div class="row row-links">
					<ul class="col col-sitemap"></ul> <ul class="col col-sitemap"></ul>
				</div>
				<div class="row"></div>
			</div>
		</footer>
	);
};

export default Footer;
