import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { gsap } from "gsap";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { useLenis } from "~/context/LenisContext";
import type { AuthContextType } from "~/context/AuthContext";
import {
  FaBrandsSquareFacebook,
  FaBrandsInstagram,
  FaBrandsSquareTwitter,
  FaBrandsLinkedin,
} from "solid-icons/fa";

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
  const [textRefs, setTextRefs] = createSignal<HTMLDivElement[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  let drawerRef: HTMLDivElement | undefined;
  let navLinksListRef: HTMLUListElement | undefined;
  let textRef: HTMLDivElement | undefined;

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

  const socialLinks: {
    href: string;
    icon: any;
    onClick?: () => void;
  }[] = [
    { href: "#", icon: FaBrandsSquareFacebook },
    { href: "#", icon: FaBrandsInstagram },
    { href: "#", icon: FaBrandsSquareTwitter },
    { href: "#", icon: FaBrandsLinkedin },
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

      const duration = 0.9; // GSAP uses seconds

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
              ease: "circ.inOut",
            },
            0
          );
          tl.fromTo(
            textRefs(),
            { y: "100%" },
            { y: "0%", duration: 0.4, ease: "power1.inOut" },
            0.4
          );
          tl.fromTo(
            ".text-container",
            { clipPath: "inset(0 0 0 100%)" },
            { clipPath: "inset(0 0 0 0%)", duration, ease: "circ.inOut" },
            0
          );
        } else if (hasBeenOpened()) {
          if (skipAnimation()) {
            gsap.set(drawerRef, {
              x: () => (drawerRef ? drawerRef.offsetWidth + 80 : 0),
            });
            textRefs().forEach((textEl) => gsap.set(textEl, { y: "100%" }));
          } else {
            tl.to(
              drawerRef,
              {
                x: () => (drawerRef ? drawerRef.offsetWidth + 80 : 0),
                duration,
                ease: "circ.inOut",
              },
              0
            );
            textRefs().forEach((textEl) => gsap.set(textEl, { y: "100%" }));
            gsap.set(".text-container", { clipPath: "inset(0 0 0 100%)" });
            gsap.set(".text-container", { clipPath: "inset(0 0 0 100%)" });
          }
        }
      }
    });

    createEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          drawerRef &&
          !drawerRef.contains(event.target as Node) &&
          textRef &&
          !textRef.contains(event.target as Node) &&
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
    <>
      <div
        ref={(el) => (drawerRef = el)}
        class="fixed top-0 right-0 h-full w-[60vw] bg-yellow z-40"
        style="transform: translateX(calc(100% + 5rem));"
      ></div>
      <div
        ref={(el) => (textRef = el)}
        class="text-container fixed top-0 right-0 h-full w-[60vw] text-black z-50 flex flex-col justify-between "
        style={
          props.isOpen
            ? "clip-path: inset(0 0 0 100%);"
            : "visibility: hidden; clip-path: inset(0 0 0 100%);"
        }
      >
        <div>
          <div class=" flex px-[10vw] pt-[7vw] justify-between">
            <ul ref={navLinksListRef} class="space-y-4">
              {navLinks()
                .slice(0, 3)
                .map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <li class="relative mb-4">
                      <A
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setSkipAnimation(true);
                          navigate(link.href);
                          props.onClose();
                        }}
                        class="relative cursor-pointer"
                      >
                        <div class="items-center" style="overflow: hidden;">
                          <div
                            ref={(el) => setTextRefs((prev) => [...prev, el])}
                            class={`text-left text-6xl   ${
                              isActive ? "text-black" : "text-black/70"
                            }`}
                            style="transform: translateY(100%);"
                          >
                            {link.label}
                          </div>
                        </div>
                      </A>
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
                      <A
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setSkipAnimation(true);
                          navigate(link.href);
                          props.onClose();
                        }}
                        class="relative cursor-pointer"
                      >
                        <div class="items-center" style="overflow: hidden;">
                          <div
                            ref={(el) => setTextRefs((prev) => [...prev, el])}
                            class={`text-left text-2xl  ${
                              isActive ? "text-black" : "text-black/70"
                            }`}
                            style="transform: translateY(100%);"
                          >
                            {link.label}
                          </div>
                        </div>
                      </A>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        <div class="flex flex-col gap-5 pl-[10vw] pb-[2vw] pr-[2vw]">
          <div class="flex flex-col gap-3">
            <div>
              <p>Huangyan, Taizhou</p>
              <p>Zhejiang, China</p>
            </div>
            <div>
              <p>T: +86 133 3333 3333</p>
              <p>E: 5oU8S@example.com</p>
            </div>
          </div>
          <div class="flex justify-between">
            <div class="flex gap-2 font-semibold">
              <p>CN</p>
              <p>EN</p>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-2">
              {socialLinks.map((link) => (
                <div
                  onClick={() => {
                    setSkipAnimation(true);
                    navigate(link.href);
                    props.onClose();
                  }}
                  class="text-black cursor-pointer"
                >
                  <link.icon size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
