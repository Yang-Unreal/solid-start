// src/routes/api/products/fuelTypes.ts
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
    const category = url.searchParams.get("category");

    const whereClauses = [];
    if (brand) {
      whereClauses.push(eq(productTable.brand, brand));
    }
    if (category) {
      whereClauses.push(eq(productTable.category, category));
    }

    const fuelTypes = await db
      .selectDistinct({ fuelType: productTable.fuelType })
      .from(productTable)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(asc(productTable.fuelType));

    return new Response(
      JSON.stringify(fuelTypes.map((f) => f.fuelType).filter(Boolean)),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to fetch fuel types:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch fuel types." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
