import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function Services() {
  return (
    <main class="pt-16 bg-white min-h-screen">
      <Title>Services</Title>
      <HttpStatusCode code={200} />
      <div class="p-6 sm:p-8 space-y-8">
        <h1 class="text-center text-2xl font-medium text-neutral-800">
          Our Services
        </h1>
      </div>
      <div class="h-screen bg-white"></div>
      <div class="h-screen bg-white"></div>
    </main>
  );
}
