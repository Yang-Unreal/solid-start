// src/routes/api/products/brands.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, eq, and } from "drizzle-orm";

export async function GET({ request }: APIEvent) {
  try {
    // --- FIX START ---
    // The request.url from the server event is a full URL.
    const url = new URL(request.url);
    // --- FIX END ---
    const category = url.searchParams.get("category");
    const fuelType = url.searchParams.get("fuelType");

    const whereClauses = [];
    if (category) {
      whereClauses.push(eq(productTable.category, category));
    }
    if (fuelType) {
      whereClauses.push(eq(productTable.fuelType, fuelType));
    }

    const brands = await db
      .selectDistinct({ brand: productTable.brand })
      .from(productTable)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(asc(productTable.brand));

    return new Response(JSON.stringify(brands.map((b) => b.brand)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch brands." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
