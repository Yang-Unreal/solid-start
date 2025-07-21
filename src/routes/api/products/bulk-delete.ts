// src/routes/api/products/bulk-delete.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { kv } from "~/lib/redis";
import { minio, bucket, endpoint } from "~/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { productsIndex, pollTask } from "~/lib/meilisearch";

const BulkDeletePayloadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

// Helper function to extract MinIO object key from a full URL
const getMinioObjectKey = (url: string | undefined): string | null => {
  if (!url || !endpoint || !bucket) return null;
  const baseUrl = `${endpoint}/${bucket}/`;
  if (url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length);
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

    const productIdsToDelete = validationResult.data.ids;

    // Fetch product image URLs before deleting from the database
    const productsWithImages = await db
      .select({ images: productTable.images })
      .from(productTable)
      .where(inArray(productTable.id, productIdsToDelete));

    // Collect all image keys to delete from MinIO
    const imageKeysToDelete: string[] = [];
    for (const product of productsWithImages) {
      if (product.images && Array.isArray(product.images)) {
        for (const imageUrl of product.images) {
          const imageKey = getMinioObjectKey(imageUrl);
          if (imageKey) imageKeysToDelete.push(imageKey);
        }
      }
    }

    // Delete images from MinIO
    if (imageKeysToDelete.length > 0) {
      console.log(
        `Attempting to delete ${imageKeysToDelete.length} images from MinIO.`
      );
      await Promise.all(
        imageKeysToDelete.map((key) =>
          minio.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
        )
      );
      console.log("MinIO image deletion complete.");
    }

    // Delete from the database
    const deletedProducts = await db
      .delete(productTable)
      .where(inArray(productTable.id, productIdsToDelete))
      .returning({ id: productTable.id });

    // Sync bulk deletion to MeiliSearch
    if (deletedProducts.length > 0) {
      const deletedIds = deletedProducts.map((p) => p.id);
      const task = await productsIndex.deleteDocuments(deletedIds);
      await pollTask(task.taskUid);
    }

    // Invalidate Redis cache for products and filter options
    const productKeys = await kv.keys("products:*");
    if (productKeys.length > 0) await kv.del(...productKeys);
    await kv.del("filter-options");

    return new Response(
      JSON.stringify({
        message: `${deletedProducts.length} products deleted.`,
        deletedIds: deletedProducts.map((p) => p.id),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during bulk product deletion:", error);
    return new Response(
      JSON.stringify({ error: "Failed to perform bulk delete." }),
      { status: 500 }
    );
  }
}
