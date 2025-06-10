// src/routes/dashboard.tsx
import { createEffect, Show, onMount, createSignal, Suspense } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { UserCircle } from "lucide-solid";
import SideNav from "~/components/SideNav";
import ProductListDashboard from "~/components/ProductListDashboard";

export default function DashboardPage() {
  const sessionSignal = authClient.useSession();
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = createSignal("user"); // 'user' or 'products'

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
    <div class="p-6 h-fit flex flex-col justify-center items-center">
      <p class="text-lg text-neutral-700">Checking session...</p>
    </div>
  );

  const DashboardContent = () => {
    const handleViewProfile = () => alert("Profile page placeholder");
    return (
      <div class="flex">
        <SideNav
          onProductClick={() => setActiveContent("products")}
          onUserClick={() => setActiveContent("user")}
          onLogoutSuccess={() => navigate("/login", { replace: true })}
        />
        <div class="flex-grow bg-neutral-100 text-slate-800 min-h-screen ml-64">
          <main class="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6  flex flex-col grow overflow-hidden">
            <div class="flex flex-col h-full">
              <Show when={activeContent() === "user"}>
                <div class="w-full h-full">
                  {" "}
                  {/* Removed flex justify-center items-start */}
                  <Show
                    when={
                      isSessionResolvedOnClient() && sessionSignal().data?.user
                    }
                    fallback={
                      <div class="p-6 h-full flex justify-center items-center w-full">
                        <InitialCheckState />
                      </div>
                    }
                  >
                    <div class="p-6 h-full w-full">
                      {" "}
                      {/* Removed card styles */}
                      <div class="flex flex-col items-center">
                        <Show
                          when={sessionSignal().data?.user?.image}
                          fallback={
                            <UserCircle
                              size={80}
                              class="text-neutral-500 mb-4"
                            />
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
                </div>
              </Show>
              <Show when={activeContent() === "products"}>
                <Suspense
                  fallback={
                    <div class="text-center py-10 text-lg text-neutral-700">
                      Loading products...
                    </div>
                  }
                >
                  <ProductListDashboard />
                </Suspense>
              </Show>
            </div>
          </main>
        </div>
      </div>
    );
  };

  return <DashboardContent />;
}
