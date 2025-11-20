import { For, createEffect, onMount, createSignal, onCleanup } from "solid-js";
import { useLocation } from "@solidjs/router";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";
import { useLenis } from "~/context/LenisContext";
import { usePageTransition } from "~/context/PageTransitionContext";
import { useMenu } from "~/context/MenuContext";
import { NAV_LINKS } from "~/config/navigation";
import MenuLink from "./MenuLink";
import MenuImages from "./MenuImages";

type MenuDrawerProps = {
  onClose?: () => void;
};

const MenuDrawer = (props: MenuDrawerProps) => {
  const lenis = useLenis();
  const { triggerTransition, setLogoColor, isVisible, isPreloaderFinished } = usePageTransition();
  const { isMenuOpen, setIsMenuOpen } = useMenu();
  const location = useLocation();

  let menuContainer: HTMLDivElement | undefined;
  let addressRef: HTMLDivElement | undefined;
  let contactRef: HTMLDivElement | undefined;
  
  // We need the actual image element for the entrance/exit animation
  let currentImageRef: HTMLImageElement | undefined;
  
  let linkRefs: HTMLLIElement[] = [];

  let currentTl: gsap.core.Timeline | undefined;

  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);
  const [hasInteracted, setHasInteracted] = createSignal(false);
  const [activeImg, setActiveImg] = createSignal({ src: "", alt: "" });

  const currentIndex = () => NAV_LINKS.findIndex((link) => link.href === location.pathname);

  // Reset state when menu opens
  createEffect(() => {
    if (isMenuOpen()) {
      setHasInteracted(false);
      const idx = currentIndex();
      const link = NAV_LINKS[idx !== -1 ? idx : 0];
      if (link) {
        setActiveImg({ src: link.image, alt: link.label });
      }
    }
  });

  onMount(() => {
    if (menuContainer) {
      gsap.set(menuContainer, { visibility: "hidden" });
      // Initial states for animation
      gsap.set([addressRef, contactRef], { y: "100%" });
      // Note: currentImageRef might not be set yet if MenuImages hasn't mounted, 
      // but usually it syncs up. We'll ensure it's set in the effect.
    }
  });

  onCleanup(() => {
    if (currentTl) currentTl.kill();
  });

  createEffect(() => {
    const columns = menuContainer?.querySelectorAll(".column");
    if (!columns || !menuContainer) return;

    if (currentTl) currentTl.kill();

    if (isMenuOpen()) {
      // OPEN ANIMATION
      gsap.set(menuContainer, { visibility: "visible" });
      lenis?.stop();

      // Reset elements for entrance
      gsap.set(columns, {
        scaleX: 1.1,
        scaleY: 1.05,
        rotate: -6,
        y: "100%",
        transformOrigin: "100% 0%",
      });
      
      gsap.set(linkRefs, { y: "100%" });
      
      // Reset image position for entrance
      if (currentImageRef) {
        gsap.set(currentImageRef, { y: "100%", opacity: 1 });
      }

      currentTl = gsap.timeline();
      
      // 1. Columns
      currentTl.to(columns, {
        y: "0%",
        rotate: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "circ.inOut",
      });

      // 2. Logo Color Change
      currentTl.add(() => {
        setLogoColor("text-gray");
      }, ">-0.1");

      // 3. Links
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

      // 4. Image (Animate the IMAGE, not the container)
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

      // 5. Footer Info
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
      // CLOSE ANIMATION
      if (!isVisible()) {
        currentTl = gsap.timeline({
          onComplete: () => {
            if (isPreloaderFinished() && !isVisible()) {
              lenis?.start();
            }
            if (menuContainer) gsap.set(menuContainer, { visibility: "hidden" });
          },
        });

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

        // Animate Image Out
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
      <MenuImages 
        imageRef={(el) => currentImageRef = el}
        src={activeImg().src}
        alt={activeImg().alt}
        isMenuOpen={isMenuOpen()}
      />

      {/* Foreground Text */}
      <ul class="navigation-center">
        <For each={NAV_LINKS}>
          {(item, index) => (
            <MenuLink
              href={item.href}
              label={item.label}
              ref={(el) => (linkRefs[index()] = el)}
              shouldShowUnderline={
                hoveredIndex() === index() || 
                (hoveredIndex() === null && !hasInteracted() && currentIndex() === index())
              }
              onMouseEnter={() => {
                setHoveredIndex(index());
                setHasInteracted(true);
                setActiveImg({ src: item.image, alt: item.label });
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                e.preventDefault();
                triggerTransition(item.href, undefined, undefined, () => {
                  if (menuContainer) {
                    menuContainer.style.visibility = "hidden";
                  }
                  setIsMenuOpen(false);
                });
              }}
            />
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
