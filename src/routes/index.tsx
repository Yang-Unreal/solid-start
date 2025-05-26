import Counter from "~/components/Counter";
import { Avatar } from "~/components/Avatar";
import { Controlled } from "~/components/switch/Controlled";
import { ErrorBoundary } from "solid-js";
import ForList from "~/components/list/For";
import IndexList from "~/components/list/Index";
import PortalExample from "~/components/Portal";
import Login from "~/components/errorBoudary/Login";
import AnimeTimer from "~/components/AnimeTimer";
import DynamicRender from "~/components/DynamicRender";
import { RefsExample } from "~/components/RefsExample";

export default function Home() {
  return (
    <main class=" bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <div class="card-wrapper">
          <Counter />
          <Avatar
            name="Yang Yang"
            src="https://minio.limingcn.com/bun/cloud.jpg"
            size="md"
          />
          <Controlled />
        </div>
        <div class="card-content-host">
          <DynamicRender />
        </div>
        <div class="card-content-host">
          <ForList />
        </div>
        <div class="card-content-host">
          <IndexList />
        </div>

        <div class="card-content-host">
          <PortalExample />
        </div>

        {/* <div class="card-error-boundary-host">
          <ErrorBoundary
            fallback={(e, reset) => (
              <div class="text-center flex flex-col h-full justify-center">
                <h1 class="text-2xl font-medium text-neutral-800 dark:text-neutral-200 mb-2">
                  Error Occurred
                </h1>
                <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                  Something went wrong:
                </h3>
                <div class="border border-red-300 dark:border-red-500/70 p-4 rounded-md bg-red-50 dark:bg-red-900/30">
                  <p class="text-sm text-red-700 dark:text-red-300">
                    {e.message}
                  </p>
                </div>
              </div>
            )}
          >
            <Login />
          </ErrorBoundary>
        </div> */}
        <div class="card-content-host">
          <RefsExample />
        </div>
        <div class="card-wrapper">
          <AnimeTimer />
        </div>
      </div>
    </main>
  );
}
