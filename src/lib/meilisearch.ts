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

export const pollTask = async (
	taskUid: number,
	timeoutMs = 10000,
	intervalMs = 10,
): Promise<Task> => {
	const startTime = Date.now();

	while (Date.now() - startTime < timeoutMs) {
		const task = await meilisearch.tasks.getTask(taskUid);

		if (task.status === "succeeded") {
			return task;
		}
		if (task.status === "failed" || task.status === "canceled") {
			console.error("MeiliSearch task failed:", task.error);
			throw new Error(
				`MeiliSearch task ${task.uid} failed: ${task.error?.message}`,
			);
		}

		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}

	throw new Error(
		`MeiliSearch task ${taskUid} timed out after ${timeoutMs}ms.`,
	);
};

export const setupMeilisearch = async () => {
	try {
		const task = await vehiclesIndex.updateSettings({
			filterableAttributes: ["brand", "powertrain_type", "fuel_type"],
			sortableAttributes: [
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
				"appearance_title",
				"appearance_description",
				"feature_description",
			],
		});

		await pollTask(task.taskUid);
		console.log(
			'MeiliSearch index "vehicles" has been configured successfully.',
		);
	} catch (error) {
		console.error("Error configuring MeiliSearch index:", error);
	}
};
