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

export default function Nav() {
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
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  let menuButtonRef: HTMLDivElement | undefined;

  let lastScrollY = 0;

  createEffect(() => {
    if (isMenuOpen()) {
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
        class={` fixed  w-full z-50  transition-all duration-200   ${
          showNav() ? "top-0" : "top-[-104px]"
        } `}
      >
        <div
          class={` relative flex h-18  ${
            transparent() ? "bg-transparent text-light" : "bg-white  text-black"
          }`}
        >
          <div class="w-full items-center  flex justify-between nav-padding">
            <div class="flex items-center justify-center">
              <NavButton
                ref={menuButtonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen())}
                aria-label="Menu"
                isTransparent={transparent()}
              >
                {(ref) => (
                  <div
                    class="flex justify-center items-center gap-2 lg:w-19"
                    ref={ref}
                  >
                    <Menu
                      stroke-width="1"
                      size={20}
                      class={`transition-colors ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    />
                    <p
                      class={`hidden md:block  text-md font-inconsolata relative transition-colors   ${
                        transparent() ? "text-light" : "text-black"
                      }`}
                    >
                      MENU
                    </p>
                  </div>
                )}
              </NavButton>
              <NavButton
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
              </NavButton>
              {isMobileSearchOpen() && (
                <SearchModal onClose={() => setIsMobileSearchOpen(false)} />
              )}
            </div>

            <A
              href="/"
              class="absolute left-1/2 -translate-x-1/2 items-center justify-center"
              aria-label="Homepage"
              title="Homepage"
            >
              <YourLogo class="h-4 md:h-5 w-auto hidden md:block" />
              <MobileLogo class="h-6  w-auto md:hidden" />
            </A>

            <div class="flex items-center justify-center">
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
                aria-label="Products"
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
            </div>
          </div>
        </div>
      </nav>
      <MenuDrawer
        isOpen={isMenuOpen()}
        onClose={() => setIsMenuOpen(false)}
        onLogoutSuccess={handleLogoutSuccess}
        session={session}
        menuButtonRef={menuButtonRef}
      />
      <div
        class={`fixed inset-0 bg-black/50 z-90 transition-opacity duration-300 ${
          isMenuOpen() ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen()}
      />
    </>
  );
}
