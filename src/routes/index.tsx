// src/routes/index.tsx

import Footer from "~/components/Footer";
import MagneticLink from "~/components/MagneticLink";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";

export default function Home() {
  const { searchQuery, onSearchChange } = useSearch();
  return (
    <main>
      <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        <div class="relative z-10 w-2/3 px-4 lg:px-12">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            isHomepage={true}
            class=" py-2"
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
