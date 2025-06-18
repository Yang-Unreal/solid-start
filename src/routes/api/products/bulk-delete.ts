// src/routes/api/products/bulk-delete.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { kv } from "~/lib/redis";
import { minio, bucket } from "~/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { productsIndex } from "~/lib/meilisearch"; // <-- Import MeiliSearch index

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
        { status: 400 }
      );
    }

    const productIdsToDelete = validationResult.data.ids;

    // ... (Image deletion logic for MinIO remains the same) ...

    // Delete from the database
    const deletedProducts = await db
      .delete(productTable)
      .where(inArray(productTable.id, productIdsToDelete))
      .returning({ id: productTable.id });

    // Sync bulk deletion to MeiliSearch
    if (deletedProducts.length > 0) {
      const deletedIds = deletedProducts.map((p) => p.id);
      await productsIndex.deleteDocuments(deletedIds);
    }

    // Invalidate Redis cache
    const keys = await kv.keys("products:*");
    if (keys.length > 0) await kv.del(...keys);

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
