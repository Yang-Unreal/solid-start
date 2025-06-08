// src/routes/dashboard.tsx
import { createEffect, Show, onMount, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { UserCircle } from "lucide-solid";

export default function DashboardPage() {
  const sessionSignal = authClient.useSession();
  const navigate = useNavigate();

  // This signal will determine if we are ready to show actual content or redirect.
  // It starts false, and only becomes true when the session is resolved on the client.
  const [isSessionResolvedOnClient, setIsSessionResolvedOnClient] =
    createSignal(false);

  onMount(() => {
    // This runs only on the client, after the initial render
    const currentSession = sessionSignal();
    console.log(
      "DashboardPage: Client Mounted - Initial Session: isPending:",
      currentSession.isPending,
      "hasUser:",
      !!currentSession.data?.user
    );
    if (!currentSession.isPending) {
      setIsSessionResolvedOnClient(true); // Session was already resolved (e.g., from cache or SSR data)
      if (!currentSession.data?.user) {
        navigate("/login", { replace: true });
      }
    }
  });

  createEffect(() => {
    const currentSession = sessionSignal();
    console.log(
      "DashboardPage: Session Signal Changed - isPending:",
      currentSession.isPending,
      "hasUser:",
      !!currentSession.data?.user
    );

    if (!currentSession.isPending) {
      setIsSessionResolvedOnClient(true); // Session has now resolved
      if (!currentSession.data?.user) {
        // Ensure navigation happens after this effect's batch
        queueMicrotask(() => {
          console.log(
            "DashboardPage: Effect (deferred) - No user session, navigating to /login."
          );
          navigate("/login", { replace: true });
        });
      }
    } else {
      // If session becomes pending again (e.g. due to refetch), reset resolved state
      setIsSessionResolvedOnClient(false);
    }
  });

  const InitialCheckState = () => (
    // Shown on SSR for unauth, and client before session resolves
    <div class="flex-grow bg-neutral-100 text-slate-800 min-h-[calc(100vh-4rem)] flex justify-center items-center">
      <p class="text-lg text-neutral-700">Checking session...</p>
    </div>
  );

  const DashboardContent = () => {
    /* ... same as before ... */
    const handleViewProfile = () => alert("Profile page placeholder");
    return (
      <div class="flex-grow bg-neutral-100 text-slate-800 min-h-[calc(100vh-4rem)]">
        <main class="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col grow overflow-hidden">
          <div class="flex flex-col h-full">
            <div class="mb-6 sm:mb-8 shrink-0">
              {/* Welcome message removed */}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grow overflow-y-auto custom-scrollbar pb-4">
              <Show
                when={isSessionResolvedOnClient() && sessionSignal().data?.user}
                fallback={
                  <div class="md:col-span-1 lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit flex justify-center items-center">
                    <InitialCheckState />
                  </div>
                }
              >
                <div class="md:col-span-1 lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
                  <div class="flex flex-col items-center">
                    <Show
                      when={sessionSignal().data?.user?.image}
                      fallback={
                        <UserCircle size={80} class="text-neutral-500 mb-4" />
                      }
                    >
                      {(imageAccessor) => (
                        <img
                          src={imageAccessor()}
                          alt="User avatar"
                          class="w-24 h-24 rounded-full mb-4 object-cover border-2 border-neutral-200"
                        />
                      )}
                    </Show>
                    <h2 class="text-xl font-semibold text-neutral-800">
                      {sessionSignal().data?.user?.name || "User"}
                    </h2>
                    <p class="text-sm text-neutral-600">
                      {sessionSignal().data?.user?.email}
                    </p>
                    <button
                      onClick={handleViewProfile}
                      class="mt-6 px-5 py-2.5 text-sm font-medium text-black rounded-lg bg-[#c2fe0c] hover:bg-[#a8e00a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#c2fe0c]"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </Show>
              <div class="md:col-span-1 lg:col-span-2 bg-white shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 mb-4">
                  Performance Overview
                </h3>
                <div class="space-y-4">
                  <div class="p-4 bg-neutral-50 rounded-md">
                    <h4 class="font-medium text-neutral-700 mb-1">MAU</h4>
                    <p class="text-2xl font-bold text-sky-600">1,234</p>
                    <p class="text-xs text-green-700">+5.2% vs last month</p>
                  </div>
                  <div class="p-4 bg-neutral-50 rounded-md">
                    <h4 class="font-medium text-neutral-700 mb-1">
                      Conversion Rate
                    </h4>
                    <p class="text-2xl font-bold text-sky-600">12.5%</p>
                    <p class="text-xs text-red-700">-0.8% vs last month</p>
                  </div>
                  <div class="h-40 bg-neutral-100 rounded-md flex items-center justify-center">
                    <p class="text-neutral-700 italic">[Chart Placeholder]</p>
                  </div>
                </div>
              </div>
              <div class="bg-white shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 mb-4">
                  Quick Stats
                </h3>
                <p class="text-sm text-neutral-700">
                  Important numbers... <br /> More content. <br /> And more.
                </p>
              </div>
              <div class="bg-white shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 mb-4">
                  Recent Activity
                </h3>
                <p class="text-sm text-neutral-700">
                  Recent actions... <br /> Activity 1 <br /> Activity 2
                </p>
              </div>
              <div class="bg-white shadow-lg rounded-xl p-6 h-fit">
                <h3 class="text-xl font-semibold text-neutral-800 mb-4">
                  Notifications
                </h3>
                <p class="text-sm text-neutral-700">
                  No new notifications. <br /> Line 2 <br /> Line 3
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return <DashboardContent />;
}
