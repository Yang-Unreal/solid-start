import { createSignal, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { authClient } from "~/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password().length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await authClient.signUp.email(
      {
        // [1]
        name: name(),
        email: email(),
        password: password(),
        callbackURL: "/dashboard",
      },
      {
        onError: (ctx) => {
          setError(
            ctx.error.message || "An unknown error occurred during sign up."
          );
          setLoading(false);
        },
        onSuccess: (ctx) => {
          setLoading(false);

          setSuccessMessage("Signup successful! Redirecting to dashboard...");
          setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
        },
      }
    );

    if (signUpError) {
      setError(signUpError.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        <div class="bg-white backdrop-blur-sm shadow-2xl rounded-xl p-8 sm:p-10">
          <div class="text-center">
            <h2 class="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Create Account
            </h2>
            <p class="mt-2 text-sm text-gray-600">Join us today!</p>
          </div>
          <form onSubmit={handleSignup} class="mt-8 space-y-6">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name:
              </label>
              <input
                id="name"
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email:
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Password:
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Minimum 8 characters"
              />
            </div>
            <Show when={error()}>
              <p class="text-sm text-red-600">{error()}</p>
            </Show>
            <Show when={successMessage() && !error()}>
              <p class="text-sm text-green-600">{successMessage()}</p>
            </Show>
            <button
              type="submit"
              disabled={loading()}
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-neutral-500 disabled:cursor-not-allowed"
            >
              {loading() ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <p class="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <A
              href="/login"
              class="font-medium text-black hover:text-neutral-800"
            >
              Log In
            </A>
          </p>
        </div>
      </div>
    </div>
  );
}
