import {
  createContext,
  createSignal,
  useContext,
  type ParentComponent,
} from "solid-js";

interface TransitionContextType {
  trigger: () => boolean;
  setTrigger: (value: boolean) => void;
  isAnimating: () => boolean;
  setIsAnimating: (value: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType>();

export const TransitionProvider: ParentComponent = (props) => {
  const [trigger, setTrigger] = createSignal(false);
  const [isAnimating, setIsAnimating] = createSignal(false);

  const value: TransitionContextType = {
    trigger,
    setTrigger,
    isAnimating,
    setIsAnimating,
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
