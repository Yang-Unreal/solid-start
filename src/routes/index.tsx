// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";
import { onMount } from "solid-js";
import gsap from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "~/components/Footer";

export default function Home() {
  let supplierRef: HTMLSpanElement | undefined;
  let partnerRef: HTMLSpanElement | undefined;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    const commonScrollTrigger = {
      trigger: ".hero",
      start: "bottom 70%",
      toggleActions: "play reverse play reverse",
      invalidateOnRefresh: true,
    };

    gsap.to(supplierRef!, {
      y: "-100%",
      rotation: 12,
      transformOrigin: "100% 100%",
      duration: 0.6,
      ease: "circ.inOut",
      scrollTrigger: commonScrollTrigger,
    });

    gsap.to(partnerRef!, {
      y: "0%",
      rotation: 0,
      transformOrigin: "0% 0%",
      duration: 0.6,
      ease: "circ.inOut",
      scrollTrigger: commonScrollTrigger,
    });
  });

  return (
    <main>
      <Title>Official LIMING Website | LIMING</Title>
      <Meta
        name="description"
        content="LIMING offers bespoke sourcing and product procurement from China. We simplify the process, eliminate risk, and offer the Apex Collection of curated products."
      />

      <section class="hero h-[100svh] flex items-center justify-center relative text-light-white">
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
          class="font-formula-bold leading-none text-[60px] md:text-[140px] absolute bottom-40 text-center"
          style="word-spacing: -0.12em;"
        >
          <span class="block md:inline">THE LEADING </span>
          <span class="relative overflow-hidden inline-block align-top">
            <span ref={supplierRef} class="inline-block">
              SUPPLIER
            </span>
            <span
              ref={partnerRef}
              class="absolute inline"
              style={`left: 0; transform: translateY(100%) rotate(12deg); transform-origin: 0% 0%;

              }`}
            >
              PARTNER
            </span>
          </span>
          <br />
          <span class="block md:inline">FOR CHINA </span>
          <span class="block md:inline">AUTO IMPORTS</span>
        </h1>
        <div class="absolute flex justify-between w-full bottom-16 px-3 md:px-25 text-center font-formula-bold">
          <div>
            <span class="text-sm md:text-xl text-gray">LIMING AGENCY</span>
            <h4 class="text-xl md:text-3xl text-light-white">
              ELIMINATE THE RISK
            </h4>
          </div>
          <div>
            <span class="text-sm md:text-xl text-gray">SINCE 2015</span>
            <h4 class="text-xl md:text-3xl text-light-white">
              WORKING GLOBALLY
            </h4>
          </div>
        </div>
      </section>
      <div class="h-screen bg-white w-full"></div>
      <div class="h-screen bg-black w-full"></div>
      <Footer />
    </main>
  );
}
