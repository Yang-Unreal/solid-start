// src/routes/api/products.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, desc, count, Column } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 12;

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
  const pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
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
  if (pageSize < 1 || pageSize > 60) {
    return new Response(
      JSON.stringify({ error: `Page size must be between 1 and 60.` }),
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

    // Start with the base select
    const initialQuery = db.select().from(productTable);

    // Apply sorting, assigning to a new variable
    let sortedQuery;
    if (sortOrder === "asc") {
      sortedQuery = initialQuery.orderBy(asc(sortColumn));
    } else {
      sortedQuery = initialQuery.orderBy(desc(sortColumn));
    }

    // Apply limit and offset to the sorted query
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

// --- POST Handler (Code is okay, ensure it's correctly placed after GET) ---
interface NewProductPayload {
  name: string;
  description?: string | null;
  priceInCents: number;
  imageUrl?: string | null;
  category?: string | null;
  stockQuantity: number;
}

export async function POST({ request }: APIEvent) {
  console.log("API Route: /api/products POST endpoint hit.");
  try {
    const body = await request.json();
    const {
      name,
      description,
      priceInCents,
      imageUrl,
      category,
      stockQuantity,
    } = body as NewProductPayload;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Product name is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (typeof priceInCents !== "number" || priceInCents <= 0) {
      return new Response(
        JSON.stringify({ error: "Price must be a positive number." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (typeof stockQuantity !== "number" || stockQuantity < 0) {
      return new Response(
        JSON.stringify({
          error: "Stock quantity must be a non-negative number.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newProductData = {
      id: crypto.randomUUID(),
      name: name.trim(),
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
    return new Response(
      JSON.stringify({
        error: "Failed to create product. " + (error?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
