import { For, createEffect, onMount } from "solid-js";
import gsap from "gsap";
import TextAnimation from "../TextAnimation";
import { useLenis } from "~/context/LenisContext";

type MenuDrawerProps = {
  isOpen: boolean;
  onClose?: () => void;
  onLogoutSuccess?: () => void;
  session?: any;
  menuButtonRef?: HTMLElement;
};

const MenuDrawer = (props: MenuDrawerProps) => {
  const lenis = useLenis();

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

    if (props.isOpen) {
      // Update default image based on current route when opening
      const currentPath = window.location.pathname;
      const currentLink =
        navLinks.find((link) => link.href === currentPath) || navLinks[0];
      if (currentImageRef && currentLink) {
        currentImageRef.src = currentLink.image;
        currentImageRef.alt = currentLink.label;
      }
      gsap.set(menuContainer, { display: "block" });

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
      currentTl = gsap.timeline({
        onComplete: () => {
          lenis?.start();
        },
      });
      currentTl.to(linkRefs, {
        y: "100%",
        rotation: -12,
        transformOrigin: "100% 0%",
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(1)",
      });
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
        "-=0.4"
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
          "-=0.4.5"
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
        "-=0.4"
      );
    }
  });

  return (
    <div ref={menuContainer} class="fixed inset-0 z-50">
      {/* Background Columns */}
      <div class="menu-columns">
        <div class="column flex w-full h-full bg-dark rounded"></div>
        <div class="column flex w-full h-full bg-dark rounded"></div>
        <div class="column w-full h-full bg-dark rounded hidden sm:block"></div>
        <div class="column w-full h-full bg-dark rounded hidden sm:block"></div>
      </div>

      {/* Image Container */}
      <div
        ref={imageContainerRef}
        class="absolute left-1/2 top-1/2 w-[20vw] h-[calc(20vw*1.33)] flex items-center justify-center overflow-hidden transform -translate-x-1/2 -translate-y-1/2"
      >
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
      <div class="relative flex h-full items-center justify-center text-white ">
        <ul class="flex flex-col items-center  text-center md:flex-row md:space-x-20 overflow-hidden">
          <For each={navLinks}>
            {(item, index) => (
              <li ref={(el) => (linkRefs[index()] = el)}>
                <a
                  href={item.href}
                  class="relative block text-8xl font-formula-bold"
                  onClick={() => props.onClose?.()}
                  onMouseEnter={() => {
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
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
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });
                  }}
                >
                  <TextAnimation
                    originalColor="rgba(192, 202, 201, 1)"
                    duplicateColor="rgba(241, 241, 241, 1)"
                    text={item.label}
                  />
                  <div
                    ref={(el) => (underlineRefs[index()] = el)}
                    class="absolute bottom-0 left-0 w-full h-px bg-current scale-x-0"
                  ></div>
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div class="absolute flex justify-between w-full bottom-[10%] px-3 lg:px-25 text-center font-formula-bold overflow-hidden">
        <div ref={addressRef}>
          <span class="text-sm xl:text-xl text-gray-text">ADDRESS</span>
          <h4 class="text-xl xl:text-2xl text-gray">TAIZHOU,ZHEJIANG,CHINA</h4>
        </div>
        <div ref={contactRef}>
          <span class="text-sm xl:text-xl text-gray-text">CONTACT</span>
          <TextAnimation
            originalColor="rgba(192, 202, 201, 1)"
            duplicateColor="rgba(241, 241, 241, 1)"
            text="YANG@LIMINGCN.COM"
            class="text-xl xl:text-2xl"
            isCopyable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuDrawer;
