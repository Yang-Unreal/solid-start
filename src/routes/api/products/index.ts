// src/routes/api/products.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable, type ProductImages } from "~/db/schema"; // Import ProductImages type
import { asc, desc, count, eq, and, Column } from "drizzle-orm";
import { z } from "zod/v4";
import { kv } from "~/lib/redis";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;
const CACHE_DURATION_SECONDS = 60;

// --- Schemas ---
const ProductImagesSchema = z.object({
  thumbnail: z.object({
    avif: z.string().url(),
    webp: z.string().url(),
    jpeg: z.string().url(),
  }),
  detail: z.object({
    avif: z.string().url(),
    webp: z.string().url(),
    jpeg: z.string().url(),
  }),
});

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

const UpdateProductPayloadSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().nullable().optional(),
    priceInCents: z.number().int().positive().optional(),
    images: ProductImagesSchema.optional(),
    category: z.string().trim().nullable().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    brand: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    fuelType: z.string().trim().min(1).optional(),
  })
  .partial(); // Make all fields optional for partial update

// --- GET Handler ---
export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const cacheKey = `products:${url.searchParams.toString()}`;

  try {
    const cachedData = await kv.get(cacheKey);
    if (cachedData) {
      return new Response(cachedData, {
        status: 200,
        headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }
  } catch (cacheError) {
    console.error(`Redis Cache Read Error for key ${cacheKey}:`, cacheError);
  }

  const productId = url.searchParams.get("id");
  if (productId) {
    const idValidationResult = z.string().uuid().safeParse(productId);
    if (!idValidationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid product ID." }), {
        status: 400,
      });
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
      return new Response(JSON.stringify({ data: product[0] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching single product:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch product." }),
        {
          status: 500,
        }
      );
    }
  }

  const columns = productTable as unknown as Record<string, Column>;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  let pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  let sortByInput = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder =
    url.searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";
  const brand = url.searchParams.get("brand");
  const category = url.searchParams.get("category");
  const fuelType = url.searchParams.get("fuelType");

  const offset = (page - 1) * pageSize;

  if (!Object.keys(columns).includes(sortByInput)) {
    sortByInput = "createdAt";
  }
  const sortColumn = columns[sortByInput];

  if (!sortColumn) {
    return new Response(
      JSON.stringify({ error: "Server configuration error." }),
      { status: 500 }
    );
  }

  try {
    const whereClauses = [];
    if (brand) {
      whereClauses.push(eq(productTable.brand, brand));
    }
    if (category && category !== "") {
      // Only filter by category if a non-empty category is provided
      whereClauses.push(eq(productTable.category, category));
    }
    if (fuelType) {
      whereClauses.push(eq(productTable.fuelType, fuelType));
    }

    const [productsData, totalCountResult] = await Promise.all([
      db
        .select()
        .from(productTable)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(productTable)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined),
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
    await kv.setex(cacheKey, CACHE_DURATION_SECONDS, jsonBody);
    return new Response(jsonBody, {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" }, // Indicate cache is now active
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch products." }),
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
    const keys = await kv.keys("products:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }
    return new Response(JSON.stringify(insertedProducts[0]), { status: 201 });
  } catch (error) {
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

    // Explicitly set updatedAt for updates
    const dataToUpdate = {
      ...validationResult.data,
      updatedAt: new Date(),
    };

    const updatedProducts = await db
      .update(productTable)
      .set(dataToUpdate)
      .where(eq(productTable.id, idValidationResult.data))
      .returning();

    if (updatedProducts.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }

    const keys = await kv.keys("products:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }

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

// --- DELETE Handler ---
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
    const deletedProduct = await db
      .delete(productTable)
      .where(eq(productTable.id, idValidationResult.data))
      .returning();
    if (deletedProduct.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found." }), {
        status: 404,
      });
    }
    const keys = await kv.keys("products:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }
    return new Response(
      JSON.stringify({
        message: "Product deleted.",
        product: deletedProduct[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to delete product." }),
      { status: 500 }
    );
  }
}
