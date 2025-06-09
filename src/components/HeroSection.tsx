import type { Component } from "solid-js";

const HeroSection: Component = () => {
  return (
    <section class=" flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div class="text-center p-4">
        <h1 class="hero-heading  text-4xl font-bold tracking-tight md:text-6xl">
          Hello
        </h1>
        <p class="mt-4 text-lg md:text-xl text-white/80">
          This is a subtitle for the hero section.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
