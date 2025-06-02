// src/routes/api/products.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, desc, count, Column } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 12;

export async function GET({ request }: APIEvent) {
  console.log("API Route: /api/products endpoint hit.");

  if (!productTable) {
    console.error(
      "API Route CRITICAL: 'productTable' is undefined after import."
    );
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema not loaded.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const columns = productTable as unknown as Record<string, Column>;

  if (!columns || Object.keys(columns).length === 0) {
    console.error(
      "API Route CRITICAL: Columns not found on productTable or productTable is not structured as expected."
    );
    return new Response(
      JSON.stringify({
        error: "Server configuration error: Product schema structure invalid.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10); // Added radix 10
  const pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10 // Added radix 10
  );

  let sortByInput = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder =
    url.searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc";

  const offset = (page - 1) * pageSize;

  if (page < 1) {
    return new Response(
      JSON.stringify({ error: "Page number must be 1 or greater." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (pageSize < 1 || pageSize > 60) {
    return new Response(
      JSON.stringify({ error: `Page size must be between 1 and 60.` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const validSortKeys = Object.keys(columns);
    if (!validSortKeys.includes(sortByInput)) {
      console.warn(
        `API Route WARNING: Invalid sortBy key '${sortByInput}'. Defaulting to 'createdAt'. Valid keys: ${validSortKeys.join(
          ", "
        )}`
      );
      sortByInput = "createdAt";
    }

    const sortColumn = columns[sortByInput];

    if (!sortColumn) {
      console.error(
        `API Route CRITICAL: Sort column object for '${sortByInput}' is undefined.`
      );
      return new Response(
        JSON.stringify({
          error:
            "Server configuration error: Invalid sort column configuration.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const baseQuery = db.select().from(productTable);

    let sortedQuery;
    if (sortOrder === "asc") {
      sortedQuery = baseQuery.orderBy(asc(sortColumn));
    } else {
      sortedQuery = baseQuery.orderBy(desc(sortColumn));
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
    console.error(
      "API Route Error during product query or processing:",
      error.message,
      error.stack
    );
    return new Response(
      JSON.stringify({
        error:
          "Failed to fetch products due to a server error. " +
          (error?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
