// src/components/MenuDrawer.tsx

import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { animate, stagger } from "animejs";
import { A, useLocation, useNavigate } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";

interface MenuDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);
  const [hasBeenOpened, setHasBeenOpened] = createSignal(false);
  const location = useLocation();
  const navigate = useNavigate();

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen());
  };

  let menuButtonRef: HTMLButtonElement | undefined;
  let drawerRef: HTMLDivElement | undefined;
  let line1Ref: HTMLDivElement | undefined;
  let line2Ref: HTMLDivElement | undefined;
  let navLinksListRef: HTMLUListElement | undefined;
  let svgPathRef: SVGPathElement | undefined; // Ref for the SVG path

  const [hoveredLink, setHoveredLink] = createSignal<string | null>(null);

  // SVG path definitions for the curve animation
  const pathStraight = "M 0 0 Q 0 500 0 1000";
  const pathCurve = "M 0 0 Q 160 500 0 1000";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    { href: "#", label: "Facebook" },
    { href: "#", label: "Instagram" },
    { href: "#", label: "Twitter" },
    { href: "#", label: "LinkedIn" },
  ];

  onMount(() => {
    if (!import.meta.env.SSR) {
      const mediaQuery = window.matchMedia("(max-width: 767px)");
      setIsMobile(mediaQuery.matches);
      const handleMediaQueryChange = (e: MediaQueryListEvent) =>
        setIsMobile(e.matches);
      mediaQuery.addEventListener("change", handleMediaQueryChange);
      onCleanup(() =>
        mediaQuery.removeEventListener("change", handleMediaQueryChange)
      );
    }
  });

  if (!import.meta.env.SSR) {
    let prevIsVisible: boolean | undefined;

    createEffect(() => {
      if (menuButtonRef) {
        if (isMobile()) {
          menuButtonRef.style.opacity = "1";
          menuButtonRef.style.transform = "scale(1)";
          prevIsVisible = undefined;
        } else {
          if (
            prevIsVisible === undefined ||
            prevIsVisible === props.isVisible
          ) {
            menuButtonRef.style.opacity = props.isVisible ? "1" : "0";
            menuButtonRef.style.transform = props.isVisible
              ? "scale(1)"
              : "scale(0)";
          } else {
            animate(menuButtonRef, {
              opacity: props.isVisible ? [0, 1] : [1, 0],
              scale: props.isVisible ? [0, 1] : [1, 0],
              duration: 500,
              easing: "easeOutQuad",
            });
          }
          prevIsVisible = props.isVisible;
        }
      }
    });

    createEffect(() => {
      if (menuButtonRef) {
        menuButtonRef.style.backgroundColor = isOpen()
          ? "#3B82F6"
          : "transparent";
      }
    });

    createEffect(() => {
      if (isOpen()) {
        setHasBeenOpened(true);
      }

      const easing = "easeOutQuint";
      const duration = 600;

      // Animate Drawer
      if (drawerRef) {
        if (isOpen()) {
          animate(drawerRef, {
            translateX: ["calc(-100% - 5rem)", "0%"],
            duration,
            easing: "easeOutQuint",
          });
        } else if (hasBeenOpened()) {
          animate(drawerRef, {
            translateX: ["0%", "calc(-100% - 5rem)"],
            duration,
            easing: "easeInQuint",
          });
        }
      }

      // Animate SVG Path
      if (svgPathRef) {
        if (isOpen()) {
          // Animate from curve to straight when opening
          animate(svgPathRef, {
            d: [pathCurve, pathStraight],
            duration,
            easing,
          });
        } else if (hasBeenOpened()) {
          // Animate from straight to curve when closing
          animate(svgPathRef, {
            d: [pathStraight, pathCurve],
            duration,
            easing,
          });
        }
      }

      // Animate Nav Links
      if (navLinksListRef) {
        const links = Array.from(navLinksListRef.children);
        if (isOpen()) {
          for (const link of links) {
            if (link instanceof HTMLElement) {
              link.style.opacity = "0";
              link.style.transform = "translateY(40px)";
            }
          }
          animate(links, {
            opacity: [0, 1],
            translateY: [40, 0],
            delay: stagger(80, { start: 100 }),
            duration: 500,
            easing: "easeOutQuart",
          });
        } else if (hasBeenOpened()) {
          if (
            links.length > 0 &&
            (links[0] as HTMLElement).style.opacity === "1"
          ) {
            animate(links, {
              opacity: 0,
              translateY: 40,
              delay: stagger(30),
              duration: 150,
              easing: "easeInQuart",
            });
          }
        }
      }
    });

    createEffect(() => {
      if (line1Ref && line2Ref) {
        const isDrawerOpen = isOpen();
        const yTranslate = isDrawerOpen ? 4 : 0;
        const rotate = isDrawerOpen ? 45 : 0;
        animate(line1Ref, {
          translateY: yTranslate,
          rotate: rotate,
          duration: 300,
          easing: "easeOutQuad",
        });
        animate(line2Ref, {
          translateY: -yTranslate,
          rotate: -rotate,
          duration: 300,
          easing: "easeOutQuad",
        });
      }
    });

    createEffect(() => {
      const handleWheel = (event: WheelEvent) => {
        if (isOpen()) event.preventDefault();
      };
      if (isOpen()) {
        document.body.addEventListener("wheel", handleWheel, {
          passive: false,
        });
      } else {
        document.body.removeEventListener("wheel", handleWheel);
      }
      onCleanup(() => document.body.removeEventListener("wheel", handleWheel));
    });
  }

  return (
    <>
      <MagneticLink
        ref={(el) => (menuButtonRef = el)}
        onClick={toggleDrawer}
        class="absolute  left-6 md:left-12 w-12 h-12 bg-transparent rounded-full z-101 flex flex-col justify-center items-center md:w-16 md:h-16"
        style={{
          opacity: 1,
          transform: "scale(1)",
        }}
        aria-label="Toggle menu"
        enableHoverCircle={true}
        hoverCircleColor="#3B82F6"
        applyOverflowHidden={true}
      >
        {(innerRef) => (
          <div ref={innerRef} class="flex flex-col justify-center items-center">
            <div
              ref={(el) => (line1Ref = el)}
              class={`w-6 md:w-8 h-[2px] mb-1.5 ${
                location.pathname === "/" ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              ref={(el) => (line2Ref = el)}
              class={`w-6 md:w-8 h-[2px] ${
                location.pathname === "/" ? "bg-white" : "bg-black"
              }`}
            ></div>
          </div>
        )}
      </MagneticLink>

      <div
        ref={(el) => (drawerRef = el)}
        class="fixed top-0 left-0 h-full w-full md:w-1/3 bg-[#121212] text-white shadow-xl z-100 px-8 py-20 md:py-40 md:px-16 flex flex-col justify-between "
        style="transform: translateX(calc(-100% - 5rem));"
      >
        {/* SVG Curve Element */}
        <div
          class="absolute top-0 right-0 h-full w-20 pointer-events-none"
          style="transform: translateX(calc(100% - 1px))"
        >
          <svg
            class="h-full w-full"
            viewBox="0 0 80 1000"
            preserveAspectRatio="none"
          >
            <path
              ref={(el) => (svgPathRef = el)}
              d={pathStraight}
              fill="#121212"
            />
          </svg>
        </div>

        {/* Top Section: Navigation */}
        <div>
          <h2 class="text-sm text-gray-400 tracking-widest mb-4">NAVIGATION</h2>
          <hr class="border-gray-700" />
          <ul
            ref={navLinksListRef}
            class="mt-12 space-y-4 flex flex-col items-start"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <MagneticLink
                  onClick={() => {
                    navigate(link.href);
                    closeDrawer();
                  }}
                  class={`relative ${isMobile() ? "w-full" : ""}`}
                >
                  {(innerRef) => (
                    <>
                      <div
                        ref={innerRef}
                        class={`text-left text-5xl md:text-6xl font-light transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-white/70 hover:text-white"
                        }`}
                        onMouseEnter={() => setHoveredLink(link.href)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        {link.label}
                      </div>
                      <span
                        class={`absolute -left-8 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-white hidden md:block`}
                        style={{
                          transform: `scale(${
                            (isActive && hoveredLink() === null) ||
                            hoveredLink() === link.href
                              ? 1
                              : 0
                          })`,
                        }}
                      ></span>
                      <span
                        class={`absolute right-8 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-white block md:hidden`}
                        style={{
                          transform: `scale(${
                            (isActive && hoveredLink() === null) ||
                            hoveredLink() === link.href
                              ? 1
                              : 0
                          })`,
                        }}
                      ></span>
                    </>
                  )}
                </MagneticLink>
              );
            })}
          </ul>
        </div>

        {/* Bottom Section: Socials */}
        <div class="mt-8">
          <h2 class="text-sm text-gray-400 tracking-widest mb-4">SOCIALS</h2>
          <div class="flex flex-wrap gap-x-8 gap-y-2">
            {socialLinks.map((link) => (
              <MagneticLink
                onClick={() => {
                  navigate(link.href);
                  closeDrawer();
                }}
                class="relative text-white transition-colors duration-300 group"
              >
                {(innerRef) => (
                  <>
                    <div ref={innerRef}>{link.label}</div>
                    <span class="absolute bottom-0 left-1/2 w-full h-[1.5px] bg-white transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  </>
                )}
              </MagneticLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
