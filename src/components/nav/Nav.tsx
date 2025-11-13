import { A, useIsRouting } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js";
import YourLogo from "~/components/logo/YourLogo";
import TextAnimation from "~/components/TextAnimation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isServer } from "solid-js/web";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import { useMenu } from "~/context/MenuContext";

export default function Nav() {
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const lenisControls = useLenis();
  const isRouting = useIsRouting();
  const {
    triggerTransition,
    navColors: contextNavColors,
    setNavColors: setContextNavColors,
    logoColor: contextLogoColor,
    setLogoColor: setContextLogoColor,
    setSetupNavTriggers,
    setKillScrollTriggers,
    setMenuClosedCallback,
    isPreloaderFinished, // Import the preloader state
  } = usePageTransition();

  // Refs for animations
  let workUnderlineRef: HTMLDivElement | undefined;
  let servicesUnderlineRef: HTMLDivElement | undefined;
  let aboutUnderlineRef: HTMLDivElement | undefined;
  let contactUnderlineRef: HTMLDivElement | undefined;
  let productLinkRef: HTMLAnchorElement | undefined;
  let servicesLinkRef: HTMLAnchorElement | undefined;
  let aboutLinkRef: HTMLAnchorElement | undefined;
  let contactLinkRef: HTMLAnchorElement | undefined;

  // Local signals for classes that default to a safe, visible value.
  const [currentNavClasses, setCurrentNavClasses] = createSignal({
    originalClass: "text-gray",
    duplicateClass: "text-light",
  });
  const [currentLogoColor, setCurrentLogoColor] = createSignal("text-gray");

  // Sync the context state to our local state ONLY when the preloader is finished.
  createEffect(() => {
    if (isPreloaderFinished()) {
      setCurrentNavClasses(contextNavColors());
      setCurrentLogoColor(contextLogoColor());
    }
  });

  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    // GUARD CLAUSE: The entire function does nothing until the preloader is finished.
    if (isServer || !isPreloaderFinished()) {
      return;
    }

    // This logic now runs only after the preloader is done.
    const sections = document.querySelectorAll("main section");
    if (sections.length === 0) return;

    // Set initial colors based on the first section in view
    let initialSectionFound = false;
    sections.forEach((section) => {
      if (initialSectionFound) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) {
        if (section.classList.contains("bg-light")) {
          setContextNavColors({
            originalClass: "text-darkgray",
            duplicateClass: "text-dark",
          });
          setContextLogoColor("text-darkgray");
        } else {
          setContextNavColors({
            originalClass: "text-gray",
            duplicateClass: "text-light",
          });
          setContextLogoColor("text-gray");
        }
        initialSectionFound = true;
      }
    });

    // Create new triggers
    sections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 60px",
        end: "bottom 60px",
        onToggle: (self) => {
          if (self.isActive) {
            if (section.classList.contains("bg-light")) {
              setContextNavColors({
                originalClass: "text-darkgray",
                duplicateClass: "text-dark",
              });
              setContextLogoColor("text-darkgray");
            } else {
              setContextNavColors({
                originalClass: "text-gray",
                duplicateClass: "text-light",
              });
              setContextLogoColor("text-gray");
            }
          }
        },
      });
      scrollTriggers.push(trigger);
    });
  };

  // Master effect to control navigation lifecycle
  createEffect(() => {
    if (isRouting()) {
      lenisControls?.stop();
    } else {
      lenisControls?.lenis.scrollTo(0, { immediate: true });
      ScrollTrigger.refresh();
      lenisControls?.start();
    }
  });

  onMount(() => {
    if (!isServer) {
      gsap.registerPlugin(ScrollTrigger);
      setSetupNavTriggers(() => setupNavTriggers);
      setKillScrollTriggers(() => () => {
        scrollTriggers.forEach((trigger) => trigger.kill());
        scrollTriggers = [];
      });
      setMenuClosedCallback(() => {
        const sections = document.querySelectorAll("main section");
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 0 && rect.bottom > 0) {
            if (section.classList.contains("bg-light")) {
              setContextNavColors({
                originalClass: "text-darkgray",
                duplicateClass: "text-dark",
              });
              setContextLogoColor("text-darkgray");
            } else {
              setContextNavColors({
                originalClass: "text-gray",
                duplicateClass: "text-light",
              });
              setContextLogoColor("text-gray");
            }
          }
        });
      });
    }
  });

  // Effect for menu drawer to prevent conflicts
  createEffect(() => {
    if (isMenuOpen()) {
      lenisControls?.stop();
      gsap.to([productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef], {
        y: "-100%",
        rotate: -12,
        transformOrigin: "0% 0%",
        duration: 0.4,
        ease: "power3.inOut",
        stagger: 0.05,
      });
    } else {
      if (!isRouting()) {
        lenisControls?.start();
      }
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
    <div class="main-nav-bar">
      <div class="w-full relative flex items-center justify-between">
        <nav class="w-full flex" aria-label="Navigation Desktop">
          <ul class="w-full font-formula-bold flex flex-row justify-between items-center overflow-hidden pointer-events-auto p-0 m-0  ">
            <li class="relative">
              <A
                ref={productLinkRef}
                href="/product"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  triggerTransition("/product");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(workUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(workUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={currentNavClasses().originalClass}
                  duplicateClass={currentNavClasses().duplicateClass}
                  text="PRODUCT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={workUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${currentNavClasses().duplicateClass.replace(
                    "text-",
                    "bg-"
                  )}`}
                ></div>
              </A>
            </li>
            <li class="relative">
              <A
                ref={servicesLinkRef}
                href="/services"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  triggerTransition("/services");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(servicesUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={currentNavClasses().originalClass}
                  duplicateClass={currentNavClasses().duplicateClass}
                  text="SERVICES"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={servicesUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${currentNavClasses().duplicateClass.replace(
                    "text-",
                    "bg-"
                  )}`}
                ></div>
              </A>
            </li>
            <li class="relative flex items-center justify-center">
              <A
                href="/"
                aria-label="Homepage"
                title="Homepage"
                onClick={(e) => {
                  e.preventDefault();
                  if (isMenuOpen()) {
                    triggerTransition("/", () => {
                      const menuContainer = document.querySelector(
                        ".fixed.inset-0.z-50"
                      ) as HTMLElement;
                      if (menuContainer) {
                        menuContainer.style.display = "none";
                      }
                      setIsMenuOpen(false);
                    });
                  } else {
                    triggerTransition("/");
                  }
                }}
              >
                <YourLogo class={`h-auto w-[11em] ${currentLogoColor()}`} />
              </A>
            </li>
            <li class="relative">
              <A
                ref={aboutLinkRef}
                href="/about"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  triggerTransition("/about");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(aboutUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={currentNavClasses().originalClass}
                  duplicateClass={currentNavClasses().duplicateClass}
                  text="ABOUT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={aboutUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${currentNavClasses().duplicateClass.replace(
                    "text-",
                    "bg-"
                  )}`}
                ></div>
              </A>
            </li>
            <li class="relative">
              <A
                ref={contactLinkRef}
                href="/contact"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  triggerTransition("/contact");
                }}
                onMouseEnter={() => {
                  if (!isMenuOpen())
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });
                }}
                onMouseLeave={() => {
                  if (!isMenuOpen())
                    gsap.to(contactUnderlineRef!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                }}
              >
                <TextAnimation
                  originalClass={currentNavClasses().originalClass}
                  duplicateClass={currentNavClasses().duplicateClass}
                  text="CONTACT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={contactUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${currentNavClasses().duplicateClass.replace(
                    "text-",
                    "bg-"
                  )}`}
                ></div>
              </A>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
