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
    <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div class="bg-white backdrop-blur-sm shadow-2xl rounded-xl p-8 sm:p-10">
          <div class="text-center">
            <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Sign in
            </h2>
            <p class="mt-2 text-sm text-gray-600">Welcome back!</p>
          </div>

          <form onSubmit={handleLogin} class="mt-8 space-y-6">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
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
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1"
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
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div class="flex items-center justify-end">
              <div class="text-sm">
                <a
                  href="#" // Replace with your actual forgot password link
                  class="font-medium text-black hover:text-neutral-800"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Show when={error()}>
              <p class="text-sm text-red-600 text-center">{error()}</p>
            </Show>

            <div>
              <button
                type="submit"
                disabled={loading()}
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed"
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
          <p class="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <A
              href="/signup"
              class="font-medium text-black hover:text-neutral-800"
            >
              Sign Up
            </A>
          </p>
        </div>
      </div>
    </div>
  );
}
