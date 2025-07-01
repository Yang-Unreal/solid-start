import { createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { animate } from "animejs";
import { A, useLocation, useNavigate } from "@solidjs/router";
import MagneticLink from "~/components/MagneticLink";

interface MenuDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MenuDrawer(props: MenuDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);
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

  const [hoveredLink, setHoveredLink] = createSignal<string | null>(null);

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
    let prevIsVisible: boolean | undefined; // To track previous state of props.isVisible

    createEffect(() => {
      if (menuButtonRef) {
        if (isMobile()) {
          // On mobile, always visible and no animation on initial render
          menuButtonRef.style.opacity = "1";
          menuButtonRef.style.transform = "scale(1)";
          prevIsVisible = undefined; // Reset for mobile context
        } else {
          // Desktop
          // On initial render for desktop, or if state hasn't changed, set directly without animation
          if (
            prevIsVisible === undefined ||
            prevIsVisible === props.isVisible
          ) {
            menuButtonRef.style.opacity = props.isVisible ? "1" : "0";
            menuButtonRef.style.transform = props.isVisible
              ? "scale(1)"
              : "scale(0)";
          } else {
            // Animate only if props.isVisible has changed on desktop
            animate(menuButtonRef, {
              opacity: props.isVisible ? [0, 1] : [1, 0],
              scale: props.isVisible ? [0, 1] : [1, 0],
              duration: 500,
              easing: "easeOutQuad",
            });
          }
          prevIsVisible = props.isVisible; // Update previous state
        }
      }
    });

    createEffect(() => {
      if (drawerRef) {
        animate(drawerRef, {
          translateX: isOpen() ? ["100%", "0%"] : "100%",
          duration: 300,
          easing: "easeOutQuad",
        });
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
        class="fixed top-4 right-8 w-12 h-12 bg-blue-600 rounded-full shadow-lg z-101 flex flex-col justify-center items-center md:w-24 md:h-24"
        style={
          isMobile()
            ? "opacity: 1; transform: scale(1);"
            : "opacity: 0; transform: scale(0);"
        }
        aria-label="Toggle menu"
      >
        {(innerRef) => (
          <div ref={innerRef} class="flex flex-col justify-center items-center">
            <div
              ref={(el) => (line1Ref = el)}
              class="w-6 md:w-10 h-[1px] bg-white mb-1.5"
            ></div>
            <div
              ref={(el) => (line2Ref = el)}
              class="w-6 md:w-10 h-[1px] bg-white"
            ></div>
          </div>
        )}
      </MagneticLink>

      <div
        ref={(el) => (drawerRef = el)}
        class="fixed top-0 right-0 h-full w-full md:w-1/3 bg-[#121212] text-white shadow-xl z-100 p-8 md:p-16 flex flex-col justify-between"
        style="transform: translateX(100%);"
      >
        {/* Top Section: Navigation */}
        <div>
          <h2 class="text-sm text-gray-400 tracking-widest mb-4">NAVIGATION</h2>
          <hr class="border-gray-700" />
          <ul class="mt-12 space-y-4 flex flex-col items-start">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <MagneticLink
                  onClick={() => {
                    navigate(link.href);
                    closeDrawer();
                  }}
                >
                  {(innerRef) => (
                    <div
                      ref={innerRef}
                      class={`relative text-5xl md:text-6xl font-light transition-colors duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                      onMouseEnter={() => setHoveredLink(link.href)}
                      onMouseLeave={() => setHoveredLink(null)}
                    >
                      <span
                        class="absolute -left-8 top-1/2 -translate-y-1/2 rounded-full transition-transform duration-300 ease-in-out w-2 h-2 bg-white"
                        style={{
                          transform: `scale(${
                            (isActive && hoveredLink() === null) ||
                            hoveredLink() === link.href
                              ? 1
                              : 0
                          })`,
                        }}
                      ></span>
                      {link.label}
                    </div>
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
              <A
                href={link.href}
                class="text-white hover:text-gray-400 transition-colors duration-300"
                onClick={closeDrawer}
              >
                {link.label}
              </A>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
