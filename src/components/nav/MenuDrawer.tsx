import { For, createEffect, onMount, createSignal } from "solid-js";
import { useLocation } from "@solidjs/router";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import { useMenu } from "~/context/MenuContext";

type MenuDrawerProps = {
  onClose?: () => void;
};

const MenuDrawer = (props: MenuDrawerProps) => {
  const lenis = useLenis();
  // Destructure isVisible to check for active transitions
  const { triggerTransition, setLogoColor, isVisible } = usePageTransition();
  const { isMenuOpen, setIsMenuOpen, menuButtonRef } = useMenu();
  const location = useLocation();

  let menuContainer: HTMLDivElement | undefined;

  const navLinks = [
    { href: "/product", label: "PRODUCT", image: "/images/menu/PRODUCT.webp" },
    {
      href: "/services",
      label: "SERVICES",
      image: "/images/menu/SERVICES.webp",
    },
    { href: "/about", label: "ABOUT", image: "/images/menu/ABOUT.webp" },
    { href: "/contact", label: "CONTACT", image: "/images/menu/CONTACT.webp" },
  ] as const;

  const hoverSignals = navLinks.map(() =>
    createSignal<"enter" | "leave" | null>(null)
  );

  let underlineRefs: (HTMLDivElement | undefined)[] = new Array(
    navLinks.length
  ).fill(undefined);
  let linkRefs: (HTMLLIElement | undefined)[] = new Array(navLinks.length).fill(
    undefined
  );

  let currentTl: gsap.core.Timeline | undefined;
  let addressRef: HTMLDivElement | undefined;
  let contactRef: HTMLDivElement | undefined;
  let imageContainerRef: HTMLDivElement | undefined;
  let currentImageRef: HTMLImageElement | undefined;
  let nextImageRef: HTMLImageElement | undefined;
  let imageTl: gsap.core.Timeline | undefined;
  let currentIndex = -1;

  createEffect(() => {
    currentIndex = navLinks.findIndex(
      (link) => link.href === location.pathname
    );
  });

  onMount(() => {
    if (menuContainer) {
      gsap.set(menuContainer, { display: "none" });
      gsap.set(linkRefs, { y: "100%" });
      gsap.set([addressRef, contactRef], { y: "100%" });
      if (currentImageRef) {
        currentImageRef.src = navLinks[0].image;
        currentImageRef.alt = navLinks[0].label;
        gsap.set(currentImageRef, { y: "100%", opacity: 1 });
      }
    }
  });

  createEffect(() => {
    const columns = menuContainer?.querySelectorAll(".column");
    if (!columns || !menuContainer) return;

    if (currentTl) currentTl.kill();

    if (isMenuOpen()) {
      // Update default image based on current route when opening
      const currentLink = navLinks[currentIndex] || navLinks[0];
      if (currentImageRef && currentLink) {
        currentImageRef.src = currentLink.image;
        currentImageRef.alt = currentLink.label;
      }
      // Set current underline
      if (currentIndex !== -1 && underlineRefs[currentIndex]) {
        gsap.to(underlineRefs[currentIndex]!, { scaleX: 1, duration: 0 });
      }
      gsap.set(menuContainer, { display: "flex" });

      lenis?.stop();
      gsap.set(columns, {
        scaleX: 1.1,
        scaleY: 1.05,
        rotate: -6,
        y: "100%",
        transformOrigin: "100% 0%",
      });
      currentTl = gsap.timeline();
      currentTl.to(columns, {
        y: "0%",
        rotate: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "circ.inOut",
      });
      currentTl.add(() => {
        setLogoColor("text-gray");
      }, ">-0.1");
      currentTl.to(
        linkRefs,
        {
          y: "0%",
          rotation: 0,
          transformOrigin: "100% 0%",
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1)",
        },
        "-=0.2"
      );
      if (currentImageRef) {
        currentTl.to(
          currentImageRef,
          {
            y: "0%",
            rotation: 0,
            transformOrigin: "100% 0%",
            duration: 0.3,
            ease: "slideUp",
          },
          "<-0.05"
        );
      }
      currentTl.to(
        [addressRef, contactRef],
        {
          y: "0%",
          rotation: 0,
          transformOrigin: "0% 0%",
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1)",
        },
        "-=0.4"
      );
    } else {
      // Reset underlines
      gsap.to(
        underlineRefs.filter((ref) => ref),
        { scaleX: 0, duration: 0 }
      );
      // --- MODIFICATION ---
      // Only run the closing animation if a page transition is NOT active.
      if (!isVisible()) {
        currentTl = gsap.timeline({
          onComplete: () => {
            lenis?.start();
          },
        });

        // Set logo color based on current section when closing menu
        const setColorCallback = () => {
          const sections = document.querySelectorAll("main section");
          sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 0 && rect.bottom > 0) {
              if (section.classList.contains("bg-light")) {
                setLogoColor("text-darkgray");
              } else {
                setLogoColor("text-gray");
              }
            }
          });
        };
        currentTl.add(setColorCallback, 0.1);

        currentTl.to(
          linkRefs,
          {
            y: "100%",
            rotation: -12,
            transformOrigin: "100% 0%",
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1)",
          },
          0
        );
        currentTl.to(
          [addressRef, contactRef],
          {
            y: "100%",
            rotation: 12,
            transformOrigin: "0% 0%",
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1)",
          },
          0
        );
        if (currentImageRef) {
          currentTl.to(
            currentImageRef,
            {
              y: "100%",
              rotation: -12,
              transformOrigin: "100% 0%",
              duration: 0.3,
              ease: "slideUp",
            },
            0
          );
        }
        currentTl.to(
          columns,
          {
            y: "100%",
            rotate: -6,
            duration: 0.4,
            stagger: 0.02,
            ease: "circ.inOut",
          },
          0
        );
      } else {
        // When closing due to page transition, just re-enable scroll
        lenis?.start();
      }
    }
  });

  return (
    <nav
      ref={menuContainer}
      aria-label="Navigation Overlay and Mobile"
      class="navigation-full"
    >
      {/* Background Columns */}
      <div class="column navigation-tile"></div>
      <div class="column navigation-tile"></div>
      <div class="column navigation-tile last"></div>
      <div class="column navigation-tile last"></div>

      {/* Image Container */}
      <div ref={imageContainerRef} class="navigation-images">
        <img
          ref={currentImageRef}
          src={navLinks[0].image}
          alt={navLinks[0].label}
          class="absolute w-full h-full object-cover"
        />
        <img
          ref={nextImageRef}
          src=""
          alt=""
          class="absolute w-full h-full object-cover translate-y-full"
        />
      </div>

      {/* Foreground Text */}

      <ul class="navigation-center">
        <For each={navLinks}>
          {(item, index) => (
            <div class="link-wrap">
              <li class="link" ref={(el) => (linkRefs[index()] = el)}>
                <a
                  href={item.href}
                  class="link-click"
                  onClick={(e) => {
                    e.preventDefault();
                    triggerTransition(item.href, undefined, undefined, () => {
                      // Hide menu immediately when columns reach 0%
                      if (menuContainer) {
                        menuContainer.style.display = "none";
                      }
                      setIsMenuOpen(false);
                    });
                  }}
                  onMouseEnter={() => {
                    hoverSignals[index()]![1]("enter");

                    // Set hovered underline to 1, others to 0
                    underlineRefs.forEach((ref, i) => {
                      if (ref) {
                        gsap.to(ref, {
                          scaleX: i === index() ? 1 : 0,
                          transformOrigin:
                            i === index() ? "0% 50%" : "100% 50%",
                          duration: 0.3,
                        });
                      }
                    });

                    if (!currentImageRef || !nextImageRef) return;

                    if (imageTl && imageTl.isActive()) {
                      imageTl.progress(1);
                    }

                    const targetItem = { image: item.image, alt: item.label };

                    if (
                      new URL(currentImageRef.src).pathname === targetItem.image
                    ) {
                      return;
                    }

                    nextImageRef.src = targetItem.image;
                    nextImageRef.alt = targetItem.alt;
                    gsap.set(nextImageRef, { y: "100%" });

                    const duration = 0.6;

                    imageTl = gsap.timeline({
                      onComplete: () => {
                        currentImageRef!.src = nextImageRef!.src;
                        currentImageRef!.alt = nextImageRef!.alt;

                        gsap.set(currentImageRef, { y: "0%" });
                        gsap.set(nextImageRef, {
                          y: "100%",
                          src: "",
                          alt: "",
                        });
                      },
                    });

                    imageTl
                      .to(nextImageRef, {
                        y: "0%",
                        duration,
                        ease: "slideUp",
                      })
                      .to(
                        currentImageRef,
                        {
                          y: "-100%",
                          duration,
                          ease: "slideUp",
                        },
                        "<"
                      );
                  }}
                  onMouseLeave={() => {
                    hoverSignals[index()]![1]("leave");

                    // If leaving the current page link, set it back to 1, else set to 0
                    if (index() === currentIndex && underlineRefs[index()]) {
                      gsap.to(underlineRefs[index()]!, {
                        scaleX: 1,
                        transformOrigin: "0% 50%",
                        duration: 0.3,
                      });
                    } else if (underlineRefs[index()]) {
                      gsap.to(underlineRefs[index()]!, {
                        scaleX: 0,
                        transformOrigin: "100% 50%",
                        duration: 0.3,
                      });
                    }
                  }}
                >
                  <TextAnimation
                    originalClass="text-light"
                    duplicateClass="text-light"
                    text={item.label}
                    class="overflow-hidden"
                    textStyle="pt-[0.1em] text-[1.25em] leading-[0.86] tracking-wide uppercase font-formula-bold"
                    externalTrigger={hoverSignals[index()]![0]()}
                  />
                  <div
                    ref={(el) => (underlineRefs[index()] = el)}
                    class="absolute bottom-0 left-0 w-full h-0.5 bg-light scale-x-0"
                  ></div>
                </a>
              </li>
            </div>
          )}
        </For>
      </ul>

      <div class="navigation-bottom-usps">
        <div class="container large">
          <div class="col-row" ref={addressRef}>
            <span class="font-formula-bold text-[1em] text-gray opacity-50 tracking-wide leading-[0.86] uppercase">
              Address
            </span>
            <h4 class="font-formula-bold text-[1.25em] py-[0.1em] text-gray leading-[1.1] tracking-wide uppercase">
              Taizhou, Zhejiang, China
            </h4>
          </div>
          <div class="col-row" ref={contactRef}>
            <span class="font-formula-bold text-[1em] text-gray opacity-50 tracking-wide leading-[0.86] uppercase">
              CONTACT
            </span>
            <div class="flex items-center justify-center py-[0.2em] relative">
              <TextAnimation
                originalClass="text-gray"
                duplicateClass="text-light"
                text="yang@limingcn.com"
                class="overflow-hidden"
                textStyle="leading-[0.86] font-formula-bold text-[1.25em] pt-[0.1em] text-gray tracking-wide uppercase"
                isCopyable={true}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MenuDrawer;
