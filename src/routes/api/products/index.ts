// src/routes/api/products/index.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { eq } from "drizzle-orm"; // Corrected Drizzle imports
import { z } from "zod"; // Corrected Zod import
import { kv } from "~/lib/redis";
import { minio, bucket } from "~/lib/minio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { productsIndex, pollTask } from "~/lib/meilisearch";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;
const CACHE_DURATION_SECONDS = 300;
const FILTER_OPTIONS_CACHE_KEY = "filter-options"; // Define the cache key for filter options

// --- Schemas ---
const ImageFormatsSchema = z.object({
  avif: z.string().url(),
  webp: z.string().url(),
  jpeg: z.string().url(),
});

const ProductImagesSchema = z.array(ImageFormatsSchema);

const NewProductPayloadSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  priceInCents: z.number().int().positive(),
  images: ProductImagesSchema,
  category: z.string().trim().nullable().optional(),
  stockQuantity: z.number().int().min(0),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  fuelType: z.string().trim().min(1),
});

const UpdateProductPayloadSchema = NewProductPayloadSchema.partial();

const BulkDeletePayloadSchema = z.object({
  // Re-added missing schema
  ids: z.array(z.string().uuid()).min(1),
});

// --- GET Handler ---
export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  // Handle fetching a single product by ID
  if (productId) {
    const idValidationResult = z.string().uuid().safeParse(productId);
    if (!idValidationResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid product ID format." }),
        {
          status: 400,
        }
      );
    }

    const singleProductCacheKey = `product:${idValidationResult.data}`;
    try {
      const cachedData = await kv.get(singleProductCacheKey);
      if (cachedData) {
        return new Response(cachedData, {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
        });
      }
    } catch (cacheError) {
      console.error(
        `Redis Cache Read Error for key ${singleProductCacheKey}:`,
        cacheError
      );
    }

    try {
      const product = await db
        .select()
        .from(productTable)
        .where(eq(productTable.id, idValidationResult.data))
        .limit(1);

      if (product.length === 0) {
        return new Response(JSON.stringify({ error: "Product not found." }), {
          status: 404,
        });
      }

      const responseBody = {
        data: [product[0]], // Wrap the single product object in an array
        pagination: {
          currentPage: 1,
          pageSize: 1,
          totalProducts: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      const jsonBody = JSON.stringify(responseBody);
      await kv.setex(singleProductCacheKey, CACHE_DURATION_SECONDS, jsonBody);

      return new Response(jsonBody, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    } catch (error: any) {
      console.error(
        `Error fetching product by ID ${idValidationResult.data}:`,
        error
      );
      return new Response(
        JSON.stringify({ error: "Failed to fetch product by ID." }),
        { status: 500 }
      );
    }
  }

  // Existing logic for fetching product lists (MeiliSearch)
  const listCacheKey = `products:list:${url.searchParams.toString()}`;
  try {
    const cachedData = await kv.get(listCacheKey);
    if (cachedData) {
      return new Response(cachedData, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }
  } catch (cacheError) {
    console.error(
      `Redis Cache Read Error for key ${listCacheKey}:`,
      cacheError
    );
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  let pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

  const searchQuery = url.searchParams.get("q") || "";
  const filterQuery = url.searchParams.get("filter") || ""; // Get the filter string from the URL

  try {
    const searchResult = await productsIndex.search(searchQuery, {
      page,
      hitsPerPage: pageSize,
      filter: filterQuery, // Pass the filterQuery directly to MeiliSearch
      facets: ["brand", "category", "fuelType"], // Request facet distributions
    });

    const responseBody = {
      data: searchResult.hits,
      pagination: {
        currentPage: searchResult.page,
        pageSize: searchResult.hitsPerPage,
        totalProducts: searchResult.totalHits,
        totalPages: searchResult.totalPages,
        hasNextPage: searchResult.page < searchResult.totalPages,
        hasPreviousPage: searchResult.page > 1,
      },
      facets: searchResult.facetDistribution, // Include facet distributions in the response
    };
    const jsonBody = JSON.stringify(responseBody);
    await kv.setex(listCacheKey, CACHE_DURATION_SECONDS, jsonBody);

    return new Response(jsonBody, {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error: any) {
    console.error("MeiliSearch search error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to search for products." }),
      { status: 500 }
    );
  }
}

// --- POST Handler ---
export async function POST({ request }: APIEvent) {
  try {
    const body = await request.json();
    const validationResult = NewProductPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    const insertedProducts = await db
      .insert(productTable)
      .values(validationResult.data)
      .returning();

    if (insertedProducts.length > 0) {
      const newProduct = insertedProducts[0]!; // Assert newProduct is not undefined
      const task = await productsIndex.addDocuments([newProduct]);
      await pollTask(task.taskUid); // Wait for MeiliSearch to process the addition
    }

    const keys = await kv.keys("products:*");
    if (keys.length > 0) await kv.del(...keys);
    await kv.del(FILTER_OPTIONS_CACHE_KEY); // Invalidate filter options cache

    return new Response(JSON.stringify(insertedProducts[0]), { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create product." }),
      { status: 500 }
    );
  }
}

// --- PUT Handler ---
export async function PUT({ request }: APIEvent) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");
  const idValidationResult = z.string().uuid().safeParse(productId);
  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid product ID." }), {
      status: 400,
    });
  }

  try {
    const body = await request.json();
    const validationResult = UpdateProductPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input for product update.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    if (Object.keys(validationResult.data).length === 0) {
      return new Response(
        JSON.stringify({ message: "No update data provided." }),
        { status: 200 }
      );
    }

    const dataToUpdate = { ...validationResult.data, updatedAt: new Date() };
    const updatedProducts = await db
      .update(productTable)
      .set(dataToUpdate)
      .where(eq(productTable.id, idValidationResult.data))
      .returning();

    if (updatedProducts.length > 0) {
      const updatedProduct = updatedProducts[0]!; // Assert updatedProduct is not undefined
      const task = await productsIndex.updateDocuments([updatedProduct]);
      await pollTask(task.taskUid); // Wait for MeiliSearch to process the update
    } else {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }

    const keys = await kv.keys("products:*");
    if (keys.length > 0) await kv.del(...keys);
    await kv.del(FILTER_OPTIONS_CACHE_KEY); // Invalidate filter options cache

    return new Response(
      JSON.stringify({
        message: "Product updated successfully.",
        product: updatedProducts[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update product." }),
      { status: 500 }
    );
  }
}

// --- DELETE Handler (single product) ---
export async function DELETE({ request }: APIEvent) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");
  const idValidationResult = z.string().uuid().safeParse(productId);
  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid product ID." }), {
      status: 400,
    });
  }
  try {
    // First, fetch the product to get image URLs
    const productToDelete = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, idValidationResult.data))
      .limit(1);

    if (productToDelete.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }

    const product = productToDelete[0];
    if (!product) {
      // This case should ideally be caught by productToDelete.length === 0, but as a safeguard
      return new Response(
        JSON.stringify({ error: "Product data is corrupt." }),
        {
          status: 500,
        }
      );
    }

    const productImages = product.images;
    // Use the 'bucket' constant imported from minio.ts for consistency
    const bucketName = bucket;

    if (bucketName && productImages) {
      const imagePaths: string[] = [];
      const getMinioKey = (url: string | undefined) => {
        if (!url) return null;
        const parts = url.split("products/");
        return parts.length > 1 ? `products/${parts[1]}` : null;
      };

      // Iterate over the array of images and collect all paths
      for (const image of productImages) {
        const avif = getMinioKey(image.avif);
        if (avif) imagePaths.push(avif);
        const webp = getMinioKey(image.webp);
        if (webp) imagePaths.push(webp);
        const jpeg = getMinioKey(image.jpeg);
        if (jpeg) imagePaths.push(jpeg);
      }

      // Attempt to delete images from MinIO
      try {
        // Use Promise.all to concurrently delete all image files
        await Promise.all(
          imagePaths.map(async (key) => {
            console.log(
              `Attempting to delete image from MinIO. Bucket: ${bucketName}, Key: ${key}`
            ); // Added for debugging
            const command = new DeleteObjectCommand({
              Bucket: bucketName,
              Key: key,
            });
            await minio.send(command);
            console.log(`Successfully deleted image: ${key}`);
          })
        );
        console.log(
          `Successfully deleted all associated images for product ID: ${idValidationResult.data}`
        );
      } catch (minioError) {
        console.error(
          `Failed to delete one or more images from MinIO for product ID ${idValidationResult.data}:`,
          minioError
        );
        // Log the error but continue with database deletion to avoid orphaned records
      }
    } else {
      console.warn(
        `MinIO bucket name not set or no images found for product ID: ${idValidationResult.data}. Skipping image deletion.`
      );
    }

    // Then, delete the product from the database
    const deletedProduct = await db
      .delete(productTable)
      .where(eq(productTable.id, idValidationResult.data))
      .returning();

    // Delete from MeiliSearch
    const task = await productsIndex.deleteDocument(idValidationResult.data);
    await pollTask(task.taskUid); // Wait for MeiliSearch to process the deletion

    // Invalidate Redis cache
    const keys = await kv.keys("products:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }
    await kv.del(FILTER_OPTIONS_CACHE_KEY); // Invalidate filter options cache

    return new Response(
      JSON.stringify({
        message: "Product and associated images deleted.",
        product: deletedProduct[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete product." }),
      { status: 500 }
    );
  }
}
