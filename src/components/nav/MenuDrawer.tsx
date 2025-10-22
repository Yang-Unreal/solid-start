import { For, createEffect, onMount } from "solid-js";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import TextAnimation from "../TextAnimation";

type MenuDrawerProps = {
  isOpen: boolean;
  onClose?: () => void;
  onLogoutSuccess?: () => void;
  session?: any;
  menuButtonRef?: HTMLElement;
};

const MenuDrawer = (props: MenuDrawerProps) => {
  let column1: HTMLDivElement | undefined;
  let column2: HTMLDivElement | undefined;
  let column3: HTMLDivElement | undefined;
  let column4: HTMLDivElement | undefined;
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
  let imageQueue: { image: string; alt: string }[] = [];
  let lastQueued: { image: string; alt: string } | null = null;
  let hoverTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentIsFinal = false;

  CustomEase.create("custom", "M0,0 C0.343,0.923 0.137,1.011 1,1 ");

  const startTransition = (isFinal = false) => {
    if (imageQueue.length === 0 && !lastQueued) return;
    if (!currentImageRef || !nextImageRef) return;

    currentIsFinal = isFinal;

    // Kill any active timeline for final animation to ensure normal speed
    if (isFinal && imageTl) {
      imageTl.kill();
    }

    const itemToAnimate =
      imageQueue.length > 0 ? imageQueue.shift()! : lastQueued!;
    lastQueued = null;

    if (new URL(currentImageRef.src).pathname === itemToAnimate.image) {
      startTransition(isFinal); // skip if same, process next
      return;
    }

    nextImageRef.src = itemToAnimate.image;
    nextImageRef.alt = itemToAnimate.alt;
    gsap.set(nextImageRef, { y: "100%", opacity: 0 });

    const duration = 0.3; // faster for queued, normal for final

    imageTl = gsap.timeline({
      onComplete: () => {
        const tempSrc = currentImageRef!.src;
        const tempAlt = currentImageRef!.alt;
        currentImageRef!.src = nextImageRef!.src;
        currentImageRef!.alt = nextImageRef!.alt;
        nextImageRef!.src = tempSrc;
        nextImageRef!.alt = tempAlt;

        gsap.set(currentImageRef, { y: "0%", opacity: 1 });
        gsap.set(nextImageRef, {
          y: "100%",
          opacity: 0,
        });

        if (imageQueue.length > 0) {
          startTransition(false); // continue with fast speed
        }
      },
    });

    imageTl
      .to(nextImageRef, {
        y: "0%",
        opacity: 1,
        duration,
        ease: "custom",
      })
      .to(
        currentImageRef,
        {
          y: "-100%",
          opacity: 0,
          duration,
          ease: "custom",
        },
        "<"
      );
  };
  onMount(() => {
    if (column1 && column2 && column3 && column4 && menuContainer) {
      gsap.set([column1, column2, column3, column4], {
        y: "100%",
        clipPath: "polygon(0% 8%, 100% 0%, 100% 100%, 0% 100%)",
      });
      gsap.set(menuContainer, { display: "none" });
      gsap.set(linkRefs, { y: "100%" });
      gsap.set([addressRef, contactRef], { y: "100%" });
      if (currentImageRef) {
        currentImageRef.src = navLinks[0].image;
        currentImageRef.alt = navLinks[0].label;
        gsap.set(currentImageRef, { opacity: 1 });
      }
    }
  });

  createEffect(() => {
    if (!column1 || !column2 || !column3 || !column4 || !menuContainer) return;

    if (currentTl) currentTl.kill();

    // Update default image based on current route
    const currentPath = window.location.pathname;
    const currentLink =
      navLinks.find((link) => link.href === currentPath) || navLinks[0];
    if (currentImageRef && currentLink) {
      currentImageRef.src = currentLink.image;
      currentImageRef.alt = currentLink.label;
    }

    if (props.isOpen) {
      gsap.set(menuContainer, { display: "block" });
      currentTl = gsap.timeline();
      currentTl.to([column1, column2, column3, column4], {
        y: "0%",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
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
          ease: "power3.inOut",
        },
        "-=0.2"
      );
      currentTl.to(
        [addressRef, contactRef],
        {
          y: "0%",
          rotation: 0,
          transformOrigin: "0% 0%",
          duration: 0.4,
          stagger: 0.05,
          ease: "power3.inOut",
        },
        "-=0.4"
      );
    } else {
      currentTl = gsap.timeline({
        onComplete: () => {
          gsap.set(menuContainer, { display: "none" });
        },
      });
      currentTl.to(linkRefs, {
        y: "100%",
        rotation: -12,
        transformOrigin: "100% 0%",
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.inOut",
      });
      currentTl.to(
        [addressRef, contactRef],
        {
          y: "100%",
          rotation: 12,
          transformOrigin: "0% 0%",
          duration: 0.4,
          stagger: 0.05,
          ease: "power3.inOut",
        },
        "-=0.4"
      );
      currentTl.to(
        [column1, column2, column3, column4],
        {
          y: "100%",
          clipPath: "polygon(0% 8%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.4,
          stagger: 0.02,
          ease: "circ.inOut",
        },
        "-=0.4"
      );
    }
  });

  return (
    <div ref={menuContainer} class="fixed inset-0 z-[50]">
      {/* Background Columns */}
      <div class="absolute inset-0">
        <div
          ref={column1}
          class="absolute h-full bg-dark"
          style="left: 0%; width: 26%;"
        ></div>
        <div
          ref={column2}
          class="absolute h-full bg-dark"
          style="left: 25%; width: 26%;"
        ></div>
        <div
          ref={column3}
          class="absolute h-full bg-dark"
          style="left: 50%; width: 26%;"
        ></div>
        <div
          ref={column4}
          class="absolute h-full bg-dark"
          style="left: 75%; width: 26%;"
        ></div>
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
          class="absolute w-full h-full object-cover opacity-0"
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
                  onMouseEnter={() => {
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    });

                    if (!currentImageRef) return;

                    const isAlreadyQueued = imageQueue.some(
                      (queued) => queued.image === item.image
                    );
                    const isCurrentImage =
                      new URL(currentImageRef.src).pathname === item.image;

                    if (
                      isAlreadyQueued ||
                      (isCurrentImage && (!imageTl || !imageTl.isActive()))
                    ) {
                      return;
                    }

                    imageQueue.push({ image: item.image, alt: item.label });

                    // Clear any pending final animation
                    if (hoverTimeoutId) {
                      clearTimeout(hoverTimeoutId);
                      hoverTimeoutId = null;
                    }

                    if (imageTl && imageTl.isActive() && !currentIsFinal) {
                      imageTl.timeScale(5); // speed up more, but not if it's the final animation
                    } else {
                      startTransition();
                    }
                  }}
                  onMouseLeave={() => {
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    });

                    // On leave, schedule final animation if queue has items
                    if (imageQueue.length > 0 && !hoverTimeoutId) {
                      lastQueued = imageQueue[imageQueue.length - 1]!;
                      imageQueue = [];
                      hoverTimeoutId = setTimeout(() => {
                        startTransition(true); // final with normal speed
                        hoverTimeoutId = null;
                      }, 100); // small delay to allow for quick re-hover
                    }
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
