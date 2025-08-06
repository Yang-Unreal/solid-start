import { A, useNavigate } from "@solidjs/router";
import { createEffect, onCleanup, createSignal } from "solid-js";
import MenuDrawer from "~/components/MenuDrawer";
import { ShoppingBag, Search, User } from "lucide-solid";
import SearchModal from "./SearchModal";
import NavButton from "./NavButton";
import YourLogo from "./YourLogo";

export default function Nav(props: {
  onLogoutSuccess: () => void;
  session: any;
  transparent?: boolean;
  removeNavContainerClass?: boolean;
  isHomepage?: boolean;
}) {
  const navigate = useNavigate();

  const [showNav, setShowNav] = createSignal(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = createSignal(false);

  let lastScrollY = 0;

  createEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowNav(true);
      } else if (currentScrollY > lastScrollY) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return (
    <nav
      class={`fixed w-full z-50 nav-padding transition-all duration-200 ${
        props.removeNavContainerClass ? "" : "nav-container"
      } ${props.transparent ? "bg-transparent" : "bg-black/50"} ${
        showNav() ? "top-0" : "top-[-104px]"
      } ${props.isHomepage ? "text-light" : "bg-white/50"}`}
    >
      <div class="relative flex items-center h-18 md:h-26 font-sans justify-between">
        <div class="flex items-center justify-center">
          <MenuDrawer
            onLogoutSuccess={props.onLogoutSuccess}
            session={props.session}
            isHomepage={props.isHomepage}
          />
          <NavButton
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Search"
            isHomepage={props.isHomepage}
          >
            {(ref) => (
              <div class="flex justify-center items-center gap-2" ref={ref}>
                <Search
                  stroke-width="1"
                  size={20}
                  class={`group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                />
                <p
                  class={`hidden md:block font-formula-bold text-xl transform translate-y-[1px] group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                >
                  SEARCH
                </p>
              </div>
            )}
          </NavButton>
          {isMobileSearchOpen() && (
            <SearchModal onClose={() => setIsMobileSearchOpen(false)} />
          )}
        </div>

        <A
          href="/"
          class="absolute left-1/2 -translate-x-1/2 items-center justify-center"
          aria-label="Homepage"
        >
          <YourLogo class="h-4 md:h-5 w-auto" />
        </A>

        <div class="flex items-center justify-center">
          <NavButton
            onClick={() =>
              props.session().data ? navigate("/dashboard") : navigate("/login")
            }
            aria-label="User"
            isHomepage={props.isHomepage}
          >
            {(ref) => (
              <div ref={ref} class="flex gap-2 justify-center items-center">
                <p
                  class={`hidden md:block font-formula-bold text-xl transform translate-y-[1px] group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                >
                  USER
                </p>
                <User
                  stroke-width="1"
                  size={20}
                  class={`group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                />
              </div>
            )}
          </NavButton>
          <NavButton
            onClick={() => navigate("/products")}
            aria-label="Products"
            isHomepage={props.isHomepage}
          >
            {(ref) => (
              <div ref={ref} class="flex gap-2 justify-center items-center">
                <p
                  class={`hidden md:block font-formula-bold text-xl transform translate-y-[1px] group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                >
                  STORE
                </p>
                <ShoppingBag
                  stroke-width="1"
                  size={20}
                  class={`group-hover:text-black ${
                    props.isHomepage ? "text-light" : ""
                  }`}
                />
              </div>
            )}
          </NavButton>
        </div>
      </div>
    </nav>
  );
}
