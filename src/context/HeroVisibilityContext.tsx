import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
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
