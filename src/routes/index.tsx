// src/routes/index.tsx

import Footer from "~/components/Footer";
import { createSignal } from "solid-js";
import MagneticLink from "~/components/MagneticLink";
import SearchInput from "~/components/SearchInput";

export default function Home() {
  const [searchQuery, setSearchQuery] = createSignal("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main>
      <div class="relative flex h-[60vh] md:min-h-screen items-center justify-center overflow-hidden bg-black">
        <video
          autoplay
          loop
          muted
          playsinline
          poster="https://minio.limingcn.com/solid-start/gt2_pro_poster.webp"
          class="absolute top-0 left-0 z-0 h-full w-full object-cover"
        >
          <source
            src="https://minio.limingcn.com/solid-start/gt2_pro.webm"
            type="video/webm"
          />
          <source
            src="https://limingcn.com/solid-start/gt2_pro.mp4"
            type="video/mp4"
          />
        </video>
        <div class="relative z-10">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>
      </div>
      <div id="001" class="flex items-center justify-center h-screen bg-white">
        <MagneticLink
          class="w-50 h-24 bg-black rounded-full shadow-lg flex flex-col justify-center items-center"
          aria-label="Magnetic Button"
          enableHoverCircle={true}
          hoverCircleColor="#3B82F6"
          applyOverflowHidden={true}
        >
          {(innerRef) => (
            <div ref={innerRef} class="flex justify-center items-center">
              <p>Hover Button</p>
            </div>
          )}
        </MagneticLink>
      </div>
      <Footer />
    </main>
  );
}
