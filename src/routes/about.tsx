import { A } from "@solidjs/router";
import Counter from "~/components/Counter";

export default function About() {
  const baseButtonClass =
    "px-5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryButtonColors =
    "bg-[#c2fe0c] text-black hover:bg-[#a8e00a] focus:ring-[#c2fe0c]";

  return (
    <main class="pt-16 bg-neutral-100">
      <div class="card-content-host p-6 sm:p-8 space-y-8">
        <h1 class="text-center text-2xl font-medium text-neutral-800">
          About This Application
        </h1>
        <p class="text-center text-base text-neutral-700 max-w-xl mx-auto">
          Welcome to the about page! Here you'll find more information regarding
          this application and its features.
        </p>
        <div class="flex flex-col items-center space-y-5 pt-6 border-t border-neutral-200">
          <h2 class="text-xl font-medium text-neutral-700">
            Interactive Counter
          </h2>
          <Counter />
        </div>
        <div class="text-center pt-8">
          <A
            href="/"
            class={`inline-block min-w-[160px] ${baseButtonClass} ${primaryButtonColors}`}
          >
            Go to Home
          </A>
        </div>
      </div>
    </main>
  );
}
