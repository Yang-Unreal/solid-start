// src/routes/dragonfly.tsx
import { createSignal, createResource, Show, Suspense } from "solid-js"; // Import Suspense
import { Title } from "@solidjs/meta";
import { kv } from "~/lib/redis";

// Your server functions getMessageFromDb and setMessageInDb remain the same

async function getMessageFromDb(): Promise<string> {
  "use server";
  try {
    const message: string | null = await kv.get("greeting");
    if (message === null) {
      return "No message found. Try setting one!";
    }
    return message;
  } catch (error) {
    const err = error as Error;
    console.error("Failed to fetch from DB:", err.message);
    return `Error: Could not retrieve message. (${
      err.name || "Unknown DB error"
    })`;
  }
}

async function setMessageInDb(message: string): Promise<boolean> {
  "use server";
  if (typeof message !== "string" || message.trim() === "") {
    console.warn("Attempted to set an empty or invalid message to DB.");
    return false;
  }
  try {
    await kv.set("greeting", message.trim());
    return true;
  } catch (error) {
    console.error("Failed to set in DB:", error);
    return false;
  }
}

export default function DragonflyPage() {
  const [dbMessage, { refetch }] = createResource<string>(getMessageFromDb);
  const [inputValue, setInputValue] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [feedback, setFeedback] = createSignal<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const currentInput = inputValue().trim();
    if (!currentInput || isSubmitting()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const success = await setMessageInDb(currentInput);

    if (success) {
      setFeedback({
        type: "success",
        message: "Message saved successfully to DragonflyDB!",
      });
      refetch();
      setInputValue("");
    } else {
      setFeedback({
        type: "error",
        message:
          "Failed to save message. Please try again or check server logs.",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <main class="min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8 text-center">
      <Title>SolidStart + DragonflyDB Demo</Title>
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">
          SolidStart & DragonflyDB Integration 🚀
        </h1>
        <p class="text-neutral-700 dark:text-neutral-300 mb-8 max-w-xl mx-auto">
          Demonstrates fetching and setting a message in DragonflyDB via
          SolidStart server functions.
        </p>

        <div class="max-w-md mx-auto bg-white dark:bg-black shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          <div>
            <h2 class="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Live Message from DragonflyDB:
            </h2>
            <div class="h-14 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
              {/* Wrap the part that depends on dbMessage with Suspense */}
              <Suspense
                fallback={
                  <p class="text-neutral-600 dark:text-neutral-300 italic">
                    Loading message...
                  </p>
                }
              >
                {/* When this block renders, dbMessage() is loaded, or dbMessage.error is set */}
                <Show
                  when={!dbMessage.error}
                  fallback={
                    <p class="text-red-500 dark:text-red-400">
                      Failed to load: {String(dbMessage.error)}
                    </p>
                  }
                >
                  <p class="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">
                    {/* dbMessage() should be a string here. Handle empty string for better UX. */}
                    {dbMessage() === "" ? (
                      <i>(Message is empty)</i>
                    ) : (
                      dbMessage()
                    )}
                  </p>
                </Show>
              </Suspense>
            </div>
          </div>

          {/* ... rest of your form and feedback ... */}
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label
                for="dbMessageInput"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-left"
              >
                Enter new message:
              </label>
              <input
                id="dbMessageInput"
                type="text"
                value={inputValue()}
                onInput={(e) => setInputValue(e.currentTarget.value)}
                placeholder="Type here..."
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm 
                       bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200
                       focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 
                       focus:border-purple-500 dark:focus:border-purple-400
                       disabled:opacity-70"
                disabled={isSubmitting()}
              />
            </div>
            <div>
              <button
                type="submit"
                class="w-full px-6 py-2.5 bg-purple-600 text-white font-medium rounded-md 
                       hover:bg-purple-700 dark:hover:bg-purple-500 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-neutral-900
                       disabled:bg-neutral-400 dark:disabled:bg-neutral-500 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting()}
              >
                {isSubmitting() ? "Saving..." : "Save to DragonflyDB"}
              </button>
            </div>
          </form>

          <Show when={feedback()}>
            {(fb) => (
              <div
                class={`p-3 rounded-md text-sm ${
                  fb().type === "success"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/50"
                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/50"
                }`}
              >
                {fb().message}
              </div>
            )}
          </Show>
        </div>
      </div>
    </main>
  );
}
