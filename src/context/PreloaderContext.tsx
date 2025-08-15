import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type Setter,
  type ParentComponent,
} from "solid-js";

type PreloaderContextType = {
  isFinished: Accessor<boolean>;
  setIsFinished: Setter<boolean>;
};

const PreloaderContext = createContext<PreloaderContextType>();

export const PreloaderProvider: ParentComponent = (props) => {
  const [isFinished, setIsFinished] = createSignal(false);

  return (
    <PreloaderContext.Provider value={{ isFinished, setIsFinished }}>
      {props.children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = () => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
};
