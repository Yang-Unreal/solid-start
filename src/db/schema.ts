import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	uuid,
	varchar,
	decimal,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
// --- User, Session, Account, and Verification Tables (Unchanged) ---

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

// --- New Vehicle Schema ---

export const powertrainTypeEnum = pgEnum("powertrain_type", [
	"Gasoline",
	"Hybrid",
	"Electric",
]);
export const featureCategoryEnum = pgEnum("feature_category", [
	"Comfort and convenience",
	"Entertainment and Media",
	"Safety and security",
	"Additional",
]);

export const vehicles = pgTable("vehicles", {
	vehicle_id: uuid("vehicle_id").defaultRandom().primaryKey(),
	brand: varchar("brand", { length: 50 }),
	model: varchar("model", { length: 50 }),
	price: decimal("price", { precision: 12, scale: 2 }),
	date_of_manufacture: integer("date_of_manufacture"),
	mileage: integer("mileage"),
	horsepower: integer("horsepower"),
	top_speed_kph: integer("top_speed_kph"),
	acceleration_0_100_sec: decimal("acceleration_0_100_sec", {
		precision: 4,
		scale: 1,
	}),
	transmission: varchar("transmission", { length: 50 }),
	weight_kg: integer("weight_kg"),
	exterior: varchar("exterior", { length: 100 }),
	interior: varchar("interior", { length: 100 }),
	seating: integer("seating"),
	warranty: varchar("warranty", { length: 255 }),
	maintenance_booklet: boolean("maintenance_booklet"),
	powertrain_type: powertrainTypeEnum("powertrain_type"),
	general_description: text("general_description"),
	specification_description: text("specification_description"),
	appearance_title: varchar("appearance_title", { length: 255 }),
	appearance_description: text("appearance_description"),
	feature_description: text("feature_description"),
});

export const gasoline_powertrains = pgTable("gasoline_powertrains", {
	vehicle_id: uuid("vehicle_id")
		.primaryKey()
		.references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
	cylinder_amount: integer("cylinder_amount"),
	cylinder_capacity_cc: integer("cylinder_capacity_cc"),
	fuel_type: varchar("fuel_type", { length: 50 }),
});

export const electric_powertrains = pgTable("electric_powertrains", {
	vehicle_id: uuid("vehicle_id")
		.primaryKey()
		.references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
	battery_capacity_kwh: decimal("battery_capacity_kwh", {
		precision: 5,
		scale: 1,
	}),
	electric_range_km: integer("electric_range_km"),
});

// Note: The user did not specify hybrid powertrain details, so we'll create a simple table for it.
export const hybrid_powertrains = pgTable("hybrid_powertrains", {
	vehicle_id: uuid("vehicle_id")
		.primaryKey()
		.references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
	electric_motor_power_kw: integer("electric_motor_power_kw"),
	combustion_engine_power_hp: integer("combustion_engine_power_hp"),
});

export const features = pgTable("features", {
	feature_id: uuid("feature_id").defaultRandom().primaryKey(),
	feature_name: varchar("feature_name", { length: 100 }),
	feature_category: featureCategoryEnum("feature_category"),
});

export const vehicle_features = pgTable("vehicle_features", {
	vehicle_id: uuid("vehicle_id")
		.notNull()
		.references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
	feature_id: uuid("feature_id")
		.notNull()
		.references(() => features.feature_id, { onDelete: "cascade" }),
});

export const photos = pgTable("photos", {
	photo_id: uuid("photo_id").defaultRandom().primaryKey(),
	vehicle_id: uuid("vehicle_id")
		.notNull()
		.references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
	photo_url: varchar("photo_url", { length: 255 }),
	display_order: integer("display_order"),
});

// Relations
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
	photos: many(photos),
	gasoline_powertrain: one(gasoline_powertrains, {
		fields: [vehicles.vehicle_id],
		references: [gasoline_powertrains.vehicle_id],
	}),
	electric_powertrain: one(electric_powertrains, {
		fields: [vehicles.vehicle_id],
		references: [electric_powertrains.vehicle_id],
	}),
	hybrid_powertrain: one(hybrid_powertrains, {
		fields: [vehicles.vehicle_id],
		references: [hybrid_powertrains.vehicle_id],
	}),
	features: many(vehicle_features),
}));

export const photosRelations = relations(photos, ({ one }) => ({
	vehicle: one(vehicles, {
		fields: [photos.vehicle_id],
		references: [vehicles.vehicle_id],
	}),
}));

export const gasolinePowertrainsRelations = relations(
	gasoline_powertrains,
	({ one }) => ({
		vehicle: one(vehicles, {
			fields: [gasoline_powertrains.vehicle_id],
			references: [vehicles.vehicle_id],
		}),
	}),
);

export const electricPowertrainsRelations = relations(
	electric_powertrains,
	({ one }) => ({
		vehicle: one(vehicles, {
			fields: [electric_powertrains.vehicle_id],
			references: [vehicles.vehicle_id],
		}),
	}),
);

export const hybridPowertrainsRelations = relations(
	hybrid_powertrains,
	({ one }) => ({
		vehicle: one(vehicles, {
			fields: [hybrid_powertrains.vehicle_id],
			references: [vehicles.vehicle_id],
		}),
	}),
);

export const featuresRelations = relations(features, ({ many }) => ({
	vehicle_features: many(vehicle_features),
}));

export const vehicleFeaturesRelations = relations(
	vehicle_features,
	({ one }) => ({
		vehicle: one(vehicles, {
			fields: [vehicle_features.vehicle_id],
			references: [vehicles.vehicle_id],
		}),
		feature: one(features, {
			fields: [vehicle_features.feature_id],
			references: [features.feature_id],
		}),
	}),
);

export type Vehicle = InferSelectModel<typeof vehicles>;
export type Feature = InferSelectModel<typeof features>;
export type Photo = InferSelectModel<typeof photos>;
