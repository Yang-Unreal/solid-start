import { A } from "@solidjs/router";
import type { Component } from "solid-js";

const Footer: Component = () => {
	return (
		<footer class="relative bg-dark text-gray  p-0">
			<div class="container-padding">
				<div class=" grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
					{/* Company Info */}
					<div>
						<h2 class="text-lg font-bold mb-4">LIMING</h2>
						<p class="text-sm">Let the hidden pearls shine for the world.</p>
					</div>

					{/* Quick Links */}
					<div>
						<h2 class="text-lg font-bold mb-4">Quick Links</h2>
						<ul class="space-y-2 text-sm">
							<li>
								<A href="/about" class="hover:underline">
									About
								</A>
							</li>
							<li>
								<A href="/services" class="hover:underline">
									Services
								</A>
							</li>
							<li>
								<A href="/products" class="hover:underline">
									Products
								</A>
							</li>
							<li>
								<A href="/contact" class="hover:underline">
									Contact
								</A>
							</li>
						</ul>
					</div>

					{/* Social Links */}
					<div>
						<h2 class="text-lg font-bold mb-4">Follow Us</h2>
						<div class="flex justify-center md:justify-start space-x-4">
							<a
								href="https://facebook.com"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-gray-400"
							>
								Facebook
							</a>
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-gray-400"
							>
								Twitter
							</a>
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-gray-400"
							>
								Instagram
							</a>
							<a
								href="https://linkedin.com"
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-gray-400"
							>
								LinkedIn
							</a>
						</div>
					</div>
				</div>
				<div class="mt-8 pt-4 border-t border-gray-800 text-center text-sm">
					<p>&copy; {new Date().getFullYear()} LIMING. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
