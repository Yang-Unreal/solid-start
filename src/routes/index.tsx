// src/routes/index.tsx

import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main>
      <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-[url('/heroBackground.webp')]">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <h1 class="absolute text-light-gray text-7xl md:text-[150px] font-formula-bold top-2/5 text-center leading-18 md:leading-35">
          CHINA SOURCING <br />
          SIMPLIFIED
        </h1>
        <div class="absolute flex h-auto w-full bottom-20 container-padding gap-10 ">
          <div class="w-1/3 items-center justify-center text-center text-white">
            <h1 class="text-lg md:text-3xl font-formula-bold">
              BESPOKE SOURCING
            </h1>
            <button class="border rounded-full px-5 py-2 text-sm mt-2">
              Start Your Sourcing Brief
            </button>
          </div>
          <div class="w-1/3 text-white text-center">
            <h1 class="text-lg md:text-3xl font-formula-bold">
              THE APEX COLLECTION
            </h1>
            <button class="border rounded-full px-5 py-2 text-sm mt-2">
              Browse Our Store
            </button>
          </div>
          <div class="w-1/3 text-white text-center ">
            <h1 class="text-lg md:text-3xl font-formula-bold">
              ELIMINATE RISK
            </h1>
            <button class="border rounded-full px-5 py-2 text-sm mt-2">
              Learn How We Protect You
            </button>
          </div>
        </div>
      </div>

      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen "></div>
      <Footer />
    </main>
  );
}
