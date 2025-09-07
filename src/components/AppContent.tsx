import { Suspense, createSignal } from "solid-js";
import Nav from "./nav/Nav";
import MenuDrawer from "./nav/MenuDrawer";
import { useAuth } from "~/context/AuthContext";

export function AppContent(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [menuButtonRef, setMenuButtonRef] = createSignal<HTMLElement>();
  const { session, handleLogoutSuccess } = useAuth();

  return (
    <>
      <Nav
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
      <div
        class={`fixed inset-0 bg-black/80 z-30 transition-opacity duration-300 ${
          isMenuOpen() ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen()}
      />
      <main class="flex-grow">
        <Suspense fallback={null}>{props.children}</Suspense>
      </main>
    </>
  );
}
