import { createEffect, createSignal, on } from "solid-js";
import gsap from "gsap";

type MenuImagesProps = {
  src: string;
  alt: string;
  isMenuOpen: boolean;
  // Expose the primary image ref for parent animations (entrance/exit)
  imageRef?: (el: HTMLImageElement) => void;
  // Container ref if needed
  containerRef?: (el: HTMLDivElement) => void;
};

const MenuImages = (props: MenuImagesProps) => {
  let currentImageRef: HTMLImageElement | undefined;
  let nextImageRef: HTMLImageElement | undefined;
  let tl: gsap.core.Timeline | undefined;

  // We track the displayed source separately to control the swap timing
  const [displayedSrc, setDisplayedSrc] = createSignal(props.src);
  const [displayedAlt, setDisplayedAlt] = createSignal(props.alt);

  createEffect(on(() => props.src, (targetSrc) => {
    const targetAlt = props.alt;

    if (!currentImageRef || !nextImageRef) return;

    // If the source is effectively the same, do nothing.
    if (displayedSrc() === targetSrc) {
      return;
    }

    // If menu is not open, update immediately without animation
    if (!props.isMenuOpen) {
      setDisplayedSrc(targetSrc);
      setDisplayedAlt(targetAlt);
      return;
    }

    // If a transition is active, fast-forward it
    if (tl && tl.isActive()) {
      tl.progress(1);
    }

    // Prepare next image
    nextImageRef.src = targetSrc;
    nextImageRef.alt = targetAlt;
    gsap.set(nextImageRef, { y: "100%" });

    // Animate swap
    tl = gsap.timeline({
      onComplete: () => {
        setDisplayedSrc(targetSrc);
        setDisplayedAlt(targetAlt);
        gsap.set(currentImageRef!, { y: "0%" });
        gsap.set(nextImageRef!, { y: "100%", src: "", alt: "" });
      },
    });

    tl.to(nextImageRef, {
      y: "0%",
      duration: 0.6,
      ease: "slideUp",
    }).to(
      currentImageRef,
      {
        y: "-100%",
        duration: 0.6,
        ease: "slideUp",
      },
      "<"
    );
  }));

  return (
    <div ref={props.containerRef} class="navigation-images">
      <img
        ref={(el) => {
          currentImageRef = el;
          props.imageRef?.(el);
        }}
        src={displayedSrc()}
        alt={displayedAlt()}
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
