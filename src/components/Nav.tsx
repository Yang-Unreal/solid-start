import { A, useLocation, useNavigate } from "@solidjs/router";
import {
  createEffect,
  onCleanup,
  createSignal,
  createMemo,
  onMount,
} from "solid-js";
import MenuDrawer from "~/components/MenuDrawer";
import { ShoppingBag, Search, User } from "lucide-solid";
import SearchModal from "./SearchModal";
import NavButton from "./NavButton";
import YourLogo from "./YourLogo";
import { isServer } from "solid-js/web";
import { useAuth } from "~/context/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, handleLogoutSuccess } = useAuth();
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

  const transparent = createMemo(() => isTransparentNavPage() && !isScrolled());
  const removeNavContainerClass = createMemo(
    () => isTransparentNavPage() && !isScrolled()
  );

  return (
    <nav
      class={`px-1 md:px-4 lg:px-4 fixed  w-full z-50  transition-all duration-200   ${
        showNav() ? "top-3" : "top-[-104px]"
      } `}
    >
      <div
        class={`rounded-full relative flex h-12  ${
          removeNavContainerClass() ? "" : "nav-container"
        } ${transparent() ? "bg-transparent" : "bg-black/60"} ${
          isHomepage() ? "text-light" : "bg-white/60"
        }`}
      >
        {/* <div class="absolute h-[1px] w-full bg-light"></div> */}
        <div class="w-full items-center  flex justify-between nav-padding">
          <div class="flex items-center justify-center">
            <MenuDrawer
              onLogoutSuccess={handleLogoutSuccess}
              session={session}
              isHomepage={isHomepage()}
            />
            <NavButton
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
              isHomepage={isHomepage()}
            >
              {(ref) => (
                <div class="flex justify-center items-center gap-2" ref={ref}>
                  <Search
                    stroke-width="1"
                    size={20}
                    class={`transition-colors   ${
                      isHomepage() ? "text-light" : ""
                    }`}
                  />
                  <p
                    class={`hidden md:block  text-md font-inconsolata relative transition-colors   ${
                      isHomepage() ? "text-light" : ""
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
                session().data ? navigate("/dashboard") : navigate("/login")
              }
              aria-label="User"
              isHomepage={isHomepage()}
            >
              {(ref) => (
                <div ref={ref} class="flex gap-2 justify-center items-center">
                  <p
                    class={`hidden md:block  text-md font-inconsolata relative transition-colors  ${
                      isHomepage() ? "text-light" : ""
                    }`}
                  >
                    USER
                  </p>
                  <User
                    stroke-width="1"
                    size={20}
                    class={`transition-colors   ${
                      isHomepage() ? "text-light" : ""
                    }`}
                  />
                </div>
              )}
            </NavButton>
            <NavButton
              onClick={() => navigate("/products")}
              aria-label="Products"
              isHomepage={isHomepage()}
            >
              {(ref) => (
                <div ref={ref} class="flex gap-2 justify-center items-center">
                  <p
                    class={`hidden md:block  text-md font-inconsolata relative transition-colors   ${
                      isHomepage() ? "text-light" : ""
                    }`}
                  >
                    STORE
                  </p>
                  <ShoppingBag
                    stroke-width="1"
                    size={20}
                    class={`transition-colors  ${
                      isHomepage() ? "text-light" : ""
                    }`}
                  />
                </div>
              )}
            </NavButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
