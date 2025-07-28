// src/routes/index.tsx

import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main>
      <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <div class="min-h-screen bg-cover bg-center bg-[url('/heroBackground.webp')]"></div>
      <Footer />
    </main>
  );
}
