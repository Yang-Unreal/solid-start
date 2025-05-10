import { A } from "@solidjs/router";
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

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <Counter />
      <p class="mt-8">
        Visit{" "}
        <a
          href="https://solidjs.com"
          target="_blank"
          class="text-sky-600 hover:underline"
        >
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
      <p class="my-4">
        <span>Home</span>
        {" - "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>{" "}
      </p>
      <div class="flex w-full justify-center">
        <Avatar
          name="Yang Yang"
          src="https://minio.limingcn.com/bun/cloud.jpg"
        />
      </div>

      <div class="flex w-full justify-center mt-5">
        <Controlled />
      </div>
      <div class="container mx-auto p-4">
        <DynamicRender />
      </div>
      <div>
        <ForList />
        <IndexList />
      </div>
      <div>
        <PortalExample />
      </div>
      <div class="container mx-auto p-4">
        <div class="bg-slate-100 dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-4">
          <ErrorBoundary
            fallback={(e) => (
              <>
                <h2 class="text-4xl font-bold text-sky-700 dark:text-sky-400">
                  Error Boundary Test
                </h2>
                <div class="border-2 border-dashed border-sky-400 dark:border-sky-600 p-6 rounded-lg bg-white dark:bg-slate-700 shadow">
                  <p class="text-slate-700 dark:text-slate-300">{e.message}</p>
                </div>
              </>
            )}
          >
            <Login />
          </ErrorBoundary>
        </div>
      </div>
      <div class=" container mx-auto flex relative flex-row p-4 gap-4">
        <AnimeTimer />
        <AnimeTimer />
      </div>
    </main>
  );
}
