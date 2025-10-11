// src/routes/index.tsx

import { Meta, Title } from "@solidjs/meta";
import { onMount } from "solid-js";
import gsap from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "~/components/Footer";

export default function Home() {
  let gatewayRef: HTMLSpanElement | undefined;
  let partnerRef: HTMLSpanElement | undefined;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    const commonScrollTrigger = {
      trigger: ".hero",
      start: "top -1%",
      toggleActions: "play reverse play reverse",
      invalidateOnRefresh: true,
    };

    gsap.to(gatewayRef!, {
      y: "-100%",
      rotation: 12,
      transformOrigin: "100% 100%",
      duration: 0.6,
      ease: "circ.inOut",
      scrollTrigger: commonScrollTrigger,
    });

    gsap.fromTo(
      partnerRef!,
      { y: "100%", rotation: 12, transformOrigin: "0% 0%" },
      {
        y: "0%",
        display: "inline",
        rotation: 0,
        transformOrigin: "0% 0%",
        duration: 0.6,
        ease: "circ.inOut",
        scrollTrigger: commonScrollTrigger,
      }
    );
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
          class="font-formula-bold leading-none text-[clamp(1.5rem,18vw,6rem)] absolute bottom-[25%] md:landscape:bottom-[25%] sm:landscape:text-6xl md:landscape:text-7xl xl:landscape:bottom-[20%] xl:landscape:text-[clamp(3rem,9vw,10rem)] 2xl:text-[140px] text-center"
          style="word-spacing: -0.12em;"
        >
          <span class="block sm:inline">YOUR </span>
          <span class="relative overflow-hidden inline-block align-top">
            <span ref={gatewayRef} class="inline-block">
              GATEWAY
            </span>
            <span ref={partnerRef} class="absolute left-0 hidden">
              PARTNER
            </span>
          </span>
          <br />
          <span class="block sm:inline">FOR CHINA </span>
          <span class="block sm:inline">SOURCING</span>
        </h1>
        <div class="absolute flex justify-between w-full bottom-[10%] px-3 lg:px-25 text-center font-formula-bold">
          <div>
            <span class="text-sm xl:text-xl text-gray">LIMING AGENCY</span>
            <h4 class="text-xl xl:text-3xl text-light-white">
              ELIMINATE THE RISK
            </h4>
          </div>
          <div>
            <span class="text-sm xl:text-xl text-gray">SINCE 2015</span>
            <h4 class="text-xl xl:text-3xl text-light-white">
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
