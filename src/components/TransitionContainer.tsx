// // src/components/TransitionContainer.tsx

// import { createEffect } from "solid-js";
// import { useNavigate } from "@solidjs/router";
// import gsap from "gsap";
// import { useTransition } from "~/context/TransitionContext";

// export default function TransitionContainer() {
//   const {
//     isAnimating,
//     setIsAnimating,
//     pendingPath,
//     setPendingPath,
//     transitionType,
//   } = useTransition();
//   const navigate = useNavigate();

//   const animateNavigation = (path: string) => {
//     if (!containerRef) return;
//     const columns = containerRef.querySelectorAll(".column");
//     if (columns) {
//       // FIX: Instantly set the columns to their starting position to prevent flash
//       gsap.set(columns, { y: "100%" });

//       const tl = gsap.timeline({
//         onComplete: () => {
//           setIsAnimating(false);
//           setPendingPath(null);
//         },
//       });

//       // Animate IN
//       tl.fromTo(
//         columns,
//         {
//           clipPath: "polygon(0% 8%, 100% 0%, 100% 100%, 0% 100%)",
//         },
//         {
//           y: "0%",
//           clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
//           duration: 0.6,
//           ease: "circ.inOut",
//           stagger: 0.03,
//         }
//       )
//         .call(() => {
//           navigate(path);
//         })
//         // Animate OUT
//         .to(columns, {
//           y: "-100%",
//           clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 92%)",
//           duration: 0.6,
//           ease: "circ.inOut",
//           stagger: 0.03,
//         });
//     }
//   };

//   createEffect(() => {
//     if (isAnimating()) {
//       if (transitionType() === "preloader") {
//         // This is now handled by Preloader.tsx to avoid race conditions.
//         // We just need to signal that the animation is complete.
//         setIsAnimating(false);
//       } else {
//         const path = pendingPath();
//         if (path) {
//           animateNavigation(path);
//         }
//       }
//     }
//   });

//   return (
//     <div
//       id="transition-container"
//       ref={containerRef}
//       class="transition-container"
//     >
//       <div class="column absolute h-full bg-darkgray top-0 left-0 w-[26%]"></div>
//       <div class="column absolute h-full bg-darkgray top-0 left-[25%] w-[26%]"></div>
//       <div class="column absolute h-full bg-darkgray top-0 left-[50%] w-[26%]"></div>
//       <div class="column absolute h-full bg-darkgray top-0 left-[75%] w-[26%]"></div>
//     </div>
//   );
// }
