// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";

import Footer from "~/components/Footer";

export default function Home() {
  return (
    <main>
      <Title>Official LIMING Website | LIMING</Title>
      <Meta
        name="description"
        content="LIMING offers bespoke sourcing and product procurement from China. We simplify the process, eliminate risk, and offer the Apex Collection of curated products."
      />

      <section
        class="hero relative flex items-center justify-center text-white"
        style="height: 100dvh;"
      >
        <video
          autoplay
          muted
          loop
          class="absolute inset-0 w-full h-full object-cover -z-10"
          src="https://minio.limingcn.com/solid-start/gt2_pro.webm"
        ></video>
        <div class="text-center z-10">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 font-formula-bold">
            LIMING
          </h1>
          <p class="text-lg md:text-xl mb-8">
            Bespoke sourcing and product procurement from China
          </p>
          <a
            href="/services"
            class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
          >
            Explore Services
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
