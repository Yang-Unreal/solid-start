// src/routes/api/products.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, desc, count, eq, Column } from "drizzle-orm";
import { z } from "zod/v4"; // Assuming this is the correct v4 import

const DEFAULT_PAGE_SIZE = 12; // This default is mostly for the API if no pageSize is provided
const MAX_PAGE_SIZE = 100; // Define a reasonable maximum page size the API will allow

// --- GET Handler ---
export async function GET({ request }: APIEvent) {
  console.log("API Route: /api/products GET endpoint hit.");

  if (!productTable) {
    console.error(
      "API Route CRITICAL: 'productTable' is undefined after import."
    );
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema not loaded.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  const columns = productTable as unknown as Record<string, Column>;
  if (!columns || Object.keys(columns).length === 0) {
    console.error("API Route CRITICAL: Columns not found on productTable.");
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema structure invalid.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  // Use the API's default if not specified, or cap it at MAX_PAGE_SIZE
  let pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE); // Cap the page size

  let sortByInput = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder =
    url.searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";
  const offset = (page - 1) * pageSize;

  if (page < 1) {
    return new Response(
      JSON.stringify({ error: "Page number must be 1 or greater." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  // Check against the (potentially capped) pageSize
  if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return new Response(
      JSON.stringify({
        error: `Page size must be between 1 and ${MAX_PAGE_SIZE}.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const validSortKeys = Object.keys(columns);
    if (!validSortKeys.includes(sortByInput)) {
      sortByInput = "createdAt";
    }
    const sortColumn = columns[sortByInput];
    if (!sortColumn) {
      return new Response(
        JSON.stringify({
          error: "Server configuration error: Invalid sort column.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const initialQuery = db.select().from(productTable);
    let sortedQuery;
    if (sortOrder === "asc") {
      sortedQuery = initialQuery.orderBy(asc(sortColumn));
    } else {
      sortedQuery = initialQuery.orderBy(desc(sortColumn));
    }
    const finalQuery = sortedQuery.limit(pageSize).offset(offset);

    const [productsData, totalCountResult] = await Promise.all([
      finalQuery.execute(),
      db.select({ total: count() }).from(productTable).execute(),
    ]);

    const totalProducts = totalCountResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalProducts / pageSize);

    return new Response(
      JSON.stringify({
        data: productsData,
        pagination: {
          currentPage: page,
          pageSize,
          totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("API Route GET Error:", error.message, error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch products. " + (error?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- POST Handler (Zod v4 adjusted schema) ---
const NewProductPayloadSchema = z.object({
  name: z.string().trim().min(1, { message: "Product name is required." }),
  description: z.string().trim().nullable().optional(),
  priceInCents: z
    .number({ message: "Price must be a valid number for cents." })
    .int({ message: "Price in cents must be an integer." })
    .positive({ message: "Price in cents must be a positive number." }),
  imageUrl: z
    .string()
    .url({ message: "Invalid image URL format." })
    .nullable()
    .optional(),
  category: z.string().trim().nullable().optional(),
  stockQuantity: z
    .number({ message: "Stock quantity must be a valid number." })
    .int({ message: "Stock quantity must be an integer." })
    .min(0, { message: "Stock quantity cannot be negative." }),
});

export async function POST({ request }: APIEvent) {
  console.log("API Route: /api/products POST endpoint hit.");
  try {
    const body = await request.json();
    const validationResult = NewProductPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "API Route POST Validation Error:",
        validationResult.error.flatten()
      );
      return new Response(
        JSON.stringify({
          error: "Invalid input.",
          issues: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const {
      name,
      description,
      priceInCents,
      imageUrl,
      category,
      stockQuantity,
    } = validationResult.data;
    const newProductData = {
      name,
      description: description || null,
      priceInCents,
      imageUrl: imageUrl || null,
      category: category || null,
      stockQuantity,
    };

    const insertedProducts = await db
      .insert(productTable)
      .values(newProductData)
      .returning();
    if (!insertedProducts || insertedProducts.length === 0) {
      console.error(
        "API Route POST: Product insertion failed, no rows returned."
      );
      return new Response(
        JSON.stringify({ error: "Failed to create product in database." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(
      "API Route POST: Product created successfully:",
      insertedProducts[0]
    );
    return new Response(JSON.stringify(insertedProducts[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("API Route POST Error:", error.message, error.stack);
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        error: "Failed to create product. " + (error?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- DELETE Handler ---
const ProductIdSchema = z
  .string()
  .uuid({ message: "Invalid product ID format." });

export async function DELETE({ request }: APIEvent) {
  console.log("API Route: /api/products DELETE endpoint hit.");
  // TODO: Add server-side admin role check here
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  const idValidationResult = ProductIdSchema.safeParse(productId);
  if (!idValidationResult.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid product ID.",
        issues: idValidationResult.error.flatten().formErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const validProductId = idValidationResult.data;

  try {
    const deletedProduct = await db
      .delete(productTable)
      .where(eq(productTable.id, validProductId))
      .returning();
    if (!deletedProduct || deletedProduct.length === 0) {
      return new Response(
        JSON.stringify({ error: "Product not found or already deleted." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log(
      "API Route DELETE: Product deleted successfully:",
      deletedProduct[0]
    );
    return new Response(
      JSON.stringify({
        message: "Product deleted successfully.",
        product: deletedProduct[0],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("API Route DELETE Error:", error.message, error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to delete product. " + (error?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
