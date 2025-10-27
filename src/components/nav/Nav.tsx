import { A, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, onCleanup, createSignal, onMount } from "solid-js";
import MenuDrawer from "~/components/nav/MenuDrawer";
import { ShoppingBag, Search, User } from "lucide-solid";
import SearchModal from "../search/SearchModal";
import NavButton from "../NavButton";
import MobileLogo from "../logo/MobileLogo";
import YourLogo from "../logo/YourLogo";
import TextAnimation from "../TextAnimation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const lenis = useLenis(); // Get the lenis instance from context

  // Refs for animations
  let workUnderlineRef: HTMLDivElement | undefined;
  let servicesUnderlineRef: HTMLDivElement | undefined;
  let aboutUnderlineRef: HTMLDivElement | undefined;
  let contactUnderlineRef: HTMLDivElement | undefined;
  let productLinkRef: HTMLAnchorElement | undefined;
  let servicesLinkRef: HTMLAnchorElement | undefined;
  let aboutLinkRef: HTMLAnchorElement | undefined;
  let contactLinkRef: HTMLAnchorElement | undefined;

  // Signals for dynamic colors
  const [navColors, setNavColors] = createSignal({
    originalColor: "rgba(192, 202, 201, 1)",
    duplicateColor: "rgba(241, 241, 241, 1)",
  });
  const [logoColorClass, setLogoColorClass] = createSignal("text-gray");

  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    if (isServer) return;

    setTimeout(() => {
      const sections = document.querySelectorAll("main section");
      if (sections.length === 0) return;

      // Initial color check
      let initialSectionFound = false;
      sections.forEach((section) => {
        if (initialSectionFound) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) {
          if (section.classList.contains("bg-light")) {
            setNavColors({
              originalColor: "#182b2a",
              duplicateColor: "rgba(0, 21, 20, 1)",
            });
            setLogoColorClass("text-darkgray");
          } else {
            setNavColors({
              originalColor: "rgba(192, 202, 201, 1)",
              duplicateColor: "rgba(241, 241, 241, 1)",
            });
            setLogoColorClass("text-gray");
          }
          initialSectionFound = true;
        }
      });

      // Create scroll triggers
      sections.forEach((section) => {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 60px",
          end: "bottom 60px",
          onToggle: (self) => {
            if (self.isActive) {
              if (section.classList.contains("bg-light")) {
                setNavColors({
                  originalColor: "#182b2a",
                  duplicateColor: "rgba(0, 21, 20, 1)",
                });
                setLogoColorClass("text-darkgray");
              } else {
                setNavColors({
                  originalColor: "rgba(192, 202, 201, 1)",
                  duplicateColor: "rgba(241, 241, 241, 1)",
                });
                setLogoColorClass("text-gray");
              }
            }
          },
        });
        scrollTriggers.push(trigger);
      });
    }, 100);
  };

  createEffect(() => {
    // Re-run this effect when the pathname changes
    location.pathname;

    // --- MODIFIED: Scroll to top on navigation ---
    // Use the lenis API to scroll to the top immediately.
    lenis?.scrollTo(0, { immediate: true });

    // Cleanup previous ScrollTriggers
    scrollTriggers.forEach((trigger) => trigger.kill());
    scrollTriggers = [];

    // Setup triggers for the new page
    setupNavTriggers();
  });

  onMount(() => {
    if (!isServer) {
      gsap.registerPlugin(ScrollTrigger);
    }
  });

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
      <nav class={` fixed  w-full z-60  transition-all duration-200    `}>
        <div class={` relative flex   bg-transparent text-white`}>
          <div class="absolute font-formula-bold text-2xl leading-none top-0 left-0 right-0 flex justify-between items-center p-3 lg:px-6 lg:py-6 overflow-hidden">
            {/* PRODUCT LINK */}
            <div class="overflow-hidden">
              <A
                ref={productLinkRef}
                href="/product"
                class="relative text-xl xl:text-2xl block"
                onMouseEnter={() => {
                  if (!props.isMenuOpen)
                    gsap.to(workUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!props.isMenuOpen)
                    gsap.to(workUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalColor={navColors().originalColor}
                  duplicateColor={navColors().duplicateColor}
                  text="PRODUCT"
                />
                <div
                  ref={workUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            {/* SERVICES LINK */}
            <div class="overflow-hidden">
              <A
                ref={servicesLinkRef}
                href="/services"
                class="relative text-xl xl:text-2xl hidden md:block"
                onMouseEnter={() => {
                  if (!props.isMenuOpen)
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!props.isMenuOpen)
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalColor={navColors().originalColor}
                  duplicateColor={navColors().duplicateColor}
                  text="SERVICES"
                />
                <div
                  ref={servicesUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            {/* LOGO */}
            <A
              href="/"
              aria-label="Homepage"
              title="Homepage"
              onClick={(e) => {
                if (props.isMenuOpen) {
                  e.preventDefault();
                  props.setIsMenuOpen(false);
                  navigate("/");
                }
              }}
            >
              <YourLogo
                class={`h-4 xl:h-5 w-auto transition-colors duration-300 ${logoColorClass()}`}
              />
            </A>
            {/* ABOUT LINK */}
            <div class="overflow-hidden">
              <A
                ref={aboutLinkRef}
                href="/about"
                class="relative text-xl xl:text-2xl hidden md:block"
                onMouseEnter={() => {
                  if (!props.isMenuOpen)
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!props.isMenuOpen)
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalColor={navColors().originalColor}
                  duplicateColor={navColors().duplicateColor}
                  text="ABOUT"
                />
                <div
                  ref={aboutUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
            {/* CONTACT LINK */}
            <div class="overflow-hidden">
              <A
                ref={contactLinkRef}
                href="/contact"
                class="relative text-xl xl:text-2xl block"
                onMouseEnter={() => {
                  if (!props.isMenuOpen)
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!props.isMenuOpen)
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalColor={navColors().originalColor}
                  duplicateColor={navColors().duplicateColor}
                  text="CONTACT"
                />
                <div
                  ref={contactUnderlineRef!}
                  class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                ></div>
              </A>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
