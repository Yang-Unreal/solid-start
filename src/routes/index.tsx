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
          src="https://minio.limingcn.com/solid-start/byd-3.webm"
          poster="https://minio.limingcn.com/solid-start/poster.webp"
        ></video>
      </section>

      <Footer />
    </main>
  );
}
