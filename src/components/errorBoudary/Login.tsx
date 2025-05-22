import { createSignal, onMount } from "solid-js";

export default function Login() {
  const [shouldError, setShouldError] = createSignal(false);

  // Example: Trigger error after a short delay or based on a prop
  onMount(() => {
    // Simulate a condition that leads to an error
    setTimeout(() => {
      setShouldError(true);
    }, 100); // Or trigger based on a prop, context, etc.
  });

  if (shouldError()) {
    throw new Error("Login has broken due to a condition!");
  }

  return <div>This is the Login component.</div>;
}
