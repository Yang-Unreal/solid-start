import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  createEffect,
  onCleanup,
} from "solid-js";

interface HeroVisibilityContextType {
  isHeroVisible: Accessor<boolean>;
  setHeroVisible: (visible: boolean) => void;
}

const HeroVisibilityContext = createContext<
  HeroVisibilityContextType | undefined
>(undefined);

export function HeroVisibilityProvider(props: any) {
  const [isHeroVisible, setHeroVisible] = createSignal(true);

  createEffect(() => {
    const handleScroll = () => {
      setHeroVisible(window.scrollY < window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll);
    });
  });

  const value = {
    isHeroVisible,
    setHeroVisible,
  };

  return (
    <HeroVisibilityContext.Provider value={value}>
      {props.children}
    </HeroVisibilityContext.Provider>
  );
}

export function useHeroVisibility() {
  const context = useContext(HeroVisibilityContext);
  if (context === undefined) {
    throw new Error(
      "useHeroVisibility must be used within a HeroVisibilityProvider"
    );
  }
  return context;
}
