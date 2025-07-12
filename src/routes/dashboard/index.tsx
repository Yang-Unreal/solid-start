// src/routes/dashboard/index.tsx
import { Show } from "solid-js";
import { UserCircle } from "lucide-solid";
import { authClient } from "~/lib/auth-client";

export default function DashboardIndexPage() {
  const sessionSignal = authClient.useSession();
  const handleViewProfile = () => alert("Profile page placeholder");

  return (
    <div class="w-full h-full">
      <Show when={sessionSignal().data?.user}>
        <div class="container-padding h-full w-full">
          <div class="flex flex-col items-center max-w-md mx-auto">
            <Show
              when={sessionSignal().data?.user?.image}
              fallback={<UserCircle size={80} class="text-neutral-500 mb-4" />}
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
  );
}
