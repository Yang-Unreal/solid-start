// src/routes/api/products.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, desc, count, eq, Column } from "drizzle-orm";
import { z } from "zod/v4";
import { kv } from "~/lib/redis"; // Import the Dragonfly/Redis client

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;
const CACHE_DURATION_SECONDS = 60; // Cache duration for DragonflyDB

// --- GET Handler ---
export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const cacheKey = `products:${url.searchParams.toString()}`; // Use a prefix for cache keys

  try {
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      console.log(
        `API Route: /api/products GET - Cache HIT for key: ${cacheKey}`
      );
      return new Response(cachedData, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
          "Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}`,
        },
      });
    }
  } catch (cacheError) {
    console.error(`Redis Cache Read Error for key ${cacheKey}:`, cacheError);
    // Continue to fetch from DB if cache read fails
  }

  console.log(`API Route: /api/products GET - Cache MISS for key: ${cacheKey}`);

  if (!productTable) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema not loaded.",
      }),
      { status: 500 }
    );
  }
  const columns = productTable as unknown as Record<string, Column>;
  if (!columns || Object.keys(columns).length === 0) {
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema structure invalid.",
      }),
      { status: 500 }
    );
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  let pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

  let sortByInput = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder =
    url.searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";
  const offset = (page - 1) * pageSize;

  if (page < 1 || pageSize < 1) {
    return new Response(
      JSON.stringify({ error: "Invalid page or pageSize." }),
      { status: 400 }
    );
  }

  try {
    const validSortKeys = Object.keys(columns);
    if (!validSortKeys.includes(sortByInput)) {
      sortByInput = "createdAt";
    }

    const sortColumn = columns[sortByInput];

    // --- THIS IS THE FIX ---
    // We add a guard clause to ensure sortColumn is not undefined before using it.
    // This resolves the TypeScript error.
    if (!sortColumn) {
      console.error(
        `API Route CRITICAL: Default sort column '${sortByInput}' not found in schema.`
      );
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Invalid sort key.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const [productsData, totalCountResult] = await Promise.all([
      db
        .select()
        .from(productTable)
        .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
        .limit(pageSize)
        .offset(offset)
        .execute(),
      db.select({ total: count() }).from(productTable).execute(),
    ]);

    const totalProducts = totalCountResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    const responseBody = {
      data: productsData,
      pagination: {
        currentPage: page,
        pageSize,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    const jsonBody = JSON.stringify(responseBody);

    try {
      await kv.setex(cacheKey, CACHE_DURATION_SECONDS, jsonBody); // Set with expiry
    } catch (cacheError) {
      console.error(`Redis Cache Write Error for key ${cacheKey}:`, cacheError);
      // Do not block response if cache write fails
    }

    return new Response(jsonBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
        "Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}`,
      },
    });
  } catch (error: any) {
    console.error("API Route GET Error:", error.message);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products." }),
      { status: 500 }
    );
  }
}

const NewProductPayloadSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  priceInCents: z.number().int().positive(),
  imageUrl: z.string().url().nullable().optional(),
  category: z.string().trim().nullable().optional(),
  stockQuantity: z.number().int().min(0),
});
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

    // Invalidate all product list caches after a new product is created
    try {
      const keys = await kv.keys("products:*");
      if (keys.length > 0) {
        await kv.del(...keys);
        console.log(
          `API Route: /api/products POST - Invalidated ${keys.length} product cache keys.`
        );
      }
    } catch (cacheError) {
      console.error("Redis Cache Invalidation Error (POST):", cacheError);
    }

    return new Response(JSON.stringify(insertedProducts[0]), { status: 201 });
  } catch (error) {
    console.error("API Route POST Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create product." }),
      { status: 500 }
    );
  }
}

const ProductIdSchema = z.string().uuid();
export async function DELETE({ request }: APIEvent) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");
  const idValidationResult = ProductIdSchema.safeParse(productId);
  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid product ID." }), {
      status: 400,
    });
  }
  try {
    const deletedProduct = await db
      .delete(productTable)
      .where(eq(productTable.id, idValidationResult.data))
      .returning();
    if (deletedProduct.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }

    // Invalidate all product list caches after a product is deleted
    try {
      const keys = await kv.keys("products:*");
      if (keys.length > 0) {
        await kv.del(...keys);
        console.log(
          `API Route: /api/products DELETE - Invalidated ${keys.length} product cache keys.`
        );
      }
    } catch (cacheError) {
      console.error("Redis Cache Invalidation Error (DELETE):", cacheError);
    }

    return new Response(
      JSON.stringify({
        message: "Product deleted.",
        product: deletedProduct[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("API Route DELETE Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete product." }),
      { status: 500 }
    );
  }
}
