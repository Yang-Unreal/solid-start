// src/components/MenuDrawer.tsx

import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { animate, stagger } from "animejs";
import { useLocation, useNavigate } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";
import { authClient } from "~/lib/auth-client";
import { useLenis } from "~/context/LenisContext";

import { type Session } from "better-auth";

interface MenuDrawerProps {
  links?: { href: string; label: string; onClick?: () => void }[];
  onLogoutSuccess: () => void;
  session: () => {
    data: Session | null;
    isPending: boolean;
  };
  isHomepage?: boolean;
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);
  const [hasBeenOpened, setHasBeenOpened] = createSignal(false);
  const [
    shouldTriggerMenuButtonLeaveAnimation,
    setShouldTriggerMenuButtonLeaveAnimation,
  ] = createSignal(false);
  const [isMenuButtonOnTop, setMenuButtonOnTop] = createSignal(false);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  const closeDrawer = (isFromButtonClick: boolean = false) => {
    if (!isOpen()) return;
    setIsOpen(false);
    if (!isFromButtonClick) {
      setShouldTriggerMenuButtonLeaveAnimation(true);
    }
    setTimeout(() => {
      setMenuButtonOnTop(false);
    }, 500);
  };

  const openDrawer = () => {
    setMenuButtonOnTop(true);
    setIsOpen(true);
  };

  const toggleDrawer = () => {
    if (isOpen()) {
      closeDrawer(true);
    } else {
      openDrawer();
    }
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

  const handleLogout = async () => {
    await authClient.signOut();
    props.onLogoutSuccess();
    closeDrawer();
  };

  const navLinks = () => {
    const isDashboard = location.pathname.startsWith("/dashboard");
    const baseNavLinks = [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/services", label: "Services" },
      {
        href: isDashboard ? "/dashboard/products" : "/products",
        label: "Products",
      },
      { href: "/contact", label: "Contact" },
    ];

    const links: { href: string; label: string; onClick?: () => void }[] =
      props.links ? [...props.links] : baseNavLinks;

    if (props.session().data) {
      links.push({ href: "/dashboard", label: "Dashboard" });
      links.push({ href: "#", label: "Logout", onClick: handleLogout });
    } else {
      links.push({ href: "/login", label: "Login" });
      links.push({ href: "/signup", label: "Signup" });
    }
    return links;
  };

  const socialLinks: { href: string; label: string; onClick?: () => void }[] = [
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
            delay: stagger(50, { start: 100 }),
            duration: 400,
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
        const yTranslate = isDrawerOpen ? 3.5 : 0;
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
      const handleClickOutside = (event: MouseEvent) => {
        if (
          drawerRef &&
          menuButtonRef &&
          !drawerRef.contains(event.target as Node) &&
          !menuButtonRef.contains(event.target as Node)
        ) {
          closeDrawer();
        }
      };

      if (isOpen()) {
        lenis?.stop();
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        if (hasBeenOpened()) {
          lenis?.start();
        }
        document.removeEventListener("mousedown", handleClickOutside);
      }

      onCleanup(() => {
        if (hasBeenOpened()) {
          lenis?.start();
        }
        document.removeEventListener("mousedown", handleClickOutside);
      });
    });
  }

  return (
    <>
      <div class={`group relative ${isMenuButtonOnTop() ? "z-101" : ""}`}>
        <MagneticLink
          ref={(el) => (menuButtonRef = el)}
          onClick={toggleDrawer}
          class={` w-full h-8 px-1.5 md:px-3 rounded-full flex flex-col justify-center items-center ${
            isOpen() ? "bg-primary-accent" : ""
          }`}
          aria-label="Toggle menu"
          enableHoverCircle={true}
          hoverCircleColor="hsl(75, 99%, 52%)"
          applyOverflowHidden={true}
          triggerLeaveAnimation={shouldTriggerMenuButtonLeaveAnimation}
          setTriggerLeaveAnimation={setShouldTriggerMenuButtonLeaveAnimation}
          isLocked={isOpen}
        >
          {(innerRef) => (
            <div
              ref={innerRef}
              class="flex flex-row gap-2 justify-center items-center "
            >
              <div>
                <div
                  ref={(el) => (line1Ref = el)}
                  class={`w-5 h-[1px] mb-1.5 transition-colors duration-600 ${
                    props.isHomepage
                      ? `bg-white group-hover:bg-black ${
                          isOpen() ? "!bg-black" : ""
                        }`
                      : "bg-black"
                  }`}
                ></div>
                <div
                  ref={(el) => (line2Ref = el)}
                  class={`w-5 h-[1px] transition-colors duration-600 ${
                    props.isHomepage
                      ? `bg-white group-hover:bg-black ${
                          isOpen() ? "!bg-black" : ""
                        }`
                      : "bg-black"
                  }`}
                ></div>
              </div>
              <p
                class={`hidden md:block font-formula-bold text-xl relative top-[1px] transition-colors duration-600 ${
                  props.isHomepage
                    ? `text-white group-hover:text-black ${
                        isOpen() ? "!text-black" : ""
                      }`
                    : ""
                }`}
              >
                MENU
              </p>
            </div>
          )}
        </MagneticLink>
      </div>

      <div
        ref={(el) => (drawerRef = el)}
        class="fixed top-0 left-0 h-full w-full md:w-2/3 lg:w-1/3 bg-[#121212] text-white z-100 container-padding py-20 md:py-25  flex flex-col justify-between "
        style="transform: translateX(calc(-100% - 5rem));"
      >
        {/* SVG Curve Element */}
        <div class="absolute top-0 right-0 h-full w-20 pointer-events-none translate-x-[calc(100%-1px)]">
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
            class="mt-4 space-y-4 flex flex-col items-start"
          >
            {navLinks().map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <li class="relative w-full">
                  <MagneticLink
                    onClick={() => {
                      if (link.onClick) {
                        link.onClick();
                      } else {
                        navigate(link.href);
                        closeDrawer();
                      }
                    }}
                    class={`relative ${isMobile() ? "w-full" : ""}`}
                  >
                    {(innerRef) => (
                      <div class="items-center">
                        <div
                          ref={innerRef}
                          class={`text-left text-4xl  font-light transition-colors duration-300 ${
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
                          class={`absolute -left-6 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-white hidden md:block ${
                            (isActive && hoveredLink() === null) ||
                            hoveredLink() === link.href
                              ? "scale-100"
                              : "scale-0"
                          }`}
                        ></span>
                        <span
                          class={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-white block md:hidden ${
                            (isActive && hoveredLink() === null) ||
                            hoveredLink() === link.href
                              ? "scale-100"
                              : "scale-0"
                          }`}
                        ></span>
                      </div>
                    )}
                  </MagneticLink>
                </li>
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
