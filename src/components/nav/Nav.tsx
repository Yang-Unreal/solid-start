import { A, useLocation, useNavigate } from "@solidjs/router";
import {
  createEffect,
  onCleanup,
  createSignal,
  createMemo,
  onMount,
} from "solid-js";
import MenuDrawer from "~/components/nav/MenuDrawer";
import { ShoppingBag, Search, User, Menu } from "lucide-solid";
import SearchModal from "../search/SearchModal";
import NavButton from "../NavButton";
import MobileLogo from "../logo/MobileLogo";
import YourLogo from "../logo/YourLogo";
import { isServer } from "solid-js/web";
import { useAuth } from "~/context/AuthContext";
import { useLenis } from "~/context/LenisContext";

interface NavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  setMenuButtonRef: (el: HTMLElement | undefined) => void;
}

export default function Nav(props: NavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, handleLogoutSuccess } = useAuth();
  const lenis = useLenis();
  const isTransparentNavPage = createMemo(() => location.pathname === "/");
  const isHomepage = createMemo(() => location.pathname === "/");

  const [isScrolled, setIsScrolled] = createSignal(false);
  const handleScrollForTransparent = () => {
    setIsScrolled(window.scrollY > 100);
  };

  if (!isServer) {
    onMount(() => {
      window.addEventListener("scroll", handleScrollForTransparent);
    });

    onCleanup(() => {
      window.removeEventListener("scroll", handleScrollForTransparent);
    });
  }
  const [showNav, setShowNav] = createSignal(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = createSignal(false);
  let menuButtonRef: HTMLButtonElement | undefined;

  let lastScrollY = 0;

  createEffect(() => {
    if (props.isMenuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  });

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

  const transparent = createMemo(() => isTransparentNavPage() && !isScrolled());

  return (
    <>
      <nav
        class={` fixed  w-full z-[60]  transition-all duration-200   ${
          showNav() ? "top-0" : "top-[-104px]"
        } `}
      >
        <div class={` relative flex h-18  bg-transparent text-black`}>
          <div class="w-full items-center  flex justify-between container-padding">
            <A
              href="/"
              class="logo items-center justify-center "
              aria-label="Homepage"
              title="Homepage"
            >
              {/* <YourLogo class="h-4 md:h-5 w-auto hidden md:block" /> */}
              <MobileLogo class="h-6  w-auto" />
            </A>
            <div class="flex items-center justify-center">
              <button
                ref={(el) => {
                  menuButtonRef = el;
                  props.setMenuButtonRef(el);
                }}
                onClick={() => props.setIsMenuOpen(!props.isMenuOpen)}
                class={`border rounded-sm bg-white ${
                  props.isMenuOpen ? "border-black" : "border-gray-200"
                } transition-colors duration-600`}
              >
                <div class="flex justify-center items-center gap-2 px-3 py-2">
                  <Menu
                    stroke-width="2"
                    size={20}
                    class={`bg-transparent text-black`}
                  />
                  <p
                    class={`hidden md:block  text-sm font-bold  relative bg-transparent text-black`}
                  >
                    Menu
                  </p>
                </div>
              </button>
              {/* <NavButton
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Search"
                isTransparent={transparent()}
              >
                {(ref) => (
                  <div
                    class="flex justify-center items-center gap-2 lg:w-19"
                    ref={ref}
                  >
                    <Search
                      stroke-width="1"
                      size={20}
                      class={`transition-colors   ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    />
                    <p
                      class={`hidden md:block  text-md font-inconsolata relative transition-colors   ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    >
                      SEARCH
                    </p>
                  </div>
                )}
              </NavButton> */}
              {/* {isMobileSearchOpen() && (
                <SearchModal onClose={() => setIsMobileSearchOpen(false)} />
              )} */}
            </div>

            {/* <div class="flex items-center justify-center">
              <NavButton
                onClick={() =>
                  session().data ? navigate("/dashboard") : navigate("/login")
                }
                aria-label="User"
                isTransparent={transparent()}
              >
                {(ref) => (
                  <div
                    ref={ref}
                    class="flex gap-2 justify-center items-center lg:w-19"
                  >
                    <p
                      class={`hidden md:block  text-md font-inconsolata relative transition-colors  ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    >
                      USER
                    </p>
                    <User
                      stroke-width="1"
                      size={20}
                      class={`transition-colors   ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    />
                  </div>
                )}
              </NavButton>
              <NavButton
                onClick={() => navigate("/vehicles")}
                aria-label="Vehicles"
                isTransparent={transparent()}
              >
                {(ref) => (
                  <div
                    ref={ref}
                    class="flex gap-2 justify-center items-center lg:w-19"
                  >
                    <p
                      class={`hidden md:block  text-md font-inconsolata relative transition-colors   ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    >
                      STORE
                    </p>
                    <ShoppingBag
                      stroke-width="1"
                      size={20}
                      class={`transition-colors  ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    />
                  </div>
                )}
              </NavButton>
            </div> */}
          </div>
        </div>
      </nav>
    </>
  );
}
