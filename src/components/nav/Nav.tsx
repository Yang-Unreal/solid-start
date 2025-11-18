import { A, useIsRouting } from "@solidjs/router";
import { createEffect, createSignal, onMount } from "solid-js"; // Re-import createSignal
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
    navLinkColors: contextNavLinkColors,
    setNavLinkColors: setContextNavLinkColors,
    logoColor: contextLogoColor,
    setLogoColor: setContextLogoColor,
    setSetupNavTriggers,
    setKillScrollTriggers,
    setMenuClosedCallback,
    isPreloaderFinished,
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
  let logoRef: HTMLAnchorElement | undefined;

  // Re-introduce local state. This acts as a safe, visible default
  // ONLY while the preloader is running.
  const [initialNavClasses] = createSignal([
    { originalClass: "text-gray", duplicateClass: "text-light" },
    { originalClass: "text-gray", duplicateClass: "text-light" },
    { originalClass: "text-gray", duplicateClass: "text-light" },
    { originalClass: "text-gray", duplicateClass: "text-light" },
  ]);
  const [initialLogoColor] = createSignal("text-gray");

  // This is the derived signal that intelligently chooses the correct color source.
  const finalNavColors = () =>
    isPreloaderFinished() ? contextNavLinkColors() : initialNavClasses();
  const finalLogoColor = () =>
    isPreloaderFinished() ? contextLogoColor() : initialLogoColor();

  let scrollTriggers: ScrollTrigger[] = [];

  const setupNavTriggers = () => {
    // This function remains the same.
    if (isServer || !isPreloaderFinished()) {
      return;
    }

    const sections = document.querySelectorAll("main section");
    if (sections.length === 0) return;

    let initialSectionFound = false;
    sections.forEach((section) => {
      if (initialSectionFound) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) {
        const newColors = section.classList.contains("bg-light")
          ? { originalClass: "text-darkgray", duplicateClass: "text-dark" }
          : { originalClass: "text-gray", duplicateClass: "text-light" };
        const newLogoColor = section.classList.contains("bg-light")
          ? "text-darkgray"
          : "text-gray";

        setContextNavLinkColors(Array(4).fill(newColors));
        setContextLogoColor(newLogoColor);
        initialSectionFound = true;
      }
    });

    sections.forEach((section) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top 60px",
        end: "bottom 60px",
        onToggle: (self) => {
          if (self.isActive) {
            const newColors = section.classList.contains("bg-light")
              ? { originalClass: "text-darkgray", duplicateClass: "text-dark" }
              : { originalClass: "text-gray", duplicateClass: "text-light" };
            const newLogoColor = section.classList.contains("bg-light")
              ? "text-darkgray"
              : "text-gray";

            setContextNavLinkColors(Array(4).fill(newColors));
            setContextLogoColor(newLogoColor);
          }
        },
      });
      scrollTriggers.push(trigger);
    });
  };

  // The rest of the file remains largely the same, but we will update the JSX.
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
            const newColors = section.classList.contains("bg-light")
              ? { originalClass: "text-darkgray", duplicateClass: "text-dark" }
              : { originalClass: "text-gray", duplicateClass: "text-light" };
            const newLogoColor = section.classList.contains("bg-light")
              ? "text-darkgray"
              : "text-gray";

            setContextNavLinkColors(Array(4).fill(newColors));
            setContextLogoColor(newLogoColor);
          }
        });
      });
    }
  });

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

  const handleTransition = (href: string, onMenuHide?: () => void) => {
    const navElements = {
      links: [productLinkRef, servicesLinkRef, aboutLinkRef, contactLinkRef],
      logo: logoRef,
    };

    const linkPositions = navElements.links.map((el) => {
      if (!el) return { x: 0, width: 0 };
      const rect = el.getBoundingClientRect();
      return { x: rect.x, width: rect.width };
    });

    triggerTransition(href, navElements, linkPositions, onMenuHide);
  };

  return (
    <div class="main-nav-bar">
      <div class="w-full relative flex items-center justify-between">
        <nav class="w-full flex" aria-label="Navigation Desktop">
          <ul class="w-full font-formula-bold flex flex-row justify-between items-center overflow-hidden pointer-events-auto p-0 m-0  ">
            {/* PRODUCT LINK - USE THE DERIVED SIGNAL */}
            <li class="relative">
              <A
                ref={productLinkRef}
                href="/product"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/product");
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
                  originalClass={
                    finalNavColors()[0]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    finalNavColors()[0]?.duplicateClass ?? "text-light"
                  }
                  text="PRODUCT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={workUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    finalNavColors()[0]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* SERVICES LINK - USE THE DERIVED SIGNAL */}
            <li class="relative">
              <A
                ref={servicesLinkRef}
                href="/services"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/services");
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
                  originalClass={
                    finalNavColors()[1]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    finalNavColors()[1]?.duplicateClass ?? "text-light"
                  }
                  text="SERVICES"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={servicesUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    finalNavColors()[1]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* LOGO - USE THE DERIVED SIGNAL */}
            <li class="relative flex items-center justify-center">
              <A
                ref={logoRef}
                href="/"
                aria-label="Homepage"
                title="Homepage"
                onClick={(e) => {
                  e.preventDefault();
                  if (isMenuOpen()) {
                    handleTransition("/", () => {
                      const menuContainer = document.querySelector(
                        ".navigation-full"
                      ) as HTMLElement;
                      if (menuContainer) menuContainer.style.display = "none";
                      setIsMenuOpen(false);
                    });
                  } else {
                    handleTransition("/");
                  }
                }}
              >
                <YourLogo class={`h-auto w-[11em] ${finalLogoColor()}`} />
              </A>
            </li>
            {/* ABOUT LINK - USE THE DERIVED SIGNAL */}
            <li class="relative">
              <A
                ref={aboutLinkRef}
                href="/about"
                class="relative text-[1.25em] hidden md:block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/about");
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
                  originalClass={
                    finalNavColors()[2]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    finalNavColors()[2]?.duplicateClass ?? "text-light"
                  }
                  text="ABOUT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={aboutUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    finalNavColors()[2]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
            {/* CONTACT LINK - USE THE DERIVED SIGNAL */}
            <li class="relative">
              <A
                ref={contactLinkRef}
                href="/contact"
                class="relative text-[1.25em] block bg-transparent overflow-hidden"
                onClick={(e) => {
                  e.preventDefault();
                  handleTransition("/contact");
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
                  originalClass={
                    finalNavColors()[3]?.originalClass ?? "text-gray"
                  }
                  duplicateClass={
                    finalNavColors()[3]?.duplicateClass ?? "text-light"
                  }
                  text="CONTACT"
                  textStyle="pt-[0.1em] leading-[0.86] text-nowrap"
                />
                <div
                  ref={contactUnderlineRef!}
                  class={`absolute bottom-0 left-0 w-full h-px scale-x-0 ${(
                    finalNavColors()[3]?.duplicateClass ?? "text-light"
                  ).replace("text-", "bg-")}`}
                ></div>
              </A>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
