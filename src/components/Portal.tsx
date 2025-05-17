import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

export default function PortalExample() {
  const [showModal, setShowModal] = createSignal(false);
  const [modalOutletRef, setModalOutletRef] = createSignal<HTMLDivElement>();
  const toggleModal = () => setShowModal(!showModal());

  return (
    // Root div styling is consistent with ForList and DynamicRender
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-neutral-800/50 space-y-6 sm:space-y-8">
      {/* Title styling matches ForList's Field.Label (acting as title) */}
      <h1 class="text-center text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider mb-4 sm:mb-6">
        Portal
      </h1>

      <div class="flex flex-col items-center space-y-6">
        <button
          onClick={toggleModal}
          class={`
            min-w-[180px]
            px-6 py-2.5
            rounded-full 
            text-sm sm:text-base
            font-semibold
            uppercase
            tracking-wider
            transition-colors duration-150 ease-in-out
            border-2

            /* Light Theme Button */
            bg-sky-500 hover:bg-sky-600 border-sky-500 hover:border-sky-600 text-white
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white
            
            /* Dark Theme Button */
            dark:bg-[#c2fe0c] dark:hover:bg-[#a8e00a] dark:border-[#c2fe0c] dark:hover:border-[#a8e00a] dark:text-black
            dark:focus:ring-offset-black
          `}
        >
          {showModal() ? "Hide" : "Show"} Portaled Content
        </button>

        <div
          id="my-modal-outlet"
          ref={setModalOutletRef}
          class="w-full border-2 border-dashed p-6 rounded-md 
                 border-sky-400 bg-sky-50 
                 dark:border-sky-600 dark:bg-neutral-900 
                 shadow-inner
                 min-h-48 flex flex-col justify-center" // Added min-height and flex for vertical centering of placeholder
        >
          <p class="text-center text-sm text-sky-700 dark:text-sky-300">
            I am a designated portal outlet.
            <Show when={!showModal()}>
              <span class="block mt-1">
                Click button to render content here.
              </span>
            </Show>
          </p>
        </div>
      </div>

      {/* This section demonstrates rendering content into the specific outlet div */}
      <Show when={showModal() && modalOutletRef()}>
        <Portal mount={modalOutletRef()}>
          {/* The portaled content will now sit inside the outlet, which has a fixed min-height.
              The existing placeholder <p> tag will be a sibling to this portaled div.
              To have the portaled content "replace" the placeholder, you'd conditionally render the placeholder.
              However, the current approach is to append, so the placeholder stays.
              The min-height on the outlet should be enough for both.
          */}
          <div class="bg-amber-100 dark:bg-amber-900/50 border border-amber-400 dark:border-amber-700 p-4 rounded-md mt-4 shadow">
            <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Content in Specific Outlet
            </h3>
          </div>
        </Portal>
      </Show>

      {/* Full-screen modal example (commented out) */}
      {/* 
      <Show when={showModal() && false}> 
        <Portal> 
          <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out animate-fade-in" />
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-lg shadow-2xl max-w-md w-full animate-modal-appear">
              <h2 class="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                Modal in document.body
              </h2>
              <p class="text-neutral-600 dark:text-neutral-300 mb-6">
                This content is rendered directly into document.body.
              </p>
              <div class="flex justify-end space-x-3">
                <button
                  onClick={() => console.log("Log Click!")}
                  class="px-4 py-2 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-sm font-medium rounded-md shadow-sm"
                >
                  Log Click
                </button>
                <button
                  onClick={toggleModal}
                  class="px-4 py-2 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white text-sm font-medium rounded-md shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
      */}
    </div>
  );
}
