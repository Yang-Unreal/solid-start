// scripts/sync-meilisearch.ts
import "dotenv/config";
import { vehicles as vehicleTable } from "~/db/schema";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// --- Import pollTask from our library ---
import { vehiclesIndex, setupMeilisearch, pollTask } from "~/lib/meilisearch";
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
const drizzleSyncDb = drizzle(drizzleSyncPool, { schema: { vehicleTable } });

/**
 * Main function to synchronize products from PostgreSQL to MeiliSearch.
 */
async function syncVehicles() {
  console.log("Starting vehicle synchronization with MeiliSearch...");

  try {
    // 1. Configure MeiliSearch index settings
    await setupMeilisearch();

    // 2. Clear all existing documents in the index
    console.log('Clearing all documents from the "vehicles" index...');
    const clearTask: EnqueuedTask = await vehiclesIndex.deleteAllDocuments();
    await pollTask(clearTask.taskUid);
    console.log("Index cleared successfully.");

    // 3. Fetch products from the database in batches
    console.log("Fetching vehicles from the PostgreSQL database in batches...");
    const totalVehiclesResult = await drizzleSyncDb
      .select({ count: count() })
      .from(vehicleTable);
    const totalVehicles = totalVehiclesResult[0]?.count || 0;
    console.log(`Found ${totalVehicles} vehicles to sync.`);

    if (totalVehicles === 0) {
      console.log(
        "No vehicles found in the database. Synchronization finished."
      );
      return;
    }

    const numBatches = Math.ceil(totalVehicles / BATCH_SIZE);
    const allEnqueuedTasks: EnqueuedTask[] = [];

    for (let i = 0; i < numBatches; i++) {
      const offset = i * BATCH_SIZE;
      console.log(
        `Fetching batch ${
          i + 1
        }/${numBatches} (offset: ${offset}, limit: ${BATCH_SIZE})...`
      );
      const vehiclesBatch = await drizzleSyncDb
        .select()
        .from(vehicleTable)
        .limit(BATCH_SIZE)
        .offset(offset);

      if (vehiclesBatch.length > 0) {
        console.log(
          `Adding batch ${i + 1} (${
            vehiclesBatch.length
          } documents) to MeiliSearch...`
        );
        const task = await vehiclesIndex.addDocuments(vehiclesBatch);
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
      "Vehicle synchronization with MeiliSearch completed successfully."
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
syncVehicles();
