import type { Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="bg-black text-white py-12">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
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
              <a href="#" class="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" class="hover:underline">
                Services
              </a>
            </li>
            <li>
              <a href="#" class="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="#" class="hover:underline">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h2 class="text-lg font-bold mb-4">Follow Us</h2>
          <div class="flex justify-center md:justify-start space-x-4">
            <a href="#" class="hover:text-gray-400">
              Facebook
            </a>
            <a href="#" class="hover:text-gray-400">
              Twitter
            </a>
            <a href="#" class="hover:text-gray-400">
              Instagram
            </a>
            <a href="#" class="hover:text-gray-400">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div class="mt-8 pt-4 border-t border-gray-800 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} LIMING. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
