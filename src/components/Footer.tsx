import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import YourLogo from "./logo/YourLogo";

const Footer: Component = () => {
	return (
		<footer class="section section-footer" data-theme-section="light">
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
								"Were a marketing agency and audiovisual production company
								dedicated to offering all-encompassing services to help you
								stand out in the digital world."
							</p>
						</div>
						<div class="col-row"></div>
					</div>
				</div>
				<div class="row"></div>
				<div class="row"></div>
			</div>
		</footer>
	);
};

export default Footer;
