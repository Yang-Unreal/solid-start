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
import TextAnimation from "../TextAnimation";
import gsap from "gsap";
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

  let menuButtonRef: HTMLButtonElement | undefined;
  let workUnderlineRef: HTMLDivElement | undefined;
  let servicesUnderlineRef: HTMLDivElement | undefined;
  let aboutUnderlineRef: HTMLDivElement | undefined;
  let contactUnderlineRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (props.isMenuOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  });

  return (
    <>
      <nav class={` fixed  w-full z-[60]  transition-all duration-200    `}>
        <div class={` relative flex h-screen  bg-transparent text-black`}>
          <div class="absolute font-formula-bold text-2xl leading-none top-0 left-0 right-0 flex justify-between items-center px-6 py-6">
            <A
              href="/work"
              class="relative"
              onMouseEnter={() =>
                gsap.to(workUnderlineRef!, {
                  scaleX: 1,
                  transformOrigin: "0% 50%",
                  duration: 0.3,
                })
              }
              onMouseLeave={() =>
                gsap.to(workUnderlineRef!, {
                  scaleX: 0,
                  transformOrigin: "100% 50%",
                  duration: 0.3,
                })
              }
            >
              <TextAnimation
                originalColor="gray"
                duplicateColor="black"
                text="WORK"
              />
              <div
                ref={workUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A
              href="/services"
              class="relative text-black hover:text-gray-600 transition-colors"
              onMouseEnter={() =>
                gsap.to(servicesUnderlineRef!, {
                  scaleX: 1,
                  transformOrigin: "0% 50%",
                  duration: 0.3,
                })
              }
              onMouseLeave={() =>
                gsap.to(servicesUnderlineRef!, {
                  scaleX: 0,
                  transformOrigin: "100% 50%",
                  duration: 0.3,
                })
              }
            >
              <TextAnimation
                originalColor="gray"
                duplicateColor="black"
                text="SERVICES"
              />
              <div
                ref={servicesUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A href="/" aria-label="Homepage" title="Homepage">
              <YourLogo class="h-4 w-auto" />
            </A>
            <A
              href="/about"
              class="relative text-black hover:text-gray-600 transition-colors"
              onMouseEnter={() =>
                gsap.to(aboutUnderlineRef!, {
                  scaleX: 1,
                  transformOrigin: "0% 50%",
                  duration: 0.3,
                })
              }
              onMouseLeave={() =>
                gsap.to(aboutUnderlineRef!, {
                  scaleX: 0,
                  transformOrigin: "100% 50%",
                  duration: 0.3,
                })
              }
            >
              <TextAnimation
                originalColor="gray"
                duplicateColor="black"
                text="ABOUT"
              />
              <div
                ref={aboutUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A
              href="/contact"
              class="relative text-black hover:text-gray-600 transition-colors"
              onMouseEnter={() =>
                gsap.to(contactUnderlineRef!, {
                  scaleX: 1,
                  transformOrigin: "0% 50%",
                  duration: 0.3,
                })
              }
              onMouseLeave={() =>
                gsap.to(contactUnderlineRef!, {
                  scaleX: 0,
                  transformOrigin: "100% 50%",
                  duration: 0.3,
                })
              }
            >
              <TextAnimation
                originalColor="gray"
                duplicateColor="black"
                text="CONTACT"
              />
              <div
                ref={contactUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
          </div>
          {/* <div class="h-screen w-[1px] absolute left-1/2 transform -translate-x-1/2 bg-black"></div> */}

          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
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
          </div>
        </div>
      </nav>
    </>
  );
}
