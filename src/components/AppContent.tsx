import { Suspense, createSignal, onMount } from "solid-js";
import Nav from "./nav/Nav";
import MenuDrawer from "./nav/MenuDrawer";
import MenuButton from "./nav/MenuButton";
import { useAuth } from "~/context/AuthContext";
import Preloader from "./Preloader";
import gsap from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
// import TransitionContainer from "./TransitionContainer";

export function AppContent(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [menuButtonRef, setMenuButtonRef] = createSignal<HTMLElement>();
  const { session, handleLogoutSuccess } = useAuth();

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(CustomEase);

    // Create custom easings
    CustomEase.create("custom", "M0,0 C0.25,0.1 0.25,1 1,1");
    CustomEase.create("slideUp", "M0,0 C0.343,0.923 0.137,1.011 1,1 ");
  });

  return (
    <>
      <Preloader />
      {/* <TransitionContainer /> */}
      <Nav
        isMenuOpen={isMenuOpen()}
        setIsMenuOpen={setIsMenuOpen}
        setMenuButtonRef={setMenuButtonRef}
      />
      <MenuButton
        isMenuOpen={isMenuOpen()}
        setIsMenuOpen={setIsMenuOpen}
        setMenuButtonRef={setMenuButtonRef}
      />
      <MenuDrawer
        isOpen={isMenuOpen()}
        onClose={() => setIsMenuOpen(false)}
        onLogoutSuccess={handleLogoutSuccess}
        session={session}
        menuButtonRef={menuButtonRef()}
      />
      <main class="grow">
        <Suspense fallback={null}>{props.children}</Suspense>
      </main>
    </>
  );
}
