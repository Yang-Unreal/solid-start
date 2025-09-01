import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";
import { authClient } from "~/lib/auth-client";
import { useLenis } from "~/context/LenisContext";
import type { AuthContextType } from "~/context/AuthContext";
import { X } from "lucide-solid";

interface MenuDrawerProps {
  links?: { href: string; label: string; onClick?: () => void }[];
  onLogoutSuccess: () => void;
  session: AuthContextType["session"];
  isOpen: boolean;
  onClose: (options?: { immediate?: boolean }) => void;
  menuButtonRef?: HTMLElement;
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isMobile, setIsMobile] = createSignal(false);
  const [hasBeenOpened, setHasBeenOpened] = createSignal(false);
  const [skipAnimation, setSkipAnimation] = createSignal(false);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  let drawerRef: HTMLDivElement | undefined;
  let navLinksListRef: HTMLUListElement | undefined;
  let svgPathRef: SVGPathElement | undefined;

  const [hoveredLink, setHoveredLink] = createSignal<string | null>(null);

  const pathStraight = "M 0 0 Q 0 500 0 1000";
  const pathCurve = "M 0 0 Q 160 500 0 1000";

  const handleLogout = async () => {
    await authClient.signOut();
    props.onLogoutSuccess();
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

    if (props.session().data?.user) {
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
      if (props.isOpen) {
        setHasBeenOpened(true);
        setSkipAnimation(false);
      }

      const duration = 0.6; // GSAP uses seconds

      if (drawerRef && svgPathRef && navLinksListRef) {
        const links = Array.from(navLinksListRef.children);
        const tl = gsap.timeline();

        if (props.isOpen) {
          tl.to(
            drawerRef,
            {
              x: "0%",
              duration,
              ease: "quint.out",
            },
            0
          )
            .fromTo(
              svgPathRef,
              { attr: { d: pathCurve } },
              {
                attr: { d: pathStraight },
                duration,
                ease: "quint.out",
              },
              0
            )
            .fromTo(
              links,
              { x: -40, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                delay: 0.1,
                stagger: 0.05,
                duration: 0.4,
                ease: "quart.out",
              },
              0
            );
        } else if (hasBeenOpened()) {
          if (skipAnimation()) {
            gsap.set(drawerRef, {
              x: () => (drawerRef ? -drawerRef.offsetWidth - 80 : 0),
            });
          } else {
            tl.to(
              drawerRef,
              {
                x: () => (drawerRef ? -drawerRef.offsetWidth - 80 : 0),
                duration,
                ease: "quint.in",
              },
              0
            )
              .fromTo(
                svgPathRef,
                { attr: { d: pathStraight } },
                {
                  attr: { d: pathCurve },
                  duration,
                  ease: "quint.in",
                },
                0
              )
              .to(
                links,
                {
                  x: -40,
                  opacity: 0,
                  stagger: 0.03,
                  duration: 0.15,
                  ease: "quart.in",
                },
                0
              );
          }
        }
      }
    });

    createEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          drawerRef &&
          !drawerRef.contains(event.target as Node) &&
          props.menuButtonRef &&
          !props.menuButtonRef.contains(event.target as Node)
        ) {
          props.onClose();
        }
      };

      if (props.isOpen) {
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
    <div
      ref={(el) => (drawerRef = el)}
      class="fixed top-0 left-0  h-full w-full lg:w-1/2 xl:w-1/4 bg-white text-black z-100 container-padding py-20 md:py-25  flex flex-col justify-between "
      style="transform: translateX(calc(-100% - 5rem));"
    >
      <button
        onClick={() => props.onClose()}
        class="absolute top-4 right-4 text-black"
        aria-label="Close menu"
      >
        <X size={32} />
      </button>
      <div class="absolute top-0 right-0 h-full w-20 pointer-events-none translate-x-[calc(100%-1px)]">
        <svg
          class="h-full w-full"
          viewBox="0 0 80 1000"
          preserveAspectRatio="none"
        >
          <path
            ref={(el) => (svgPathRef = el)}
            d={pathCurve}
            fill="white"
          />
        </svg>
      </div>

      <div>
        <h2 class="text-sm text-gray-500 tracking-widest mb-4 px-3">
          NAVIGATION
        </h2>
        <hr class="border-gray-200" />
        <ul
          ref={navLinksListRef}
          class="mt-4 space-y-4 flex flex-col items-start"
        >
          {navLinks().map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <li class="relative w-full mb-4 px-3">
                <MagneticLink
                  onClick={() => {
                    setSkipAnimation(true);
                    if (link.onClick) {
                      link.onClick();
                    } else {
                      navigate(link.href);
                    }
                    props.onClose();
                  }}
                  class={`relative ${isMobile() ? "w-full" : ""}`}
                >
                  {(innerRef) => (
                    <div class="items-center">
                      <div
                        ref={innerRef}
                        class={`text-left text-4xl  font-light transition-colors duration-300 ${
                          isActive
                            ? "text-black"
                            : "text-black/70 hover:text-black"
                        }`}
                        onMouseEnter={() => setHoveredLink(link.href)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        {link.label}
                      </div>
                      <span
                        class={`absolute -left-6 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-black hidden md:block ${
                          (isActive && hoveredLink() === null) ||
                          hoveredLink() === link.href
                            ? "scale-100"
                            : "scale-0"
                        }`}
                      ></span>
                      <span
                        class={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-black block md:hidden ${
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

      <div class="mt-8">
        <h2 class="text-sm text-gray-500 tracking-widest mb-4 px-3">
          SOCIALS
        </h2>
        <div class="flex flex-wrap gap-x-8 gap-y-2 px-3">
          {socialLinks.map((link) => (
            <MagneticLink
              onClick={() => {
                setSkipAnimation(true);
                navigate(link.href);
                props.onClose();
              }}
              class="relative text-black transition-colors duration-300 group"
            >
              {(innerRef) => (
                <>
                  <div ref={innerRef}>{link.label}</div>
                  <span class="absolute bottom-0 left-1/2 w-full h-[1.5px] bg-black transform -translate-x-1/2 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                </>
              )}
            </MagneticLink>
          ))}
        </div>
      </div>
    </div>
  );
}