import { createContext, useContext } from "solid-js";
import type { Accessor, Setter } from "solid-js";

interface CounterContextValue {
	count: Accessor<number>;
	setCount: Setter<number>;
}

const CounterContext = createContext<CounterContextValue | undefined>(
	undefined,
);

export function useCounter() {
	const context = useContext(CounterContext);
	if (!context) {
		throw new Error("useCounter must be used within a CounterProvider");
	}
	return context;
}

export default CounterContext;
