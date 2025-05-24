import { createSignal, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router"; // Added A for link
import { authClient } from "~/lib/auth-client"; // Path to your auth-client.ts

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

    // Basic client-side password validation (consider more robust validation)
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
        callbackURL: "/dashboard", // Optional: URL to redirect to after email verification if enabled and autoSignIn is false. If autoSignIn is true (default), this might be less relevant immediately. [1]
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
          // Better Auth default: autoSignIn is true after successful signUp.
          // If email verification is required AND autoSignIn is false, user won't be logged in.
          // For now, assuming autoSignIn is true.
          setSuccessMessage("Signup successful! Redirecting to dashboard...");
          setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
        },
      }
    );

    if (signUpError) {
      // This block might be redundant if onError callback is comprehensive
      setError(signUpError.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div class="max-w-md mx-auto mt-12 mb-8 p-6 sm:p-8 bg-white shadow-xl rounded-lg">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">
        Create Account
      </h2>
      <form onSubmit={handleSignup} class="space-y-6">
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
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {loading() ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <A
          href="/login"
          class="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Log In
        </A>
      </p>
    </div>
  );
}
