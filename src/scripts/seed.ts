// src/scripts/seed.ts
import db from "~/db/index";
import {
	vehicles,
	gasoline_powertrains,
	electric_powertrains,
	hybrid_powertrains,
	photos,
	features,
	vehicle_features,
	user as userTable,
} from "~/db/schema";
import { faker } from "@faker-js/faker";
import { eq, sql } from "drizzle-orm";

const NUM_VEHICLES_TO_SEED = 20;
const ADMIN_EMAIL = "1@gmail.com";

async function seedVehicles() {
	console.log("Seeding vehicles...");

	const countResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(vehicles);
	const existingVehicleCount = Number(countResult[0]?.count) || 0;

	if (existingVehicleCount >= NUM_VEHICLES_TO_SEED) {
		console.log(
			`Already have ${existingVehicleCount} vehicles. No vehicle seeding needed.`,
		);
		return;
	}

	const neededVehicles = NUM_VEHICLES_TO_SEED - existingVehicleCount;
	console.log(`Need to seed ${neededVehicles} more vehicles.`);

	for (let i = 0; i < neededVehicles; i++) {
		await db.transaction(async (tx) => {
			const [newVehicle] = await tx
				.insert(vehicles)
				.values([
					{
						brand: faker.vehicle.manufacturer(),
						model: faker.vehicle.model(),
						price: faker.commerce.price({ min: 15000, max: 100000 }),
						date_of_manufacture: faker.date.past({ years: 10 }).getFullYear(),
						mileage: faker.number.int({ min: 0, max: 200000 }),
						horsepower: faker.number.int({ min: 100, max: 800 }),
						top_speed_kph: faker.number.int({ min: 160, max: 320 }),
						acceleration_0_100_sec: faker.number
							.float({
								min: 2.5,
								max: 15,
								fractionDigits: 1,
							})
							.toFixed(1),
						transmission: faker.helpers.arrayElement(["Automatic", "Manual"]),
						weight_kg: faker.number.int({ min: 1000, max: 2500 }),
						exterior: faker.vehicle.color(),
						interior: faker.helpers.arrayElement([
							"Black Leather",
							"Gray Fabric",
							"Beige Suede",
						]),
						seating: faker.number.int({ min: 2, max: 7 }),
						warranty: "3 years / 36,000 miles",
						maintenance_booklet: faker.datatype.boolean(),
						powertrain_type: faker.helpers.arrayElement([
							"Gasoline",
							"Electric",
							"Hybrid",
						]),
						general_description: faker.lorem.paragraph(),
						specification_description: faker.lorem.paragraph(),
						appearance_title: faker.lorem.sentence(),
						appearance_description: faker.lorem.paragraph(),
						feature_description: faker.lorem.paragraph(),
					},
				])
				.returning();

			if (!newVehicle) throw new Error("Failed to insert vehicle");

			if (newVehicle.powertrain_type === "Gasoline") {
				await tx.insert(gasoline_powertrains).values([
					{
						vehicle_id: newVehicle.vehicle_id,
						cylinder_amount: faker.number.int({ min: 4, max: 8 }),
						cylinder_capacity_cc: faker.number.int({ min: 1500, max: 5000 }),
						fuel_type: "Gasoline",
					},
				]);
			} else if (newVehicle.powertrain_type === "Electric") {
				await tx.insert(electric_powertrains).values([
					{
						vehicle_id: newVehicle.vehicle_id,
						battery_capacity_kwh: faker.number
							.float({ min: 50, max: 100 })
							.toFixed(1),
						electric_range_km: faker.number.int({ min: 200, max: 600 }),
					},
				]);
			} else if (newVehicle.powertrain_type === "Hybrid") {
				await tx.insert(hybrid_powertrains).values([
					{
						vehicle_id: newVehicle.vehicle_id,
						electric_motor_power_kw: faker.number.int({ min: 20, max: 100 }),
						combustion_engine_power_hp: faker.number.int({ min: 80, max: 400 }),
					},
				]);
			}

			const photosToInsert = [];
			for (let j = 0; j < 6; j++) {
				const seed = faker.string.alphanumeric(10);
				photosToInsert.push({
					vehicle_id: newVehicle.vehicle_id,
					photo_url: `https://source.unsplash.com/random/800x600?car,vehicle&auto=format&fit=crop&w=800&h=600&q=80&sig=${seed}`,
					display_order: j + 1,
				});
			}
			await tx.insert(photos).values(photosToInsert);
		});
	}

	console.log("Vehicle seeding complete.");
}

async function seedAdminUser() {
	// ... (admin user seeding logic remains the same)
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
