import { A, useLocation, useNavigate } from "@solidjs/router";
import {
  createEffect,
  onCleanup,
  createSignal,
  createMemo,
  onMount,
} from "solid-js";
import MenuDrawer from "~/components/nav/MenuDrawer";
import { ShoppingBag, Search, User } from "lucide-solid";
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
        <div class={` relative flex h-[100svh]  bg-transparent text-white`}>
          <div class="absolute font-formula-bold text-2xl leading-none top-0 left-0 right-0 flex justify-between items-center p-3 md:px-6 md:py-6">
            <A
              href="/work"
              class="relative text-xl md:text-2xl block"
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
                originalColor="rgba(192, 202, 201, 1)"
                duplicateColor="rgba(241, 241, 241, 1)"
                text="WORK"
              />
              <div
                ref={workUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A
              href="/services"
              class="relative text-2xl hidden md:block"
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
                originalColor="rgba(192, 202, 201, 1)"
                duplicateColor="rgba(241, 241, 241, 1)"
                text="SERVICES"
              />
              <div
                ref={servicesUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A href="/" aria-label="Homepage" title="Homepage">
              <YourLogo class="h-4 md:h-5 w-auto text-gray" />
            </A>
            <A
              href="/about"
              class="relative text-2xl hidden md:block"
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
                originalColor="rgba(192, 202, 201, 1)"
                duplicateColor="rgba(241, 241, 241, 1)"
                text="ABOUT"
              />
              <div
                ref={aboutUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
            <A
              href="/contact"
              class="relative text-xl md:text-2xl block"
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
                originalColor="rgba(192, 202, 201, 1)"
                duplicateColor="rgba(241, 241, 241, 1)"
                text="CONTACT"
              />
              <div
                ref={contactUnderlineRef!}
                class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
              ></div>
            </A>
          </div>
          {/* <div class="h-screen w-[1px] absolute left-1/2 transform -translate-x-1/2 bg-black"></div> */}

          <div class="absolute bottom-3 md:bottom-7 left-1/2 transform -translate-x-1/2 flex items-center justify-center ">
            <button
              ref={(el) => {
                menuButtonRef = el;
                props.setMenuButtonRef(el);
              }}
              onClick={() => props.setIsMenuOpen(!props.isMenuOpen)}
              class={`border rounded-m  border-gray transition-colors duration-600 menu-button`}
            >
              <div class="flex justify-center items-center">
                <div class="bg-dark  px-2.5 h-10 flex justify-center items-center">
                  <div class="menu-icon text-yellow-300">
                    <span class="line line1"></span>
                    <span class="line line2"></span>
                    <span class="line line3"></span>
                  </div>
                </div>
                <div class="bg-gray  px-2.5 h-10 flex justify-center items-center font-formula-bold text-xl">
                  <span class="transform translate-y-0.5">
                    <TextAnimation
                      originalColor="rgba(0, 21, 20, 1)"
                      duplicateColor="rgba(0, 21, 20, 1)"
                      text="MENU"
                    />
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
