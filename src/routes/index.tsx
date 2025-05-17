import Counter from "~/components/Counter";
import { Avatar } from "~/components/Avatar";
import { Controlled } from "~/components/switch/Controlled";
import { ErrorBoundary } from "solid-js";
import ForList from "~/components/list/For";
import IndexList from "~/components/list/Index"; // Assuming IndexList is similar to ForList
import PortalExample from "~/components/Portal";
import Login from "~/components/errorBoudary/Login";
import AnimeTimer from "~/components/AnimeTimer";
import DynamicRender from "~/components/DynamicRender";

export default function Home() {
  const wrapperCardClass =
    "bg-white dark:bg-black rounded-lg shadow-lg dark:shadow-xl dark:shadow-neutral-950/50 p-6 flex flex-col items-center justify-center space-y-6 text-center min-h-[300px] h-full";
  const contentHostCardClass =
    "bg-white dark:bg-black rounded-lg shadow-lg dark:shadow-xl dark:shadow-neutral-950/50 h-full overflow-hidden";

  return (
    <main class="bg-neutral-100 dark:bg-neutral-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Card 1: Basic Interactive Components */}
        <div class={wrapperCardClass}>
          <h2 class="text-xl font-semibold text-sky-600 dark:text-sky-400">
            Counter
          </h2>
          <Counter />
          <Avatar
            name="Yang Yang"
            src="https://minio.limingcn.com/bun/cloud.jpg"
            size="md"
          />
          <Controlled />
        </div>

        {/* Card 2: DynamicRender */}
        {/* Assuming DynamicRender's outermost div can be a direct grid item.
            If DynamicRender has `mx-auto` or fixed `mt-10` on its root,
            those should be removed from DynamicRender.tsx for it to behave as a grid child.
            Alternatively, wrap it: */}
        <div class={contentHostCardClass}>
          {/* The p-6 etc. from DynamicRender's original root now applies to contentHostCardClass */}
          <DynamicRender />
        </div>

        {/* Card 3: ForList */}
        <div class={contentHostCardClass}>
          <ForList />
        </div>

        {/* Card 4: IndexList (Assuming similar structure to ForList) */}
        <div class={contentHostCardClass}>
          <IndexList />
        </div>

        {/* Card 5: Portal Example */}
        <div class={contentHostCardClass}>
          <PortalExample />
        </div>

        {/* Card 6: ErrorBoundary Test */}
        <div class={contentHostCardClass}>
          <div class="p-6 sm:p-8 bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 rounded-lg space-y-6 sm:space-y-8">
            <ErrorBoundary
              fallback={(
                e,
                reset // Added reset for potential use
              ) => (
                <div class="text-center">
                  <h1 class=" text-3xl sm:text-4xl font-bold text-sky-600 dark:text-[#c2fe0c] uppercase tracking-wider mb-4 sm:mb-6">
                    Error Boundary
                  </h1>
                  <h3 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Something went wrong:
                  </h3>
                  <div class="border-2 border-dashed border-red-400 dark:border-red-500 p-4 rounded-md bg-red-50 dark:bg-neutral-800 shadow-inner">
                    <p class="text-sm text-red-700 dark:text-red-300">
                      {e.message}
                    </p>
                  </div>
                </div>
              )}
            >
              <Login />
            </ErrorBoundary>
          </div>
        </div>

        {/* Card 7: AnimeTimer */}
        <div class={wrapperCardClass}>
          <h2 class="text-xl font-semibold text-sky-600 dark:text-sky-400">
            Animation Timer
          </h2>
          {/* AnimeTimer might need internal styling to fit well in a centered flex card */}
          <AnimeTimer />
        </div>
      </div>
    </main>
  );
}
