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
  const [firstColumnRefs, setFirstColumnRefs] = createSignal<HTMLDivElement[]>(
    []
  );
  const [secondColumnRefs, setSecondColumnRefs] = createSignal<
    HTMLDivElement[]
  >([]);
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  let drawerRef: HTMLDivElement | undefined;
  let leftStripeRef: HTMLDivElement | undefined;
  let rightStripeRef: HTMLDivElement | undefined;
  let navLinksListRef: HTMLUListElement | undefined;
  let secondNavLinksListRef: HTMLUListElement | undefined;
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
      { href: "/news", label: "News" },
      { href: "/contact", label: "Contact" },

      { href: "/sourcing", label: "Bespoke Sourcing" },
      { href: "/inspection", label: "Inspection Before Shipment" },
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
      if (textRef) {
        gsap.set(textRef, { clipPath: "inset(0 0 0 100%)" });
      }
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

      if (drawerRef && navLinksListRef && secondNavLinksListRef) {
        const tl = gsap.timeline();

        if (!hasBeenOpened()) {
          gsap.set([...firstColumnRefs(), ...secondColumnRefs()], { y: 50 });
        }

        if (props.isOpen) {
          if (leftStripeRef)
            tl.fromTo(
              leftStripeRef,
              { x: "62vw" },
              {
                x: "0%",
                duration,
                ease: "circ.inOut",
              },
              0
            );
          if (rightStripeRef)
            tl.fromTo(
              rightStripeRef,
              { x: "60.5vw" },
              {
                x: "0%",
                duration,
                ease: "circ.inOut",
              },
              0.05
            );
          if (drawerRef)
            tl.fromTo(
              drawerRef,
              { x: "100%" },
              {
                x: "0%",
                duration,
                ease: "circ.inOut",
              },
              0.1
            );
          tl.fromTo(
            ".text-container",
            { clipPath: "inset(0 0 0 100%)", visibility: "hidden" },
            {
              clipPath: "inset(0 0 0 0%)",
              visibility: "visible",
              duration,
              ease: "circ.inOut",
            },
            0
          );
          tl.fromTo(
            firstColumnRefs(),
            { y: 50 },
            {
              y: 0,
              duration: 0.6,
              ease: "power2.inOut",
              stagger: 0.05,
            },
            0.3
          );
          tl.fromTo(
            secondColumnRefs(),
            { y: 50 },
            {
              y: 0,
              duration: 0.6,
              ease: "power2.inOut",
              stagger: 0.05,
            },
            0.3
          );
        } else if (hasBeenOpened()) {
          if (skipAnimation()) {
            if (leftStripeRef)
              gsap.set(leftStripeRef, {
                x: "62vw",
              });
            if (rightStripeRef)
              gsap.set(rightStripeRef, {
                x: "61vw",
              });
            if (drawerRef)
              gsap.set(drawerRef, {
                x: () => drawerRef!.offsetWidth,
              });
            gsap.set(".text-container", {
              clipPath: "inset(0 0 0 100%)",
              visibility: "hidden",
            });
            gsap.set([...firstColumnRefs(), ...secondColumnRefs()], { y: 0 });
          } else {
            if (drawerRef)
              tl.to(
                drawerRef,
                {
                  x: () => drawerRef!.offsetWidth,
                  duration,
                  ease: "circ.inOut",
                },
                0
              );
            if (rightStripeRef)
              tl.to(
                rightStripeRef,
                {
                  x: "61vw",
                  duration,
                  ease: "circ.inOut",
                },
                0.05
              );
            if (leftStripeRef)
              tl.to(
                leftStripeRef,
                {
                  x: "62vw",
                  duration,
                  ease: "circ.inOut",
                },
                0.1
              );
            tl.to(
              ".text-container",
              {
                clipPath: "inset(0 0 0 100%)",
                duration,
                ease: "circ.inOut",
              },
              0
            );
            tl.set(".text-container", { visibility: "hidden" });
            tl.to(
              firstColumnRefs(),
              {
                y: 50,
                duration: 0.6,
                ease: "power2.inOut",
                stagger: 0.05,
              },
              0
            );
            tl.to(
              secondColumnRefs(),
              {
                y: 50,
                duration: 0.6,
                ease: "power2.inOut",
                stagger: 0.05,
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
        ref={(el) => (leftStripeRef = el)}
        class="fixed top-0 right-[61.5vw]  h-full  w-[0.5vw] bg-yellow z-40"
        style="transform: translateX(62vw);"
      ></div>
      <div
        ref={(el) => (rightStripeRef = el)}
        class="fixed top-0 right-[60.5vw]  h-full  w-[0.5vw] bg-yellow z-40"
        style="transform: translateX(61vw);"
      ></div>
      <div
        ref={(el) => (drawerRef = el)}
        class="fixed top-0 right-0 h-full w-[60vw] bg-yellow z-40"
        style="transform: translateX(100%);"
      ></div>
      <div
        ref={(el) => (textRef = el)}
        class="text-container fixed top-0 right-0 h-full w-[60vw] text-black z-50 flex flex-col justify-between "
        style="visibility: hidden;"
      >
        <div>
          <div class=" flex px-[10vw] pt-[7vw] justify-between">
            <ul ref={navLinksListRef} class="space-y-4">
              {navLinks()
                .slice(0, 4)
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
                            ref={(el) =>
                              setFirstColumnRefs((prev) => [...prev, el])
                            }
                            class={`text-left text-6xl   ${
                              isActive ? "text-black" : "text-black/70"
                            }`}
                          >
                            {link.label}
                          </div>
                        </div>
                      </A>
                    </li>
                  );
                })}
            </ul>
            <ul ref={secondNavLinksListRef} class="space-y-4">
              {navLinks()
                .slice(4)
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
                            ref={(el) =>
                              setSecondColumnRefs((prev) => [...prev, el])
                            }
                            class={`text-left text-2xl  ${
                              isActive ? "text-black" : "text-black/70"
                            }`}
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
