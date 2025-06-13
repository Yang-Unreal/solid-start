// import { A } from "@solidjs/router";
// import Counter from "~/components/Counter";

export default function About() {
  return (
    <main class="pt-16 bg-white min-h-screen">
      <div class="p-6 sm:p-8 space-y-8">
        <h1 class="text-center text-2xl font-medium text-neutral-800">
          About This Application
        </h1>
        <p class="text-center text-base text-neutral-700 max-w-xl mx-auto">
          Welcome to the about page! Here you'll find more information regarding
          this application and its features.
        </p>
        {/* <div class="flex flex-col items-center space-y-5 pt-6 border-t border-neutral-200">
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
        </div> */}
      </div>
    </main>
  );
}
