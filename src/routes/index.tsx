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
      <div class="bg-white min-h-screen flex w-full justify-center">
        {/* <div class="w-[1px] h-screen bg-black"></div> */}
      </div>
      <Footer />
    </main>
  );
}
