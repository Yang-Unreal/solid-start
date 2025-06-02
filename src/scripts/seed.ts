// scripts/seed.ts (or src/scripts/seed.ts)
import db from "~/db/index"; // Or ../db/index if in src/scripts
import { product } from "~/db/schema"; // Or ../db/schema
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";

const NUM_PRODUCTS_TO_SEED = 50;

async function seedProducts() {
  console.log("Seeding products...");

  // Fetch the count of existing products
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(product);

  // Safely access the count, defaulting to 0 if result is empty or count is missing
  const existingProductCount = Number(countResult[0]?.count || 0); // <-- MODIFIED LINE

  if (existingProductCount >= NUM_PRODUCTS_TO_SEED) {
    console.log(
      `Already have ${existingProductCount} products. No seeding needed.`
    );
    return;
  }

  const productsToInsert = [];
  const neededProducts = NUM_PRODUCTS_TO_SEED - existingProductCount;

  console.log(`Need to seed ${neededProducts} more products.`);

  for (let i = 0; i < neededProducts; i++) {
    productsToInsert.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      priceInCents: parseInt(
        faker.commerce.price({ min: 1000, max: 30000, dec: 0 }),
        10
      ),
      imageUrl: faker.image.urlPicsumPhotos({ width: 640, height: 480 }),
      category: faker.commerce.department(),
      stockQuantity: faker.number.int({ min: 0, max: 100 }),
      // createdAt and updatedAt have defaultNow() in your schema
    });
  }

  if (productsToInsert.length > 0) {
    console.log(`Inserting ${productsToInsert.length} new products...`);
    await db.insert(product).values(productsToInsert);
    console.log(`Seeded ${productsToInsert.length} products.`);
  } else if (neededProducts > 0) {
    // Only log this if we intended to insert but didn't
    console.log(
      "No new products were seeded (unexpected, check productsToInsert logic)."
    );
  }

  console.log("Product seeding complete.");
}

async function main() {
  try {
    await seedProducts();
    console.log("Seed script finished successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    // For node-postgres Pool, explicit closing isn't strictly necessary on script exit
    // but can be good practice if your db object exports the pool directly.
    // Your `db` export is `drizzle(pool, { schema })`, so the pool is managed.
  }
}

main();
