// src/routes/api/vehicles/bulk-delete.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { vehicles as vehiclesTable, photos as photosTable } from "~/db/schema";
import { inArray, eq } from "drizzle-orm";
import { z } from "zod";
import { kv } from "~/lib/redis";
import { deleteFile } from "~/lib/minio";
import { vehiclesIndex, pollTask } from "~/lib/meilisearch";

const BulkDeletePayloadSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/)).min(1),
});

// Helper function to extract MinIO object key from a photo URL
const getMinioObjectKey = (photoUrl: string): string | null => {
  // Extract the object key from the photo URL
  // URL format: https://minio.example.com/bucket/vehicles/filename.jpg
  const urlParts = photoUrl.split("/");
  const vehiclesIndex = urlParts.findIndex((part) => part === "vehicles");
  if (vehiclesIndex !== -1 && vehiclesIndex < urlParts.length - 1) {
    return urlParts.slice(vehiclesIndex).join("/");
  }
  return null;
};

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
        { status: 400 }
      );
    }

    const vehicleIdsToDelete = validationResult.data.ids.map((id) =>
      parseInt(id, 10)
    );

    // Fetch vehicle photos before deleting from the database
    const vehiclesWithPhotos = await db
      .select({
        vehicle_id: vehiclesTable.vehicle_id,
        photo_url: photosTable.photo_url,
      })
      .from(vehiclesTable)
      .leftJoin(
        photosTable,
        eq(vehiclesTable.vehicle_id, photosTable.vehicle_id)
      )
      .where(inArray(vehiclesTable.vehicle_id, vehicleIdsToDelete));

    // Collect all photo URLs to delete from MinIO
    const photoUrlsToDelete: string[] = [];
    for (const vehicle of vehiclesWithPhotos) {
      if (vehicle.photo_url) {
        photoUrlsToDelete.push(vehicle.photo_url);
      }
    }

    // Delete photos from MinIO
    if (photoUrlsToDelete.length > 0) {
      console.log(
        `Attempting to delete ${photoUrlsToDelete.length} photos from MinIO.`
      );
      await Promise.all(
        photoUrlsToDelete.map(async (photoUrl) => {
          const objectKey = getMinioObjectKey(photoUrl);
          if (objectKey) {
            await deleteFile(objectKey);
          }
        })
      );
      console.log("MinIO photo deletion complete.");
    }

    // Delete from the database (this will cascade delete photos due to foreign key constraints)
    const deletedVehicles = await db
      .delete(vehiclesTable)
      .where(inArray(vehiclesTable.vehicle_id, vehicleIdsToDelete))
      .returning({ vehicle_id: vehiclesTable.vehicle_id });

    // Sync bulk deletion to MeiliSearch
    if (deletedVehicles.length > 0) {
      const deletedIds = deletedVehicles.map((v) => v.vehicle_id);
      const task = await vehiclesIndex.deleteDocuments(deletedIds);
      await pollTask(task.taskUid);
    }

    // Invalidate Redis cache for vehicles and filter options
    const vehicleKeys = await kv.keys("vehicles:*");
    if (vehicleKeys.length > 0) await kv.del(...vehicleKeys);
    await kv.del("filter-options");

    return new Response(
      JSON.stringify({
        message: `${deletedVehicles.length} vehicles deleted.`,
        deletedIds: deletedVehicles.map((v) => v.vehicle_id),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during bulk vehicle deletion:", error);
    return new Response(
      JSON.stringify({ error: "Failed to perform bulk delete." }),
      { status: 500 }
    );
  }
}
