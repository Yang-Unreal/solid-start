import { Component, ErrorBoundary, JSX } from "solid-js";

interface BasicErrorBoundaryProps {
  children: JSX.Element;
  onReset?: () => void;
}

const BasicErrorBoundary: Component<BasicErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div
          class="p-6 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 rounded-md shadow-lg"
          role="alert"
        >
          <h3 class="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Oops! Something went wrong.
          </h3>
          <p class="text-red-700 dark:text-red-300 mb-4">
            Error:{" "}
            <code class="bg-red-200 dark:bg-red-800 px-1 rounded text-sm">
              {err.toString()}
            </code>
          </p>
          <button
            onClick={() => {
              reset();
              props.onReset?.();
            }}
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    >
      {props.children}
    </ErrorBoundary>
  );
};

export default BasicErrorBoundary;
