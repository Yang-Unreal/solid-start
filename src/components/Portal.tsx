import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

export default function PortalExample() {
  const [showModal, setShowModal] = createSignal(false);
  const [modalOutletRef, setModalOutletRef] = createSignal<HTMLDivElement>();
  const toggleModal = () => setShowModal(!showModal());

  return (
    <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg space-y-6 sm:space-y-8">
      <h1 class="text-center text-2xl font-medium text-neutral-800 dark:text-neutral-200 mb-6">
        Portal
      </h1>

      <div class="flex flex-col items-center space-y-6">
        <button
          onClick={toggleModal}
          class="min-w-[220px] px-5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black bg-[#c2fe0c] text-black hover:bg-[#a8e00a] focus:ring-[#c2fe0c]"
        >
          {showModal() ? "Hide" : "Show"} Portaled Content
        </button>

        <div
          id="my-modal-outlet"
          ref={setModalOutletRef}
          class="w-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30 rounded-lg p-6 h-32 flex flex-col justify-center items-center"
        >
          <p class="text-center text-sm text-neutral-600 dark:text-neutral-300">
            I am a designated portal outlet.
          </p>
        </div>
      </div>

      <Show when={showModal() && modalOutletRef()}>
        <Portal mount={modalOutletRef()}>
          <div class="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700/50 p-4 rounded-lg shadow-sm w-full mt-4">
            <h3 class="text-lg font-medium text-sky-700 dark:text-sky-200 mb-1.5">
              Content in Specific Outlet
            </h3>
          </div>
        </Portal>
      </Show>
    </div>
  );
}
