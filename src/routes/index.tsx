// src/routes/index.tsx

import Footer from "~/components/Footer";
import MagneticLink from "~/components/MagneticLink";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";

export default function Home() {
  const { searchQuery, onSearchChange } = useSearch();
  return (
    <main>
      <div
        class="relative min-h-screen flex items-center justify-center overflow-hidden bg-white bg-cover bg-center"
        style="background-image: url('/heroBackground.webp');"
      >
        <div class="relative z-10 w-full md:w-2/3 container-padding">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            isHomepage={true}
            class=" py-2 placeholder:text-gray-500 placeholder:font-bold "
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
