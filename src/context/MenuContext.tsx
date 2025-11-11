import { createContext, createSignal, useContext } from "solid-js";

interface MenuContextType {
  isMenuOpen: () => boolean;
  setIsMenuOpen: (value: boolean) => void;
  menuButtonRef: () => HTMLElement | undefined;
  setMenuButtonRef: (el: HTMLElement | undefined) => void;
}

const MenuContext = createContext<MenuContextType>();

export function MenuProvider(props: { children: any }) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [menuButtonRef, setMenuButtonRef] = createSignal<HTMLElement>();

  const value: MenuContextType = {
    isMenuOpen,
    setIsMenuOpen,
    menuButtonRef,
    setMenuButtonRef,
  };

  return (
    <MenuContext.Provider value={value}>{props.children}</MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
