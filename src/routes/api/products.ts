import { type APIEvent } from "@solidjs/start/server";
import { getProducts } from "~/lib/product-service";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import db from "~/db";
import { product as productTable } from "~/db/schema";

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  try {
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "12", 10);
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      url.searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    if (page < 1 || pageSize < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid pagination parameters." }),
        { status: 400 }
      );
    }

    const result = await getProducts({ page, pageSize, sortBy, sortOrder });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
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
  imageUrl: z.url().nullable().optional(),
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
          issues: validationResult.error.issues,
        }),
        { status: 400 }
      );
    }
    const insertedProducts = await db
      .insert(productTable)
      .values(validationResult.data)
      .returning();
    return new Response(JSON.stringify(insertedProducts[0]), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to create product." }),
      { status: 500 }
    );
  }
}

const ProductIdSchema = z.uuid();
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
