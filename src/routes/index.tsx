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
        class="hero flex items-center justify-center relative text-light-white"
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
        <div class="absolute inset-0 bg-black opacity-30 -z-5"></div>
        <h1
          class="font-formula-bold leading-none text-[150px] absolute bottom-40 text-center"
          style="word-spacing: -0.12em;"
        >
          <span> THE BEST</span>
          <span class="relative overflow-hidden pl-5 inline-block align-top">
            <span>PARTNER</span>
            <span
              class="absolute top-5.5 left-5"
              style={`transform: translateY(80%) rotate(12deg); transform-origin: 0% 0%; 

              }`}
            >
              CHOICE
            </span>
          </span>
          <br />
          <span> FOR CHINA SOURCING</span>
        </h1>
      </section>

      <Footer />
    </main>
  );
}
