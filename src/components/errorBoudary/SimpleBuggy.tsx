import { Component } from "solid-js";

interface SimpleBuggyProps {
  shouldThrow?: boolean;
  id?: string | number;
}

const SimpleBuggy: Component<SimpleBuggyProps> = (props) => {
  if (props.shouldThrow) {
    console.log("SimpleBuggy: Throwing a render error now!");
    throw new Error("Simulated RENDER error from SimpleBuggy!");
  }

  return (
    <div class="p-4 bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-600 rounded-md">
      <p class="text-green-700 dark:text-green-200">
        Hello from SimpleBuggy! I am working fine.
      </p>
    </div>
  );
};

export default SimpleBuggy;
