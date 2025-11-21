import { createEffect, onMount, onCleanup } from "solid-js";
import gsap from "gsap";

type MenuImagesProps = {
  links: readonly { href: string; label: string; image: string }[];
  activeLinkIndex: number;
  hoveredLinkIndex: number | null;
  isOpen: boolean;
};

const MenuImages = (props: MenuImagesProps) => {
  let containerRef: HTMLDivElement | undefined;
  let currentImageRef: HTMLImageElement | undefined;
  let nextImageRef: HTMLImageElement | undefined;
  let imageTl: gsap.core.Timeline | undefined;

  // Initial setup
  onMount(() => {
    if (currentImageRef && props.links[0]) {
      currentImageRef.src = props.links[0].image;
      currentImageRef.alt = props.links[0].label;
      gsap.set(currentImageRef, { y: "100%", opacity: 1 });
    }
  });

  // Handle Menu Open/Close Animations
  createEffect(() => {
    if (!currentImageRef) return;

    if (props.isOpen) {
      // Set initial image based on active link or default
      const activeIndex = props.activeLinkIndex !== -1 ? props.activeLinkIndex : 0;
      const activeLink = props.links[activeIndex];
      
      if (activeLink) {
        currentImageRef.src = activeLink.image;
        currentImageRef.alt = activeLink.label;
      }

      // Animate in
      gsap.to(currentImageRef, {
        y: "0%",
        rotation: 0,
        transformOrigin: "100% 0%",
        duration: 0.3,
        ease: "slideUp",
        delay: 0.25, // Sync with other animations
      });
    } else {
      // Animate out
      gsap.to(currentImageRef, {
        y: "100%",
        rotation: -12,
        transformOrigin: "100% 0%",
        duration: 0.3,
        ease: "slideUp",
      });
    }
  });

  // Handle Hover Transitions
  createEffect(() => {
    const targetIndex = props.hoveredLinkIndex;
    
    if (targetIndex === null || !currentImageRef || !nextImageRef || !props.isOpen) return;

    const targetItem = props.links[targetIndex];
    
    if (!targetItem) return;

    if (imageTl && imageTl.isActive()) {
      imageTl.progress(1);
    }

    // Don't animate if it's the same image
    if (new URL(currentImageRef.src).pathname === targetItem.image) return;

    nextImageRef.src = targetItem.image;
    nextImageRef.alt = targetItem.label;
    gsap.set(nextImageRef, { y: "100%" });

    imageTl = gsap.timeline({
      onComplete: () => {
        if (currentImageRef && nextImageRef) {
            currentImageRef.src = nextImageRef.src;
            currentImageRef.alt = nextImageRef.alt;
            gsap.set(currentImageRef, { y: "0%" });
            gsap.set(nextImageRef, { y: "100%", src: "", alt: "" });
        }
      },
    });

    imageTl
      .to(nextImageRef, {
        y: "0%",
        duration: 0.6,
        ease: "slideUp",
      })
      .to(
        currentImageRef,
        {
          y: "-100%",
          duration: 0.6,
          ease: "slideUp",
        },
        "<"
      );
  });

  onCleanup(() => {
    if (imageTl) imageTl.kill();
    if (currentImageRef) gsap.killTweensOf(currentImageRef);
    if (nextImageRef) gsap.killTweensOf(nextImageRef);
  });

  return (
    <div ref={containerRef} class="navigation-images">
      <img
        ref={currentImageRef}
        src=""
        alt=""
        class="absolute w-full h-full object-cover"
      />
      <img
        ref={nextImageRef}
        src=""
        alt=""
        class="absolute w-full h-full object-cover translate-y-full"
      />
    </div>
  );
};

export default MenuImages;
