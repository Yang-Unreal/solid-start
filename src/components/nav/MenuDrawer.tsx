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

  onMount(() => {
    if (column1 && column2 && column3 && column4 && menuContainer) {
      gsap.set([column1, column2, column3, column4], { y: "100%" });
      gsap.set(menuContainer, { display: "none" });
    }
  });

  createEffect(() => {
    if (!column1 || !column2 || !column3 || !column4 || !menuContainer) return;

    if (props.isOpen) {
      gsap.set(menuContainer, { display: "block" });
      gsap.to([column1, column2, column3, column4], {
        y: "0%",
        duration: 0.8,
        stagger: 0.02,
        ease: "power3.inOut",
      });
    } else {
      gsap.to([column1, column2, column3, column4], {
        y: "100%",
        duration: 0.8,
        stagger: 0.02,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(menuContainer, { display: "none" });
        },
      });
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
      <div class="relative flex h-full items-center justify-center text-white">
        <ul class="flex flex-col items-center  text-center md:flex-row md:space-x-20">
          <For each={navLinks}>
            {(item) => (
              <li>
                <a href={item.href} class="block text-8xl font-formula-bold">
                  <TextAnimation
                    originalColor="rgba(192, 202, 201, 1)"
                    duplicateColor="rgba(241, 241, 241, 1)"
                    text={item.label}
                  />
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
