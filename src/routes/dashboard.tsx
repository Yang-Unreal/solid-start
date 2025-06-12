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
  const [activeContent, setActiveContent] = createSignal("user");
  onMount(() => {
    setActiveContent(localStorage.getItem("dashboardActiveContent") || "user");

    createEffect(() => {
      localStorage.setItem("dashboardActiveContent", activeContent());
    });

    const currentSession = sessionSignal();
    if (!currentSession.isPending && !currentSession.data?.user) {
      navigate("/login", { replace: true });
    }
  });

  createEffect(() => {
    const currentSession = sessionSignal();
    if (!currentSession.isPending && !currentSession.data?.user) {
      queueMicrotask(() => {
        navigate("/login", { replace: true });
      });
    }
  });

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
                  <Show when={sessionSignal().data?.user}>
                    <div class="p-6 h-full w-full">
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
                <ProductListDashboard />
              </Show>
            </div>
          </main>
        </div>
      </div>
    );
  };

  return <DashboardContent />;
}
