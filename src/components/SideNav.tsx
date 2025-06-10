import { A, useNavigate } from "@solidjs/router";
import { Package, User, LogOut } from "lucide-solid";
import { useMutation } from "@tanstack/solid-query";
import { authClient } from "~/lib/auth-client"; // Import authClient

// No longer need a custom logoutApi function, authClient.signOut() will handle it.

interface SideNavProps {
  onProductClick: () => void;
  onUserClick: () => void;
  onLogoutSuccess: () => void; // New prop for logout success
}

export default function SideNav(props: SideNavProps) {
  const navigate = useNavigate();

  const logoutMutation = useMutation(() => ({
    mutationFn: async () => {
      await authClient.signOut(); // Use authClient.signOut()
      return { message: "Logged out successfully" }; // Return a dummy success message
    },
    onSuccess: () => {
      props.onLogoutSuccess(); // Call the new prop
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
    <nav class="w-64 bg-white shadow-md h-screen fixed top-0 left-0 pt-16">
      <ul class="flex flex-col p-4 space-y-2">
        <li>
          <button
            onClick={props.onUserClick}
            class="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-md"
          >
            <User size={20} class="mr-2" />
            User
          </button>
        </li>
        <li>
          <button
            onClick={props.onProductClick}
            class="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-md"
          >
            <Package size={20} class="mr-2" />
            Products
          </button>
        </li>
        <li>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            class="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-md"
          >
            <LogOut size={20} class="mr-2" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
