import { For, createEffect, onMount } from "solid-js";
import gsap from "gsap";
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
    { href: "/product", label: "PRODUCT" },
    { href: "/services", label: "SERVICES" },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
  ];

  let underlineRefs: (HTMLDivElement | undefined)[] = new Array(
    navLinks.length
  ).fill(undefined);
  let linkRefs: (HTMLLIElement | undefined)[] = new Array(navLinks.length).fill(
    undefined
  );

  let currentTl: gsap.core.Timeline | undefined;

  onMount(() => {
    if (column1 && column2 && column3 && column4 && menuContainer) {
      gsap.set([column1, column2, column3, column4], { y: "100%" });
      gsap.set(menuContainer, { display: "none" });
      gsap.set(linkRefs, { y: "100%" });
    }
  });

  createEffect(() => {
    if (!column1 || !column2 || !column3 || !column4 || !menuContainer) return;

    if (currentTl) currentTl.kill();

    if (props.isOpen) {
      gsap.set(menuContainer, { display: "block" });
      currentTl = gsap.timeline();
      currentTl.to([column1, column2, column3, column4], {
        y: "0%",
        duration: 0.4,
        stagger: 0.02,
        ease: "power3.inOut",
      });
      currentTl.to(
        linkRefs,
        {
          y: "0%",
          duration: 0.4,
          stagger: 0.02,
          ease: "power3.inOut",
        },
        "-=0.2"
      );
    } else {
      currentTl = gsap.timeline({
        onComplete: () => {
          gsap.set(menuContainer, { display: "none" });
        },
      });
      currentTl.to(linkRefs, {
        y: "100%",
        duration: 0.4,
        stagger: 0.02,
        ease: "power3.inOut",
      });
      currentTl.to(
        [column1, column2, column3, column4],
        {
          y: "100%",
          duration: 0.4,
          stagger: 0.02,
          ease: "power3.inOut",
        },
        "-=0.2"
      );
    }
  });

  return (
    <div ref={menuContainer} class="fixed inset-0 z-[50]">
      {/* Background Columns */}
      <div class="absolute inset-0">
        <div
          ref={column1}
          class="absolute h-full bg-black"
          style="left: 0%; width: 26%;"
        ></div>
        <div
          ref={column2}
          class="absolute h-full bg-black"
          style="left: 25%; width: 26%;"
        ></div>
        <div
          ref={column3}
          class="absolute h-full bg-black"
          style="left: 50%; width: 26%;"
        ></div>
        <div
          ref={column4}
          class="absolute h-full bg-black"
          style="left: 75%; width: 26%;"
        ></div>
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
                  onMouseEnter={() =>
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 1,
                      transformOrigin: "0% 50%",
                      duration: 0.3,
                    })
                  }
                  onMouseLeave={() =>
                    gsap.to(underlineRefs[index()]!, {
                      scaleX: 0,
                      transformOrigin: "100% 50%",
                      duration: 0.3,
                    })
                  }
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
    </div>
  );
};

export default MenuDrawer;
