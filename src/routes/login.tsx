import { createSignal, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const navigate = useNavigate();

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await authClient.signIn.email(
      {
        email: email(),
        password: password(),
        callbackURL: "/dashboard",
        rememberMe: true,
      },
      {
        onError: (ctx) => {
          setError(ctx.error.message || "An unknown error occurred.");
          setLoading(false);
        },
        onSuccess: (ctx) => {
          setLoading(false);
          if (ctx.data && !ctx.data.twoFactorRedirect) {
            navigate("/dashboard", { replace: true });
          }
        },
      }
    );

    if (signInError) {
      setError(signInError.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div class="bg-white dark:bg-neutral-900/80 backdrop-blur-sm shadow-2xl rounded-xl p-8 sm:p-10">
          <div class="text-center">
            <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Sign in
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Welcome back!
            </p>
          </div>

          <form onSubmit={handleLogin} class="mt-8 space-y-6">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800/50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-neutral-700 placeholder-gray-500 dark:placeholder-neutral-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800/50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div class="flex items-center justify-end">
              <div class="text-sm">
                <a
                  href="#" // Replace with your actual forgot password link
                  class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Show when={error()}>
              <p class="text-sm text-red-600 dark:text-red-400 text-center">
                {error()}
              </p>
            </Show>

            <div>
              <button
                type="submit"
                disabled={loading()}
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading() ? (
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
          <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <A
              href="/signup"
              class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign Up
            </A>
          </p>
        </div>
      </div>
    </div>
  );
}
