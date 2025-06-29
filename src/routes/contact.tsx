import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function Contact() {
  return (
    <main class="pt-16 bg-white min-h-screen">
      <Title>Contact Us</Title>
      <HttpStatusCode code={200} />
      <div class="p-6 sm:p-8 space-y-8">
        <h1 class="text-center text-2xl font-medium text-neutral-800">
          Contact Us
        </h1>
        <p>Contact information and form will go here.</p>
      </div>
    </main>
  );
}
