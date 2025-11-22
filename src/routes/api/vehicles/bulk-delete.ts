// src/routes/api/vehicles/bulk-delete.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { vehicles, photos } from "~/db/schema";
import { inArray, eq } from "drizzle-orm";
import { z } from "zod";
import { kv } from "~/lib/redis";
import { minio, bucket, endpoint } from "~/lib/minio";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { vehiclesIndex, pollTask } from "~/lib/meilisearch";

const BulkDeletePayloadSchema = z.object({
	ids: z.array(z.string().uuid()).min(1),
});

export async function POST({ request }: APIEvent) {
	try {
		const body = await request.json();
		const validationResult = BulkDeletePayloadSchema.safeParse(body);

		if (!validationResult.success) {
			return new Response(
				JSON.stringify({
					error: "Invalid input for bulk delete.",
					issues: validationResult.error.flatten(),
				}),
				{ status: 400 },
			);
		}

		const vehicleIdsToDelete = validationResult.data.ids;

		await db.transaction(async (tx) => {
			const photosToDelete = await tx.query.photos.findMany({
				where: inArray(photos.vehicle_id, vehicleIdsToDelete),
			});

			if (photosToDelete.length > 0) {
				const validPhotos = photosToDelete.filter((p) => p.photo_url !== null);
				if (validPhotos.length > 0) {
					try {
						const photoKeysToDelete: string[] = [];

						for (const photo of validPhotos) {
							try {
								const url = new URL(photo.photo_url!);
								if (!endpoint) throw new Error("MinIO endpoint not configured");
								const endpointUrl = new URL(endpoint);
								const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
								const bucketPrefix = `${endpointPath}/${bucket}`;
								const baseKey = url.pathname.replace(
									new RegExp(`^${bucketPrefix}/`),
									"",
								);

								// Add both AVIF and WebP versions
								photoKeysToDelete.push(baseKey); // AVIF version
								photoKeysToDelete.push(baseKey.replace(/\.avif$/, ".webp")); // WebP version
							} catch (urlError) {
								console.error(
									`Invalid photo URL: ${photo.photo_url}`,
									urlError,
								);
							}
						}

						if (photoKeysToDelete.length > 0) {
							console.log(
								`Attempting to delete ${photoKeysToDelete.length} images from MinIO:`,
								photoKeysToDelete,
							);

							await minio.send(
								new DeleteObjectsCommand({
									Bucket: bucket,
									Delete: {
										Objects: photoKeysToDelete.map((k) => ({ Key: k })),
									},
								}),
							);

							console.log(
								`Successfully deleted ${photoKeysToDelete.length} images from MinIO during bulk delete`,
							);
						}
					} catch (minioError) {
						console.error(
							"Failed to delete images from MinIO during bulk delete:",
							minioError,
						);
						// Continue with the deletion even if MinIO cleanup fails
					}
				}
			}

			await tx
				.delete(vehicles)
				.where(inArray(vehicles.vehicle_id, vehicleIdsToDelete));
		});

		if (vehicleIdsToDelete.length > 0) {
			const task = await vehiclesIndex.deleteDocuments(vehicleIdsToDelete);
			await pollTask(task.taskUid);
		}

		const vehicleKeys = await kv.keys("vehicles:*");
		if (vehicleKeys.length > 0) await kv.del(...vehicleKeys);
		await kv.del("vehicle-filter-options");

		return new Response(
			JSON.stringify({
				message: `${vehicleIdsToDelete.length} vehicles deleted.`,
				deletedIds: vehicleIdsToDelete,
			}),
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error during bulk vehicle deletion:", error);
		return new Response(
			JSON.stringify({ error: "Failed to perform bulk delete." }),
			{ status: 500 },
		);
	}
}
