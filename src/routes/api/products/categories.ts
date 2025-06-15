// src/routes/api/products/categories.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, eq, and } from "drizzle-orm";

export async function GET({ request }: APIEvent) {
  try {
    // --- FIX START ---
    const url = new URL(request.url);
    // --- FIX END ---
    const brand = url.searchParams.get("brand");
    const fuelType = url.searchParams.get("fuelType");

    const whereClauses = [];
    if (brand) {
      whereClauses.push(eq(productTable.brand, brand));
    }
    if (fuelType) {
      whereClauses.push(eq(productTable.fuelType, fuelType));
    }

    const categories = await db
      .selectDistinct({ category: productTable.category })
      .from(productTable)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(asc(productTable.category));

    return new Response(
      JSON.stringify(categories.map((c) => c.category).filter(Boolean)),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
