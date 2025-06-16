import { A, useNavigate } from "@solidjs/router";
import { Package, User, LogOut, X } from "lucide-solid"; // Imported X
import { useMutation } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client";

interface SideNavProps {
  onProductClick: () => void;
  onUserClick: () => void;
  onLogoutSuccess: () => void;
  onClose: () => void; // Added onClose prop
}

export default function SideNav(props: SideNavProps) {
  const navigate = useNavigate();

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

  return (
    <nav class="h-full w-full max-w-sm bg-white shadow-md flex flex-col">
      {/* Header/Logo area */}
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

      {/* Navigation items */}
      <ul class="flex flex-col p-4 space-y-2 flex-1">
        <li>
          <button
            onClick={props.onUserClick}
            class="flex items-center w-full text-left px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <User size={20} class="mr-3 flex-shrink-0" />
            <span class="text-sm font-medium">User Profile</span>
          </button>
        </li>
        <li>
          <button
            onClick={props.onProductClick}
            class="flex items-center w-full text-left px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <Package size={20} class="mr-3 flex-shrink-0" />
            <span class="text-sm font-medium">Products</span>
          </button>
        </li>
      </ul>

      {/* Logout button at bottom */}
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
