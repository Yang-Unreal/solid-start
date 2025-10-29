import {
  createContext,
  createSignal,
  useContext,
  type ParentComponent,
} from "solid-js";

type TransitionType = "preloader" | "navigation";

interface TransitionContextType {
  isAnimating: () => boolean;
  pendingPath: () => string | null;
  transitionType: () => TransitionType;
  startTransition: (path: string) => void;
  triggerPreloader: () => void;
  setIsAnimating: (value: boolean) => void;
  setPendingPath: (path: string | null) => void;
}

const TransitionContext = createContext<TransitionContextType>();

export const TransitionProvider: ParentComponent = (props) => {
  const [isAnimating, setIsAnimating] = createSignal(false);
  const [pendingPath, setPendingPath] = createSignal<string | null>(null);
  const [transitionType, setTransitionType] =
    createSignal<TransitionType>("preloader");

  const startTransition = (path: string) => {
    if (isAnimating()) return;
    setTransitionType("navigation");
    setIsAnimating(true);
    setPendingPath(path);
  };

  const triggerPreloader = () => {
    if (isAnimating()) return;
    setTransitionType("preloader");
    setIsAnimating(true);
  };

  const value: TransitionContextType = {
    isAnimating,
    pendingPath,
    transitionType,
    startTransition,
    triggerPreloader,
    setIsAnimating,
    setPendingPath,
  };

  return (
    <TransitionContext.Provider value={value}>
      {props.children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
};
