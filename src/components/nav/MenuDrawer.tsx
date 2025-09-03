import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { useLenis } from "~/context/LenisContext";
import type { AuthContextType } from "~/context/AuthContext";

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

  const handleLogout = async () => {
    await authClient.signOut();
    props.onLogoutSuccess();
  };

  const navLinks = () => {
    const isDashboard = location.pathname.startsWith("/dashboard");
    const baseNavLinks = [
      { href: "/", label: "Collection" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },

      { href: "/sourcing", label: "Bespoke Sourcing" },
      { href: "/services", label: "After-sales Service" },
      { href: "/account", label: "Account" },
    ];

    const links: { href: string; label: string; onClick?: () => void }[] =
      props.links ? [...props.links] : baseNavLinks;

    // if (props.session().data?.user) {
    //   links.push({ href: "/dashboard", label: "Dashboard" });
    //   links.push({ href: "#", label: "Logout", onClick: handleLogout });
    // } else {
    //   links.push({ href: "/login", label: "Login" });
    //   links.push({ href: "/signup", label: "Signup" });
    // }
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

      const duration = 0.8; // GSAP uses seconds

      if (drawerRef && navLinksListRef) {
        const links = Array.from(navLinksListRef.children);
        const tl = gsap.timeline();

        if (props.isOpen) {
          tl.fromTo(
            drawerRef,
            { x: "100%" },
            {
              x: "0%",
              duration,
              ease: "power2.inOut",
            },
            0
          );
        } else if (hasBeenOpened()) {
          if (skipAnimation()) {
            gsap.set(drawerRef, {
              x: () => (drawerRef ? drawerRef.offsetWidth + 80 : 0),
            });
          } else {
            tl.to(
              drawerRef,
              {
                x: () => (drawerRef ? drawerRef.offsetWidth + 80 : 0),
                duration,
                ease: "power2.inOut",
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
      class="fixed top-0 right-0  h-full w-full lg:w-3/5 bg-white text-black z-40  flex flex-col justify-between "
      style="transform: translateX(calc(100% + 5rem));"
    >
      <div>
        <div class=" grid grid-cols-2 gap-8 px-[10vw] pt-[7vw]">
          <ul ref={navLinksListRef} class="space-y-4">
            {navLinks()
              .slice(0, 3)
              .map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <li class="relative mb-4">
                    <div
                      onClick={() => {
                        setSkipAnimation(true);
                        if (link.onClick) {
                          link.onClick();
                        } else {
                          navigate(link.href);
                        }
                        props.onClose();
                      }}
                      class="relative cursor-pointer"
                    >
                      <div class="items-center">
                        <div
                          class={`text-left text-6xl font-light font-bold${
                            isActive ? "text-black" : "text-black/70"
                          }`}
                        >
                          {link.label}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
          <ul class="space-y-4">
            {navLinks()
              .slice(3)
              .map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <li class="relative mb-4">
                    <div
                      onClick={() => {
                        setSkipAnimation(true);
                        if (link.onClick) {
                          link.onClick();
                        } else {
                          navigate(link.href);
                        }
                        props.onClose();
                      }}
                      class="relative cursor-pointer"
                    >
                      <div class="items-center">
                        <div
                          class={`text-left text-4xl font-light ${
                            isActive ? "text-black" : "text-black/70"
                          }`}
                        >
                          {link.label}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-sm text-gray-500 tracking-widest mb-4 px-3">SOCIALS</h2>
        <div class="flex flex-wrap gap-x-8 gap-y-2 px-3">
          {socialLinks.map((link) => (
            <div
              onClick={() => {
                setSkipAnimation(true);
                navigate(link.href);
                props.onClose();
              }}
              class="text-black cursor-pointer"
            >
              <div>{link.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
