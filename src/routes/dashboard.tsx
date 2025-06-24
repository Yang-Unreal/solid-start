// src/routes/dashboard.tsx
import { createEffect, Show, createSignal } from "solid-js";
import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";
import { Menu } from "lucide-solid";
import SideNav from "~/components/SideNav";

export default function DashboardLayout(props: RouteSectionProps) {
  const sessionSignal = authClient.useSession();
  const navigate = useNavigate();
  const [sideNavOpen, setSideNavOpen] = createSignal(false);

  // This effect protects all routes under /dashboard/*
  createEffect(() => {
    const currentSession = sessionSignal();
    if (!currentSession.isPending && !currentSession.data?.user) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <div class="flex h-screen bg-neutral-100">
      {/* Mobile Header */}
      <div class="fixed top-0 left-0 right-0 z-10 bg-white shadow-md h-16 flex items-center justify-between px-4 md:hidden">
        <h1 class="text-lg font-semibold text-neutral-800">Dashboard</h1>
        <button
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
          onLogoutSuccess={() => navigate("/login", { replace: true })}
        />
      </div>

      {/* Mobile Menu */}
      <Show when={sideNavOpen()}>
        <div
          class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSideNavOpen(false)}
        />
        <div class="fixed top-0 left-0 h-screen w-full max-w-sm z-50 bg-white">
          <SideNav
            onClose={() => setSideNavOpen(false)}
            onLogoutSuccess={() => navigate("/login", { replace: true })}
          />
        </div>
      </Show>

      {/* Main Content Area */}
      <main class="flex-1 flex flex-col min-w-0 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-20 md:pt-6">
        {/* The router renders the correct page (index.tsx or products.tsx) here */}
        {props.children}
      </main>
    </div>
  );
}
