// src/components/SideNav.tsx
import { A, useNavigate, useLocation } from "@solidjs/router";
import { Package, User, LogOut, X } from "lucide-solid";
import { useMutation } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";
import SearchInput from "~/components/SearchInput";
import { useSearch } from "~/context/SearchContext";

interface SideNavProps {
  onLogoutSuccess: () => void;
  onClose: () => void;
}

export default function SideNav(props: SideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, onSearchChange } = useSearch();

  const logoutMutation = useMutation(() => ({
    mutationFn: async () => {
      await authClient.signOut();
      return { message: "Logged out successfully" };
    },
    onSuccess: () => {
      props.onLogoutSuccess();
      navigate("/login", { replace: true });
    },
    onError: (err: Error) => {
      console.error("Logout failed:", err.message);
      alert(`Logout failed: ${err.message}`);
    },
  }));

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const linkClasses = (path: string) => {
    const baseClasses =
      "flex items-center w-full text-left px-4 py-3 text-neutral-700 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2";
    // Use exact match for the dashboard index to prevent it from always being active
    const isActive =
      path === "/dashboard"
        ? location.pathname === path
        : location.pathname.startsWith(path);
    return isActive
      ? `${baseClasses} bg-neutral-100`
      : `${baseClasses} hover:bg-neutral-100`;
  };

  return (
    <nav class="h-full w-full max-w-sm bg-white shadow-md flex flex-col">
      <div class="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h1 class="text-lg font-semibold text-neutral-800">Dashboard</h1>
        <button
          onClick={props.onClose}
          class="md:hidden p-1 text-neutral-600 hover:text-neutral-900"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      <div class="p-4">
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>

      <ul class="flex flex-col p-4 space-y-2 flex-1">
        <li>
          <A
            href="/dashboard"
            class={linkClasses("/dashboard")}
            onClick={props.onClose}
          >
            <User size={20} class="mr-3 flex-shrink-0" />
            <span class="text-sm font-medium">User Profile</span>
          </A>
        </li>
        <li>
          <A
            href="/dashboard/products"
            class={linkClasses("/dashboard/products")}
            onClick={props.onClose}
          >
            <Package size={20} class="mr-3 flex-shrink-0" />
            <span class="text-sm font-medium">Products</span>
          </A>
        </li>
      </ul>

      <div class="p-4 border-t border-neutral-200">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          class="flex items-center w-full text-left px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} class="mr-3 flex-shrink-0" />
          <span class="text-sm font-medium">
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </nav>
  );
}
