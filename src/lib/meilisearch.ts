// src/lib/meilisearch.ts
import { MeiliSearch, type Task } from "meilisearch";
import type { Vehicle } from "~/db/schema";

if (!process.env.MEILISEARCH_HOST) {
  throw new Error("MEILISEARCH_HOST environment variable is not set.");
}
if (!process.env.MEILISEARCH_API_KEY) {
  throw new Error("MEILISEARCH_API_KEY environment variable is not set.");
}

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST,
  apiKey: process.env.MEILISEARCH_API_KEY,
});

export const vehiclesIndex = meilisearch.index<Vehicle>("vehicles");

/**
 * Polls MeiliSearch for a task's completion status.
 * This is a robust alternative to client.waitForTask().
 * @param taskUid The UID of the task to poll.
 * @param timeoutMs The maximum time to wait for the task to complete.
 * @param intervalMs The interval at which to poll the task status.
 */
export const pollTask = async (
  taskUid: number,
  timeoutMs = 10000, // Increased timeout to 10 seconds
  intervalMs = 10 // Decreased interval to 10ms for more frequent polling
): Promise<Task> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    // --- THIS IS THE CORRECTED LINE ---
    const task = await meilisearch.tasks.getTask(taskUid);
    // --- END OF CORRECTION ---

    if (task.status === "succeeded") {
      return task;
    }
    if (task.status === "failed" || task.status === "canceled") {
      console.error("MeiliSearch task failed:", task.error);
      throw new Error(
        `MeiliSearch task ${task.uid} failed: ${task.error?.message}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `MeiliSearch task ${taskUid} timed out after ${timeoutMs}ms.`
  );
};

/**
 * Sets up the MeiliSearch index with the correct settings.
 * This function is idempotent (can be run multiple times without issues).
 */
export const setupMeilisearch = async () => {
  try {
    const task = await vehiclesIndex.updateSettings({
      filterableAttributes: [
        "vehicle_id",
        "brand",
        "model",
        "date_of_manufacture",
        "powertrain_type",
        "transmission",
      ],
      sortableAttributes: [
        "vehicle_id",
        "price",
        "date_of_manufacture",
        "mileage",
        "horsepower",
      ],
      searchableAttributes: [
        "brand",
        "model",
        "exterior",
        "interior",
        "general_description",
        "specification_description",
      ],
    });

    await pollTask(task.taskUid);
    console.log(
      'MeiliSearch index "vehicles" has been configured successfully.'
    );
  } catch (error) {
    console.error("Error configuring MeiliSearch index:", error);
  }
};
