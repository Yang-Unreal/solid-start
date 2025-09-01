// scripts/sync-meilisearch.ts
import "dotenv/config";
import { product as productTable } from "~/db/schema";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// --- Import pollTask from our library ---
import { productsIndex, setupMeilisearch, pollTask } from "~/lib/meilisearch";
import type { EnqueuedTask } from "meilisearch";
const BATCH_SIZE = 1000;

// Create a separate Drizzle client for this script using DATABASE_URL_DRIZZLE_KIT
// This is to bypass potential SSL/TLS issues with the main DATABASE_URL for background scripts.
if (!process.env.DATABASE_URL_DRIZZLE_KIT) {
  throw new Error("DATABASE_URL_DRIZZLE_KIT environment variable is not set.");
}
const drizzleSyncPool = new Pool({
  connectionString: process.env.DATABASE_URL_DRIZZLE_KIT,
  // Explicitly disable SSL for this connection if it's not meant to be SSL
  // or if DATABASE_URL_DRIZZLE_KIT is known to be non-SSL.
  // If DATABASE_URL_DRIZZLE_KIT might contain SSL params, you might need to parse them.
  // For simplicity, assuming it's a plain connection string without SSL issues.
  ssl: false, // Assuming DATABASE_URL_DRIZZLE_KIT is for non-SSL or self-signed certs
});
const drizzleSyncDb = drizzle(drizzleSyncPool, { schema: { productTable } });

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

    // 3. Fetch products from the database in batches
    console.log("Fetching products from the PostgreSQL database in batches...");
    const totalProductsResult = await drizzleSyncDb
      .select({ count: count() })
      .from(productTable);
    const totalProducts = totalProductsResult[0]?.count || 0;
    console.log(`Found ${totalProducts} products to sync.`);

    if (totalProducts === 0) {
      console.log(
        "No products found in the database. Synchronization finished."
      );
      return;
    }

    const numBatches = Math.ceil(totalProducts / BATCH_SIZE);
    const allEnqueuedTasks: EnqueuedTask[] = [];

    for (let i = 0; i < numBatches; i++) {
      const offset = i * BATCH_SIZE;
      console.log(
        `Fetching batch ${
          i + 1
        }/${numBatches} (offset: ${offset}, limit: ${BATCH_SIZE})...`
      );
      const productsBatch = await drizzleSyncDb
        .select()
        .from(productTable)
        .limit(BATCH_SIZE)
        .offset(offset);

      if (productsBatch.length > 0) {
        console.log(
          `Adding batch ${i + 1} (${
            productsBatch.length
          } documents) to MeiliSearch...`
        );
        const task = await productsIndex.addDocuments(productsBatch);
        allEnqueuedTasks.push(task);
      }
    }

    // 4. Wait for all enqueued tasks to resolve
    console.log(
      `Waiting for ${allEnqueuedTasks.length} batch task(s) to complete in MeiliSearch...`
    );
    const pollPromises = allEnqueuedTasks.map((task) => pollTask(task.taskUid));
    await Promise.all(pollPromises);

    console.log(
      "Product synchronization with MeiliSearch completed successfully."
    );
  } catch (error) {
    console.error(
      "A critical error occurred during MeiliSearch synchronization:",
      error
    );
    process.exit(1);
  } finally {
    // Ensure the pool is ended to close the connection
    await drizzleSyncPool.end();
  }
}

// Execute the synchronization
syncProducts();
