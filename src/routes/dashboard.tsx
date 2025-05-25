import { createEffect, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { UserCircle } from "lucide-solid";

export default function DashboardPage() {
  const session = authClient.useSession();
  const navigate = useNavigate();

  createEffect(() => {
    const currentSessionState = session();
    if (!currentSessionState.isPending && !currentSessionState.data?.user) {
      navigate("/login", { replace: true });
    }
  });

  const handleViewProfile = () => {
    alert("Profile page placeholder");
  };

  return (
    // Changed background to match Home.tsx
    <div class=" flex-grow bg-neutral-100 dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      <main class="container mx-auto px-4 sm:px-6 lg:px-8  flex flex-col grow overflow-hidden">
        <Show when={session().isPending}>
          <div class="flex-grow flex justify-center items-center">
            <svg
              class="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p class="ml-3 text-neutral-600 dark:text-neutral-400">
              Loading session...
            </p>
          </div>
        </Show>

        <Show
          when={!session().isPending && session().data?.user}
          fallback={
            <Show when={!session().isPending}>
              <div class="flex-grow flex justify-center items-center">
                <p class="text-lg text-neutral-600 dark:text-neutral-400">
                  Redirecting to login...
                </p>
              </div>
            </Show>
          }
        >
          <div class="flex flex-col h-full">
            <div class="mb-8 shrink-0">
              <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Welcome back,{" "}
                {session().data?.user?.name || session().data?.user?.email}!
              </h1>
              <p class="mt-1 text-md text-neutral-600 dark:text-neutral-400">
                Here's what's happening with your account today.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 grow overflow-y-auto custom-scrollbar pb-4">
              <div class="md:col-span-1 bg-white dark:bg-black shadow-lg rounded-xl p-6 h-fit">
                <div class="flex flex-col items-center">
                  <Show
                    when={session().data?.user?.image}
                    fallback={
                      <UserCircle
                        size={80}
                        class="text-neutral-400 dark:text-neutral-500 mb-4"
                      />
                    }
                  >
                    <img
                      src={session().data?.user?.image!}
                      alt="User avatar"
                      class="w-24 h-24 rounded-full mb-4 object-cover border-2 border-neutral-200 dark:border-neutral-700"
                    />
                  </Show>
                  <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                    {session().data?.user?.name || "User"}
                  </h2>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    {session().data?.user?.email}
                  </p>
                  <button
                    onClick={handleViewProfile}
                    class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black focus:ring-blue-500"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              <div class="md:col-span-2 bg-white dark:bg-black shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  Active Session Details
                </h3>
                <pre class="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-md text-xs text-neutral-700 dark:text-neutral-300 overflow-x-auto custom-scrollbar max-h-96">
                  {JSON.stringify(
                    {
                      user: session().data?.user,
                      /*session: session().data?.session,*/
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div class="bg-white dark:bg-black shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  Quick Stats
                </h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  Your important numbers here... <br /> More content to make it
                  taller. <br /> And more. <br /> And even more.
                </p>
              </div>
              <div class="bg-white dark:bg-black shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  Recent Activity
                </h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  List of recent actions... <br /> Activity 1 <br /> Activity 2
                  <br /> Activity 3
                </p>
              </div>
              <div class="bg-white dark:bg-black shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                  Notifications
                </h3>
                <p class="text-neutral-600 dark:text-neutral-400">
                  No new notifications. But this card could be tall. <br /> Line
                  2 <br /> Line 3 <br /> Line 4
                </p>
              </div>
            </div>
          </div>
        </Show>
      </main>
    </div>
  );
}
