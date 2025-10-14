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
  let productLinkRef: HTMLAnchorElement | undefined;
  let servicesLinkRef: HTMLAnchorElement | undefined;
  let aboutLinkRef: HTMLAnchorElement | undefined;
  let contactLinkRef: HTMLAnchorElement | undefined;
  let productTrigger: "up" | "down" | null = null;
  let servicesTrigger: "up" | "down" | null = null;
  let aboutTrigger: "up" | "down" | null = null;
  let contactTrigger: "up" | "down" | null = null;

  const [productTriggerSignal, setProductTrigger] = createSignal<
    "up" | "down" | null
  >(null);
  const [servicesTriggerSignal, setServicesTrigger] = createSignal<
    "up" | "down" | null
  >(null);
  const [aboutTriggerSignal, setAboutTrigger] = createSignal<
    "up" | "down" | null
  >(null);
  const [contactTriggerSignal, setContactTrigger] = createSignal<
    "up" | "down" | null
  >(null);

  createEffect(() => {
    if (props.isMenuOpen) {
      lenis?.stop();
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "-100%",
        rotate: -12,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });
    } else {
      lenis?.start();
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "0%",
        rotate: 0,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });
    }
  });

  return (
    <>
      <nav class={` fixed  w-full z-[60]  transition-all duration-200    `}>
        <div class={` relative flex   bg-transparent text-white`}>
          <div class="absolute font-formula-bold text-2xl leading-none top-0 left-0 right-0 flex justify-between items-center p-3 lg:px-6 lg:py-6 overflow-hidden">
            <div class="overflow-hidden">
              <A
                ref={productLinkRef}
                href="/product"
                class="relative text-xl xl:text-2xl block"
                onMouseEnter={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(workUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
                }}
                onMouseLeave={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(workUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
                }}
              >
                <TextAnimation
                  originalColor="rgba(192, 202, 201, 1)"
                  duplicateColor="rgba(241, 241, 241, 1)"
                  text="PRODUCT"
                  navSlideTrigger={productTriggerSignal()}
                />
                <div
                  ref={workUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            <div class="overflow-hidden">
              <A
                ref={servicesLinkRef}
                href="/services"
                class="relative text-xl xl:text-2xl hidden md:block"
                onMouseEnter={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(servicesUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
                }}
                onMouseLeave={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(servicesUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
                }}
              >
                <TextAnimation
                  originalColor="rgba(192, 202, 201, 1)"
                  duplicateColor="rgba(241, 241, 241, 1)"
                  text="SERVICES"
                  navSlideTrigger={servicesTriggerSignal()}
                />
                <div
                  ref={servicesUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            <A href="/" aria-label="Homepage" title="Homepage">
              <YourLogo class="h-4 xl:h-5 w-auto text-gray" />
            </A>
            <div class="overflow-hidden">
              <A
                ref={aboutLinkRef}
                href="/about"
                class="relative text-xl xl:text-2xl hidden md:block"
                onMouseEnter={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(aboutUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
                }}
                onMouseLeave={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(aboutUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
                }}
              >
                <TextAnimation
                  originalColor="rgba(192, 202, 201, 1)"
                  duplicateColor="rgba(241, 241, 241, 1)"
                  text="ABOUT"
                  navSlideTrigger={aboutTriggerSignal()}
                />
                <div
                  ref={aboutUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            <div class="overflow-hidden">
              <A
                ref={contactLinkRef}
                href="/contact"
                class="relative text-xl xl:text-2xl block"
                onMouseEnter={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(contactUnderlineRef!, {
                    scaleX: 1,
                    transformOrigin: "0% 50%",
                    duration: 0.3,
                  });
                }}
                onMouseLeave={() => {
                  if (props.isMenuOpen) return;
                  gsap.to(contactUnderlineRef!, {
                    scaleX: 0,
                    transformOrigin: "100% 50%",
                    duration: 0.3,
                  });
                }}
              >
                <TextAnimation
                  originalColor="rgba(192, 202, 201, 1)"
                  duplicateColor="rgba(241, 241, 241, 1)"
                  text="CONTACT"
                  navSlideTrigger={contactTriggerSignal()}
                />
                <div
                  ref={contactUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
          </div>
          {/* <div class="h-screen w-[1px] absolute left-1/2 transform -translate-x-1/2 bg-black"></div> */}
        </div>
      </nav>
    </>
  );
}
