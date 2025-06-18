// scripts/sync-meilisearch.ts
import "dotenv/config";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
// --- Import pollTask from our library ---
import { productsIndex, setupMeilisearch, pollTask } from "~/lib/meilisearch";
import type { EnqueuedTask } from "meilisearch";
const BATCH_SIZE = 1000;

/**
 * Main function to synchronize products from PostgreSQL to MeiliSearch.
 */
async function syncProducts() {
  console.log("Starting product synchronization with MeiliSearch...");

  try {
    // 1. Configure MeiliSearch index settings
    await setupMeilisearch();

    // 2. Clear all existing documents in the index
    console.log('Clearing all documents from the "products" index...');
    const clearTask: EnqueuedTask = await productsIndex.deleteAllDocuments();
    await pollTask(clearTask.taskUid);
    console.log("Index cleared successfully.");

    // 3. Fetch all products from the database
    console.log("Fetching all products from the PostgreSQL database...");
    const allProducts = await db.select().from(productTable);
    console.log(`Found ${allProducts.length} products to sync.`);

    if (allProducts.length === 0) {
      console.log(
        "No products found in the database. Synchronization finished."
      );
      return;
    }

    // --- START OF CORRECTION ---

    // 4. Get the array of promises from addDocumentsInBatches
    console.log(
      `Adding documents to MeiliSearch in batches of ${BATCH_SIZE}...`
    );
    // This function synchronously returns an array of promises. Do NOT await it here.
    const batchTasksPromises = productsIndex.addDocumentsInBatches(
      allProducts,
      BATCH_SIZE
    );

    // 5. Wait for all batch enqueueing promises to resolve
    // Promise.all takes an array of promises and returns a single promise
    // that resolves with an array of the results.
    console.log("Waiting for all batch requests to be enqueued...");
    const enqueuedTasks: EnqueuedTask[] = await Promise.all(batchTasksPromises);

    // 6. Poll all the successfully enqueued tasks
    console.log(
      `Waiting for ${enqueuedTasks.length} batch task(s) to complete...`
    );
    // Create a new array of promises for the polling operation.
    const pollPromises = enqueuedTasks.map((task) => pollTask(task.taskUid));
    // Wait for all polling operations to finish.
    await Promise.all(pollPromises);

    // --- END OF CORRECTION ---

    console.log(
      "Product synchronization with MeiliSearch completed successfully."
    );
  } catch (error) {
    console.error(
      "A critical error occurred during MeiliSearch synchronization:",
      error
    );
    process.exit(1);
  }
}

// Execute the synchronization
syncProducts();
