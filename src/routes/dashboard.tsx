// src/routes/dashboard.tsx
import { createEffect, Show, onMount, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { UserCircle, Menu } from "lucide-solid";
import SideNav from "~/components/SideNav";
import ProductListDashboard from "~/components/ProductListDashboard";

export default function DashboardPage() {
  const sessionSignal = authClient.useSession();
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = createSignal("user");
  const [sideNavOpen, setSideNavOpen] = createSignal(false);

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
      <div class="flex h-screen bg-neutral-100">
        {/* Mobile Fixed Header */}
        <div class="fixed top-0 left-0 right-0 z-10 bg-white shadow-md h-16 flex items-center justify-between px-4 md:hidden">
          <h1 class="text-lg font-semibold text-neutral-800">Dashboard</h1>
          <button
            id="mobile-menu-button"
            onClick={() => setSideNavOpen(true)}
            class="p-2 rounded-md bg-white shadow-md border border-neutral-200 hover:bg-neutral-50"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div class="hidden md:static md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-white md:shadow-md md:flex md:flex-col">
          <SideNav
            onClose={() => setSideNavOpen(false)}
            onProductClick={() => setActiveContent("products")}
            onUserClick={() => setActiveContent("user")}
            onLogoutSuccess={() => navigate("/login", { replace: true })}
          />
        </div>

        <Show when={sideNavOpen()}>
          {/* Mobile Overlay */}
          <div
            class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSideNavOpen(false)}
          />
          {/* Mobile Full-Screen Menu Content */}
          <div
            id="mobile-full-screen-menu"
            class={`fixed top-0 left-0 right-0 z-50 bg-black transform transition-all duration-300 ease-in-out flex flex-col items-center justify-center ${
              sideNavOpen()
                ? "h-screen opacity-100"
                : "h-0 opacity-0 overflow-hidden pointer-events-none"
            }`}
          >
            <SideNav
              onClose={() => setSideNavOpen(false)}
              onProductClick={() => {
                setActiveContent("products");
                setSideNavOpen(false);
              }}
              onUserClick={() => {
                setActiveContent("user");
                setSideNavOpen(false);
              }}
              onLogoutSuccess={() => navigate("/login", { replace: true })}
            />
          </div>
        </Show>

        <div class="flex-1 flex flex-col min-w-0">
          <main class="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-16 md:pt-4">
            <Show when={activeContent() === "user"}>
              <div class="w-full h-full">
                <Show when={sessionSignal().data?.user}>
                  <div class="p-6 h-full w-full">
                    <div class="flex flex-col items-center max-w-md mx-auto">
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
                            class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 object-cover border-2 border-neutral-200"
                          />
                        )}
                      </Show>
                      <h2 class="text-xl font-semibold text-neutral-800 text-center">
                        {sessionSignal().data?.user?.name || "User"}
                      </h2>
                      <p class="text-sm text-neutral-600 text-center break-all">
                        {sessionSignal().data?.user?.email}
                      </p>
                      {/* CHANGE: Updated button style for consistency */}
                      <button
                        onClick={handleViewProfile}
                        class="mt-6 px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-black"
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
          </main>
        </div>
      </div>
    );
  };

  return <DashboardContent />;
}
