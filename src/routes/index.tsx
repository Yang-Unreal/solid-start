// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";
import { onMount } from "solid-js";
import gsap, { CustomEase } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "~/components/Footer";

export default function Home() {
  let supplierRef: HTMLSpanElement | undefined;
  let partnerRef: HTMLSpanElement | undefined;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");

    gsap.to(supplierRef!, {
      y: "-100%",
      rotation: 12,
      transformOrigin: "100% 100%",
      duration: 0.6,
      ease: "circ.inOut",
      scrollTrigger: {
        trigger: ".hero",
        start: "bottom 99%",
        toggleActions: "play reverse play reverse",
      },
    });

    gsap.to(partnerRef!, {
      y: "-100%",
      rotation: 0,
      transformOrigin: "0% 0%",
      duration: 0.6,
      ease: "circ.inOut",
      scrollTrigger: {
        trigger: ".hero",
        start: "bottom 99%",
        toggleActions: "play reverse play reverse",
      },
    });
  });

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
          class="font-formula-bold leading-none text-[140px] absolute bottom-40 text-center"
          style="word-spacing: -0.12em;"
        >
          <span> THE LEADING</span>
          <span class="relative overflow-hidden pl-5 inline-block align-top">
            <span ref={supplierRef} class="block">
              SUPPLIER
            </span>
            <span
              ref={partnerRef}
              class="absolute block"
              style={`transform:  rotate(12deg); transform-origin: 0% 0%;

              }`}
            >
              PARTNER
            </span>
          </span>
          <br />
          <span> FOR CHINA AUTO IMPORTS</span>
        </h1>
        <div class="absolute flex justify-between w-full bottom-16 px-25 text-center font-formula-bold">
          <div>
            <span class="text-xl text-gray">LIMING AGENCY</span>
            <h4 class="text-3xl text-light-white">ELIMINATE THE RISK</h4>
          </div>
          <div>
            <span class="text-xl text-gray">SINCE 2015</span>
            <h4 class="text-3xl text-light-white">WORKING GLOBALLY</h4>
          </div>
        </div>
      </section>
      <div class="h-screen bg-white w-full"></div>
      <div class="h-screen bg-black w-full"></div>
      <Footer />
    </main>
  );
}
