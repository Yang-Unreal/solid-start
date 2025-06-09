import type { Component } from "solid-js";

const HeroSection: Component = () => {
  return (
    <section class="hero-section flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div class="text-center p-4">
        <h1 class="text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
          SolidStart Performance
        </h1>
        <p class="mt-4 text-xl sm:text-2xl lg:text-3xl opacity-90">
          Optimized for speed and user experience.
        </p>
        <button class="mt-8 px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out">
          Learn More
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
