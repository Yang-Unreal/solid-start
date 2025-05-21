import { createContext, useContext, Accessor, Setter } from "solid-js";

// The data we want to share
interface CounterContextValue {
  count: Accessor<number>;
  setCount: Setter<number>;
}

// Create the context. We can provide a default for type inference,
// but we'll throw an error if used outside a provider.
const CounterContext = createContext<CounterContextValue | undefined>(
  undefined
);

export function useCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context;
}

export default CounterContext;
