import { createEffect, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";

export default function DashboardPage() {
  const session = authClient.useSession();
  const navigate = useNavigate();

  createEffect(() => {
    const currentSessionState = session();
    if (!currentSessionState.isPending && !currentSessionState.data?.user) {
      navigate("/login", { replace: true });
    }
  });

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <Show when={session().isPending}>
        <p class="text-center text-gray-500">Loading session...</p>
      </Show>
      <Show
        when={!session().isPending && session().data?.user}
        fallback={
          <Show when={!session().isPending}>
            <div class="text-center">
              <p class="text-gray-700">Redirecting to login...</p>
            </div>
          </Show>
        }
      >
        <div class="bg-white shadow-md rounded-lg p-6">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Dashboard
          </h1>
          <p class="text-lg text-gray-700 mb-6">
            Welcome,{" "}
            <span class="font-semibold">
              {session().data?.user?.name || session().data?.user?.email}!
            </span>
          </p>
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">
              Session Data:
            </h3>
            <pre class="bg-gray-100 p-4 rounded-md text-sm text-gray-800 overflow-x-auto">
              {JSON.stringify(session().data, null, 2)}
            </pre>
          </div>
          <button
            onClick={handleLogout}
            class="mt-4 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </Show>
    </div>
  );
}
