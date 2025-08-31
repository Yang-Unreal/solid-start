// src/scripts/seed.ts
import db from "~/db/index";
import {
  vehicles,
  engineDetails,
  electricDetails,
  features,
  vehicleFeaturesLink,
  photos,
  user as userTable,
} from "~/db/schema";
import { faker } from "@faker-js/faker";
import { eq, sql } from "drizzle-orm";

const NUM_VEHICLES_TO_SEED = 50;
const ADMIN_EMAIL = "1@gmail.com";

async function seedVehicles() {
  console.log("Seeding vehicles...");

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(vehicles);
  const existingVehicleCount = Number(countResult[0]?.count) || 0;

  if (existingVehicleCount >= NUM_VEHICLES_TO_SEED) {
    console.log(
      `Already have ${existingVehicleCount} vehicles. No vehicle seeding needed.`
    );
    return;
  }

  const neededVehicles = NUM_VEHICLES_TO_SEED - existingVehicleCount;
  console.log(`Need to seed ${neededVehicles} more vehicles.`);

  // Seed Features
  const featureList: {
    feature_name: string;
    feature_category:
      | "Comfort and convenience"
      | "Entertainment and Media"
      | "Safety and security"
      | "Additional";
  }[] = [
    {
      feature_name: "Air Conditioning",
      feature_category: "Comfort and convenience",
    },
    {
      feature_name: "Heated Seats",
      feature_category: "Comfort and convenience",
    },
    { feature_name: "Sunroof", feature_category: "Comfort and convenience" },
    { feature_name: "Bluetooth", feature_category: "Entertainment and Media" },
    {
      feature_name: "Apple CarPlay",
      feature_category: "Entertainment and Media",
    },
    {
      feature_name: "Android Auto",
      feature_category: "Entertainment and Media",
    },
    { feature_name: "Backup Camera", feature_category: "Safety and security" },
    {
      feature_name: "Blind Spot Monitoring",
      feature_category: "Safety and security",
    },
    {
      feature_name: "Lane Departure Warning",
      feature_category: "Safety and security",
    },
    { feature_name: "Roof Rack", feature_category: "Additional" },
    { feature_name: "Towing Package", feature_category: "Additional" },
  ];

  let insertedFeatures = await db.select().from(features);
  if (insertedFeatures.length === 0) {
    console.log("Seeding features...");
    insertedFeatures = await db
      .insert(features)
      .values(featureList)
      .returning();
    console.log(`Seeded ${insertedFeatures.length} features.`);
  } else {
    console.log("Features already exist.");
  }

  for (let i = 0; i < neededVehicles; i++) {
    const powertrain_type = faker.helpers.arrayElement([
      "Gasoline",
      "Hybrid",
      "Electric",
    ]);

    const vehicle = await db
      .insert(vehicles)
      .values({
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        price: faker.finance.amount({ min: 15000, max: 80000, dec: 2 }),
        date_of_manufacture: faker.date.past({ years: 10 }).getFullYear(),
        mileage: faker.number.int({ min: 1000, max: 150000 }),
        horsepower: faker.number.int({ min: 120, max: 500 }),
        top_speed_kph: faker.number.int({ min: 160, max: 300 }),
        acceleration_0_100_sec: faker.number
          .float({ min: 3, max: 12, fractionDigits: 1 })
          .toString(),
        transmission: faker.helpers.arrayElement(["Automatic", "Manual"]),
        weight_kg: faker.number.int({ min: 1200, max: 2500 }),
        exterior: faker.color.human(),
        interior: faker.color.human(),
        seating: faker.helpers.arrayElement([2, 4, 5, 7]),
        warranty: "3-year/36,000-mile",
        maintenance_booklet: faker.datatype.boolean(),
        powertrain_type,
        general_description: faker.lorem.paragraph(),
        specification_description: faker.lorem.paragraph(),
        appearance_title: faker.lorem.sentence(),
        appearance_description: faker.lorem.paragraph(),
        feature_description: faker.lorem.paragraph(),
      })
      .returning();

    const vehicle_id = vehicle[0]?.vehicle_id;

    if (!vehicle_id) {
      console.error("Failed to create vehicle, skipping dependent seeds.");
      continue;
    }

    if (powertrain_type === "Gasoline" || powertrain_type === "Hybrid") {
      await db.insert(engineDetails).values({
        vehicle_id,
        cylinder_amount: faker.helpers.arrayElement([4, 6, 8]),
        cylinder_capacity_cc: faker.number.int({ min: 1500, max: 5000 }),
        fuel_type: "Gasoline",
      });
    }

    if (powertrain_type === "Electric" || powertrain_type === "Hybrid") {
      await db.insert(electricDetails).values({
        vehicle_id,
        battery_capacity_kwh: faker.number
          .float({ min: 40, max: 100, fractionDigits: 1 })
          .toString(),
        electric_range_km: faker.number.int({ min: 200, max: 600 }),
      });
    }

    // Link features
    const numFeatures = faker.number.int({ min: 3, max: 8 });
    const selectedFeatures = faker.helpers.arrayElements(
      insertedFeatures,
      numFeatures
    );
    await db
      .insert(vehicleFeaturesLink)
      .values(
        selectedFeatures.map((f) => ({ vehicle_id, feature_id: f.feature_id }))
      );

    // Seed photos
    const photoList = [];
    for (let j = 1; j <= 6; j++) {
      photoList.push({
        vehicle_id,
        photo_url: faker.image.urlLoremFlickr({ category: "transportation" }),
        display_order: j,
      });
    }
    await db.insert(photos).values(photoList);
  }

  console.log(`Seeded ${neededVehicles} vehicles.`);
  console.log("Vehicle seeding complete.");
}

async function seedAdminUser() {
  console.log(`Checking for admin user: ${ADMIN_EMAIL}...`);

  try {
    const existingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser.length > 0) {
      const currentUser = existingUser[0];
      if (currentUser) {
        if (currentUser.role !== "admin") {
          await db
            .update(userTable)
            .set({ role: "admin" })
            .where(eq(userTable.id, currentUser.id));
          console.log(`User ${ADMIN_EMAIL} updated to admin role.`);
        } else {
          console.log(`User ${ADMIN_EMAIL} is already an admin.`);
        }
      }
    } else {
      console.log(
        `Admin user ${ADMIN_EMAIL} not found. This script will not create them.`
      );
    }
  } catch (error) {
    console.error(`Error processing admin user ${ADMIN_EMAIL}:`, error);
  }
  console.log("Admin user seeding check complete.");
}

async function main() {
  try {
    await seedVehicles();
    await seedAdminUser();
    console.log("Seed script finished successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();
