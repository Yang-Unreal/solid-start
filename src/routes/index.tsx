// src/routes/index.tsx

import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main>
      <div
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center"
        style="background-image: url('/heroBackground.webp');"
      ></div>
      <div class="h-screen bg-white"></div>
      <div class="h-screen bg-white"></div>
      <Footer />
    </main>
  );
}
