import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { kv } from "~/lib/redis";
import { minio, bucket } from "~/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

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

    if (productIdsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: "No product IDs provided for deletion." }),
        { status: 200 }
      );
    }

    // Fetch products to get image URLs before deletion
    const productsToDelete = await db
      .select()
      .from(productTable)
      .where(inArray(productTable.id, productIdsToDelete));

    const bucketName = bucket;

    if (bucketName) {
      await Promise.all(
        productsToDelete.map(async (product) => {
          const productImages = product.images;
          if (productImages) {
            const imagePaths: string[] = [];
            const getMinioKey = (url: string | undefined) => {
              if (!url) return null;
              const parts = url.split("products/");
              return parts.length > 1 ? `products/${parts[1]}` : null;
            };

            if (productImages.thumbnail) {
              const thumbnailAvif = getMinioKey(productImages.thumbnail?.avif);
              if (thumbnailAvif) imagePaths.push(thumbnailAvif);
              const thumbnailWebp = getMinioKey(productImages.thumbnail?.webp);
              if (thumbnailWebp) imagePaths.push(thumbnailWebp);
              const thumbnailJpeg = getMinioKey(productImages.thumbnail?.jpeg);
              if (thumbnailJpeg) imagePaths.push(thumbnailJpeg);
            }
            if (productImages.detail) {
              const detailAvif = getMinioKey(productImages.detail?.avif);
              if (detailAvif) imagePaths.push(detailAvif);
              const detailWebp = getMinioKey(productImages.detail?.webp);
              if (detailWebp) imagePaths.push(detailWebp);
              const detailJpeg = getMinioKey(productImages.detail?.jpeg);
              if (detailJpeg) imagePaths.push(detailJpeg);
            }

            try {
              await Promise.all(
                imagePaths.map(async (key) => {
                  console.log(
                    `Attempting to delete image from MinIO. Bucket: ${bucketName}, Key: ${key}`
                  );
                  const command = new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                  });
                  await minio.send(command);
                  console.log(`Successfully deleted image: ${key}`);
                })
              );
            } catch (minioError) {
              console.error(
                `Failed to delete one or more images from MinIO for product ID ${product.id}:`,
                minioError
              );
            }
          }
        })
      );
    } else {
      console.warn(
        `MinIO bucket name not set. Skipping image deletion for bulk delete.`
      );
    }

    // Then, delete the products from the database
    const deletedProducts = await db
      .delete(productTable)
      .where(inArray(productTable.id, productIdsToDelete))
      .returning({ id: productTable.id }); // Return only the ID of deleted products

    // Invalidate Redis cache
    const keys = await kv.keys("products:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }

    return new Response(
      JSON.stringify({
        message: `${deletedProducts.length} products and associated images deleted.`,
        deletedCount: deletedProducts.length,
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
