import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  For,
  on,
} from "solid-js";
import { gsap } from "gsap";
import { A, useLocation, useNavigate } from "@solidjs/router";
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

const STRIPE_WIDTH = 8;

const BASE_NAV_LINKS = [
  { href: "/", label: "Collection" },
  { href: "/about", label: "About Us" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "Account" },
  { href: "/sourcing", label: "Bespoke Sourcing" },

  { href: "/services", label: "After-sales Service" },
  { href: "/inspection", label: "Inspection Before Shipment" },
];

const SOCIAL_LINKS = [
  { href: "#", icon: FaBrandsSquareFacebook },
  { href: "#", icon: FaBrandsInstagram },
  { href: "#", icon: FaBrandsSquareTwitter },
  { href: "#", icon: FaBrandsLinkedin },
];

// Sub-component for Nav Link Item
function NavLinkItem(props: {
  link: { href: string; label: string };
  isActive: boolean;
  onNavigate: () => void;
  ref: (el: HTMLDivElement) => void;
  class: string;
}) {
  return (
    <li class="relative">
      <A
        href={props.link.href}
        onClick={(e) => {
          e.preventDefault();
          props.onNavigate();
        }}
        class="relative cursor-pointer"
      >
        <div class="items-center" style="overflow: hidden;">
          <div
            ref={props.ref}
            class={
              props.class +
              ` ${props.isActive ? "text-black" : "text-black/70"}`
            }
          >
            {props.link.label}
          </div>
        </div>
      </A>
    </li>
  );
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const lenis = useLenis();

  const [hasBeenOpened, setHasBeenOpened] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== "undefined" ? window.innerWidth <= 1024 : false
  );
  const [localIsOpen, setLocalIsOpen] = createSignal(false);
  let firstColumnRefs: HTMLDivElement[] = [];
  let secondColumnRefs: HTMLDivElement[] = [];

  let drawerRef: HTMLDivElement | undefined;
  let leftStripeRef: HTMLDivElement | undefined;
  let rightStripeRef: HTMLDivElement | undefined;
  let upStripeRef: HTMLDivElement | undefined;
  let lowStripeRef: HTMLDivElement | undefined;
  let textRef: HTMLDivElement | undefined;

  const navLinks = () => props.links || BASE_NAV_LINKS;

  const handleNavigation = (href: string) => {
    navigate(href);
    props.onClose();
  };

  const animateDrawer = (
    isOpen: boolean,
    textWidth: number,
    textHeight: number
  ) => {
    if (
      !leftStripeRef ||
      !rightStripeRef ||
      !drawerRef ||
      !upStripeRef ||
      !lowStripeRef
    ) {
      return;
    }
    const duration = 0.8;
    const tl = gsap.timeline();
    const allColumns = [...firstColumnRefs, ...secondColumnRefs];

    if (!hasBeenOpened()) {
      gsap.set(allColumns, { y: 50 });
    }

    if (isOpen) {
      if (!isMobile()) {
        tl.fromTo(
          leftStripeRef,
          { right: STRIPE_WIDTH + "px" },
          {
            right: textWidth + 24 + "px",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0
        ).fromTo(
          rightStripeRef,
          { right: STRIPE_WIDTH + "px" },
          {
            right: textWidth + 8 + "px",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0.05
        );
      } else {
        tl.fromTo(
          upStripeRef,
          { top: -STRIPE_WIDTH + "px" },
          {
            top: textHeight + 8 + "px",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0.05
        ).fromTo(
          lowStripeRef,
          { top: -STRIPE_WIDTH + "px" },
          {
            top: textHeight + 24 + "px",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0
        );
      }

      if (!isMobile()) {
        tl.fromTo(
          drawerRef,
          { x: "100%" },
          { x: "0%", duration, ease: "circ.inOut" },
          0.1
        );
      } else {
        tl.fromTo(
          drawerRef,
          { y: "-100%" },
          { y: "0%", duration, ease: "circ.inOut" },
          0.1
        );
      }

      if (!isMobile()) {
        tl.fromTo(
          ".text-container",
          { clipPath: "inset(0 0 0 100%)", visibility: "hidden" },
          {
            clipPath: "inset(0 0 0 0%)",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0.1
        );
      } else {
        tl.fromTo(
          ".text-container",
          { clipPath: "inset(0 0 100% 0)", visibility: "hidden" },
          {
            clipPath: "inset(0 0 0% 0 )",
            visibility: "visible",
            duration,
            ease: "circ.inOut",
          },
          0.1
        );
      }

      tl.fromTo(
        firstColumnRefs,
        { y: 50 },
        { y: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
        0.3
      ).fromTo(
        secondColumnRefs,
        { y: 50 },
        { y: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
        0.3
      );
    } else if (hasBeenOpened()) {
      if (!isMobile()) {
        tl.to(
          drawerRef,
          { x: () => drawerRef!.offsetWidth, duration, ease: "circ.inOut" },
          0
        );
      } else {
        tl.to(
          drawerRef,
          { y: () => -drawerRef!.offsetHeight, duration, ease: "circ.inOut" },
          0
        );
      }

      if (!isMobile()) {
        tl.to(
          rightStripeRef,
          { right: -STRIPE_WIDTH + "px", duration, ease: "circ.inOut" },
          0.05
        ).to(
          leftStripeRef,
          { right: -STRIPE_WIDTH + "px", duration, ease: "circ.inOut" },
          0.1
        );
      } else {
        tl.to(
          upStripeRef,
          { top: -STRIPE_WIDTH + "px", duration, ease: "circ.inOut" },
          0.05
        ).to(
          lowStripeRef,
          { top: -STRIPE_WIDTH + "px", duration, ease: "circ.inOut" },
          0.1
        );
      }

      if (!isMobile()) {
        tl.to(
          ".text-container",
          { clipPath: "inset(0 0 0 100%)", duration, ease: "circ.inOut" },
          0
        );
      } else {
        tl.to(
          ".text-container",
          { clipPath: "inset(0 0 100% 0 )", duration, ease: "circ.inOut" },
          0
        );
      }

      tl.to(
        firstColumnRefs,
        { y: 50, duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
        0
      ).to(
        secondColumnRefs,
        { y: 50, duration: 0.6, ease: "power2.inOut", stagger: 0.05 },
        0
      );
    }
  };

  onMount(() => {
    if (import.meta.env.SSR) return;

    // Set initial transform state with GSAP
    if (drawerRef) {
      const initialTransform = isMobile()
        ? "translateY(-100%)"
        : "translateX(100%)";
      gsap.set(drawerRef, { transform: initialTransform });
    }

    if (textRef) {
      gsap.set(textRef, { clipPath: "inset(0 0 0 100%)" });
    }

    // Set initial stripe positions
    if (leftStripeRef) {
      gsap.set(leftStripeRef, {
        right: `${STRIPE_WIDTH}px`,
        visibility: "hidden",
      });
    }
    if (rightStripeRef) {
      gsap.set(rightStripeRef, {
        right: `${STRIPE_WIDTH}px`,
        visibility: "hidden",
      });
    }
    if (upStripeRef) {
      gsap.set(upStripeRef, {
        top: `-${STRIPE_WIDTH}px`,
        visibility: "hidden",
      });
    }
    if (lowStripeRef) {
      gsap.set(lowStripeRef, {
        top: `-${STRIPE_WIDTH}px`,
        visibility: "hidden",
      });
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (
        localIsOpen() &&
        drawerRef &&
        textRef &&
        leftStripeRef &&
        rightStripeRef &&
        upStripeRef &&
        lowStripeRef
      ) {
        // Delay to allow layout reflow
        setTimeout(() => {
          const textWidth = textRef.offsetWidth;
          const textHeight = textRef.offsetHeight;

          // Update drawer size
          drawerRef.style.width = `${textWidth}px`;
          drawerRef.style.height = `${textHeight}px`;

          // Ensure open state
          gsap.set(drawerRef, { x: "0%", y: "0%" });
          gsap.set(textRef, {
            clipPath: "inset(0 0 0 0)",
            visibility: "visible",
          });

          // Update stripe positions for current mode
          const isMobileNow = window.innerWidth <= 1024;
          if (isMobileNow) {
            // Mobile stripes
            gsap.set(upStripeRef, {
              top: `${textHeight + 8}px`,
              visibility: "visible",
            });
            gsap.set(lowStripeRef, {
              top: `${textHeight + 24}px`,
              visibility: "visible",
            });
            gsap.set(leftStripeRef, {
              right: `${STRIPE_WIDTH}px`,
              visibility: "hidden",
            });
            gsap.set(rightStripeRef, {
              right: `${STRIPE_WIDTH}px`,
              visibility: "hidden",
            });
          } else {
            // Desktop stripes
            gsap.set(leftStripeRef, {
              right: `${textWidth + 24}px`,
              visibility: "visible",
            });
            gsap.set(rightStripeRef, {
              right: `${textWidth + 8}px`,
              visibility: "visible",
            });
            gsap.set(upStripeRef, {
              top: `-${STRIPE_WIDTH}px`,
              visibility: "hidden",
            });
            gsap.set(lowStripeRef, {
              top: `-${STRIPE_WIDTH}px`,
              visibility: "hidden",
            });
          }
        }, 0);
      }
    };
    window.addEventListener("resize", handleResize);
    onCleanup(() => window.removeEventListener("resize", handleResize));
  });

  createEffect(() => {
    setLocalIsOpen(props.isOpen);
    if (props.isOpen && drawerRef && textRef) {
      setTimeout(() => {
        drawerRef.style.width = `${textRef.offsetWidth}px`;
        drawerRef.style.height = `${textRef.offsetHeight}px`;
      }, 0);
    }
  });

  createEffect(
    on(
      () => props.isOpen,
      (isOpen) => {
        if (isOpen) {
          setHasBeenOpened(true);
        }
        const textWidth = textRef ? textRef.offsetWidth : 0;
        const textHeight = textRef ? textRef.offsetHeight : 0;
        animateDrawer(isOpen, textWidth, textHeight);
      }
    )
  );

  createEffect(
    on(isMobile, (newMobile) => {
      if (drawerRef && !localIsOpen()) {
        const newTransform = newMobile
          ? "translateY(-100%)"
          : "translateX(100%)";
        gsap.set(drawerRef, { transform: newTransform });
      }
      // Open state updates handled in resize handler
    })
  );

  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        drawerRef &&
        !drawerRef.contains(target) &&
        textRef &&
        !textRef.contains(target) &&
        props.menuButtonRef &&
        !props.menuButtonRef.contains(target)
      ) {
        props.onClose();
      }
    };

    if (props.isOpen) {
      lenis?.stop();
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      if (hasBeenOpened()) lenis?.start();
      document.removeEventListener("mousedown", handleClickOutside);
    }

    onCleanup(() => {
      if (hasBeenOpened()) lenis?.start();
      document.removeEventListener("mousedown", handleClickOutside);
    });
  });

  return (
    <>
      <div>
        <div
          ref={leftStripeRef}
          class="fixed top-0 h-full w-2 bg-yellow z-40"
          style="visibility: hidden;"
        />
        <div
          ref={rightStripeRef}
          class="fixed top-0 h-full w-2 bg-yellow z-40"
          style="visibility: hidden;"
        />
      </div>
      <div>
        <div
          ref={upStripeRef}
          class="fixed top-0 w-full h-2 bg-yellow z-40"
          style="visibility: hidden;"
        />
        <div
          ref={lowStripeRef}
          class="fixed top-0 w-full h-2 bg-yellow z-40"
          style="visibility: hidden;"
        />
      </div>
      <div ref={drawerRef} class="fixed top-0 right-0 h-full bg-yellow z-40" />
      <div
        ref={textRef}
        class="text-container fixed top-0 right-0 text-black z-50 flex flex-col justify-between"
        style="visibility: hidden;"
      >
        <div class="nav-links-container flex flex-row justify-between gap-[10vw]">
          <ul class="space-y-4">
            <For each={navLinks().slice(0, 4)}>
              {(link, index) => (
                <NavLinkItem
                  link={link}
                  isActive={location.pathname === link.href}
                  onNavigate={() => handleNavigation(link.href)}
                  ref={(el) => (firstColumnRefs[index()] = el)}
                  class="text-left text-2xl md:text-5xl font-semibold"
                />
              )}
            </For>
          </ul>
          <ul class="space-y-1 md:space-y-3">
            <For each={navLinks().slice(4)}>
              {(link, index) => (
                <NavLinkItem
                  link={link}
                  isActive={location.pathname === link.href}
                  onNavigate={() => handleNavigation(link.href)}
                  ref={(el) => (secondColumnRefs[index()] = el)}
                  class="text-left text-md md:text-xl font-semibold"
                />
              )}
            </For>
          </ul>
        </div>

        <div class="contact-container flex flex-col gap-5 pb-6">
          <div
            id="contact-info"
            class={`flex ${isMobile() ? "flex-row" : "flex-col"} gap-4`}
          >
            <div class="flex flex-col w-1/2">
              <p>Huangyan, Taizhou</p>
              <p>Zhejiang, China</p>
            </div>
            <div class="flex flex-col w-1/2">
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
              <For each={SOCIAL_LINKS}>
                {(link) => (
                  <div
                    onClick={() => handleNavigation(link.href)}
                    class="text-black cursor-pointer"
                  >
                    <link.icon size={20} />
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
