import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

export default function PortalExample() {
  const [showModal, setShowModal] = createSignal(false);
  const [modalOutletRef, setModalOutletRef] = createSignal<HTMLDivElement>();
  const toggleModal = () => setShowModal(!showModal());

  const handleBackgroundClick = () => {
    console.log("Clicked on the component that owns the portal definition.");
  };

  return (
    <div
      onClick={handleBackgroundClick}
      class="container mx-auto p-4 transition-colors duration-300 "
    >
      <div class="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-sky-700 dark:text-sky-400">
            SolidJS Portal with Tailwind CSS v4
          </h1>
        </header>

        <div class="flex justify-center mb-6">
          <button
            onClick={toggleModal}
            class="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
          >
            {showModal() ? "Hide" : "Show"} Modal & Content
          </button>
        </div>

        <div
          id="my-modal-outlet"
          ref={setModalOutletRef}
          class="border-2 border-dashed border-sky-400 dark:border-sky-600 p-6 rounded-lg bg-white dark:bg-slate-700 shadow"
        >
          <p class="text-slate-700 dark:text-slate-300">
            I am a designated portal outlet. Content below (if modal is open)
            will be rendered here via Portal.
          </p>
        </div>

        {/* <Show when={showModal()}>
          <Portal>
            <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ease-out" />

            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div class="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out scale-95 opacity-0 animate-modal-appear">
                <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                  Modal in document.body
                </h2>
                <p class="text-slate-600 dark:text-slate-300 mb-6">
                  This content is rendered directly into document.body via
                  Portal and styled with Tailwind.
                </p>
                <div class="flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      console.log("Log Click button inside portal clicked!")
                    }
                    class="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                  >
                    Log Click
                  </button>
                  <button
                    onClick={toggleModal}
                    class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        </Show> */}

        <Show when={showModal() && modalOutletRef()}>
          <Portal mount={modalOutletRef()}>
            <div class="bg-amber-100 dark:bg-amber-800 border border-amber-300 dark:border-amber-700 p-4 rounded-md mt-4 shadow">
              <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Content in Specific Outlet
              </h3>
              <p class="text-amber-700 dark:text-amber-300">
                This content is rendered inside the 'my-modal-outlet' div using
                Tailwind.
              </p>
            </div>
          </Portal>
        </Show>
      </div>
    </div>
  );
}
