// scripts/sync-meilisearch.ts
import "dotenv/config";
import {
	vehicles,
	gasoline_powertrains,
	electric_powertrains,
	hybrid_powertrains,
	photos,
	features,
	vehicle_features,
	vehiclesRelations,
	photosRelations,
	gasolinePowertrainsRelations,
	electricPowertrainsRelations,
	hybridPowertrainsRelations,
	featuresRelations,
	vehicleFeaturesRelations,
} from "~/db/schema";
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { vehiclesIndex, setupMeilisearch, pollTask } from "~/lib/meilisearch";
import type { EnqueuedTask } from "meilisearch";
const BATCH_SIZE = 1000;

if (!process.env.DATABASE_URL_DRIZZLE_KIT) {
	throw new Error("DATABASE_URL_DRIZZLE_KIT environment variable is not set.");
}
const drizzleSyncPool = new Pool({
	connectionString: process.env.DATABASE_URL_DRIZZLE_KIT,
	ssl: false,
});
const drizzleSyncDb = drizzle(drizzleSyncPool, {
	schema: {
		vehicles,
		gasoline_powertrains,
		electric_powertrains,
		hybrid_powertrains,
		photos,
		features,
		vehicle_features,
		vehiclesRelations,
		photosRelations,
		gasolinePowertrainsRelations,
		electricPowertrainsRelations,
		hybridPowertrainsRelations,
		featuresRelations,
		vehicleFeaturesRelations,
	},
});

async function syncVehicles() {
	console.log("Starting vehicle synchronization with MeiliSearch...");

	try {
		await setupMeilisearch();

		console.log('Clearing all documents from the "vehicles" index...');
		const clearTask: EnqueuedTask = await vehiclesIndex.deleteAllDocuments();
		await pollTask(clearTask.taskUid);
		console.log("Index cleared successfully.");

		console.log("Fetching vehicles from the PostgreSQL database in batches...");
		const totalVehiclesResult = await drizzleSyncDb
			.select({ count: count() })
			.from(vehicles);
		const totalVehicles = totalVehiclesResult[0]?.count || 0;
		console.log(`Found ${totalVehicles} vehicles to sync.`);

		if (totalVehicles === 0) {
			console.log(
				"No vehicles found in the database. Synchronization finished.",
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
				}/${numBatches} (offset: ${offset}, limit: ${BATCH_SIZE})...`,
			);
			const vehiclesBatch = await drizzleSyncDb.query.vehicles.findMany({
				limit: BATCH_SIZE,
				offset: offset,
				with: {
					photos: true,
					gasoline_powertrain: true,
					electric_powertrain: true,
					hybrid_powertrain: true,
					features: {
						with: {
							feature: true,
						},
					},
				},
			});

			if (vehiclesBatch.length > 0) {
				console.log(
					`Adding batch ${i + 1} (${
						vehiclesBatch.length
					} documents) to MeiliSearch...`,
				);
				const task = await vehiclesIndex.addDocuments(vehiclesBatch);
				allEnqueuedTasks.push(task);
			}
		}

		console.log(
			`Waiting for ${allEnqueuedTasks.length} batch task(s) to complete in MeiliSearch...`,
		);
		const pollPromises = allEnqueuedTasks.map((task) => pollTask(task.taskUid));
		await Promise.all(pollPromises);

		console.log(
			"Vehicle synchronization with MeiliSearch completed successfully.",
		);
	} catch (error) {
		console.error(
			"A critical error occurred during MeiliSearch synchronization:",
			error,
		);
		process.exit(1);
	} finally {
		await drizzleSyncPool.end();
	}
}

syncVehicles();
