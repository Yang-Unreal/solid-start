import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  serial,
  varchar,
  decimal,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

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
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

// --- New Vehicle Schema ---

export const powertrainTypeEnum = pgEnum("powertrain_type", [
  "Gasoline",
  "Hybrid",
  "Electric",
]);

export const vehicles = pgTable("vehicles", {
  vehicle_id: serial("vehicle_id").primaryKey(),
  brand: varchar("brand", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  date_of_manufacture: integer("date_of_manufacture").notNull(),
  mileage: integer("mileage").notNull(),
  horsepower: integer("horsepower").notNull(),
  top_speed_kph: integer("top_speed_kph").notNull(),
  acceleration_0_100_sec: decimal("acceleration_0_100_sec", {
    precision: 4,
    scale: 1,
  }).notNull(),
  transmission: varchar("transmission", { length: 50 }).notNull(),
  weight_kg: integer("weight_kg").notNull(),
  exterior: varchar("exterior", { length: 100 }).notNull(),
  interior: varchar("interior", { length: 100 }).notNull(),
  seating: integer("seating").notNull(),
  warranty: varchar("warranty", { length: 255 }),
  maintenance_booklet: boolean("maintenance_booklet").default(false).notNull(),
  powertrain_type: powertrainTypeEnum("powertrain_type").notNull(),
  general_description: text("general_description"),
  specification_description: text("specification_description"),
  appearance_title: varchar("appearance_title", { length: 255 }),
  appearance_description: text("appearance_description"),
  feature_description: text("feature_description"),
});

export const engineDetails = pgTable("engine_details", {
  vehicle_id: integer("vehicle_id")
    .primaryKey()
    .references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
  cylinder_amount: integer("cylinder_amount"),
  cylinder_capacity_cc: integer("cylinder_capacity_cc"),
  fuel_type: varchar("fuel_type", { length: 50 }),
});

export const electricDetails = pgTable("electric_details", {
  vehicle_id: integer("vehicle_id")
    .primaryKey()
    .references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
  battery_capacity_kwh: decimal("battery_capacity_kwh", {
    precision: 5,
    scale: 1,
  }),
  electric_range_km: integer("electric_range_km"),
});

export const featureCategoryEnum = pgEnum("feature_category", [
  "Comfort and convenience",
  "Entertainment and Media",
  "Safety and security",
  "Additional",
]);

export const features = pgTable("features", {
  feature_id: serial("feature_id").primaryKey(),
  feature_name: varchar("feature_name", { length: 100 }).notNull(),
  feature_category: featureCategoryEnum("feature_category").notNull(),
});

export const vehicleFeaturesLink = pgTable(
  "vehicle_features_link",
  {
    vehicle_id: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
    feature_id: integer("feature_id")
      .notNull()
      .references(() => features.feature_id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.vehicle_id, t.feature_id),
  })
);

export const photos = pgTable("photos", {
  photo_id: serial("photo_id").primaryKey(),
  vehicle_id: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.vehicle_id, { onDelete: "cascade" }),
  photo_url: varchar("photo_url", { length: 255 }).notNull(),
  display_order: integer("display_order").notNull(),
});

export type Vehicle = InferSelectModel<typeof vehicles>;
export type EngineDetail = InferSelectModel<typeof engineDetails>;
export type ElectricDetail = InferSelectModel<typeof electricDetails>;
export type Feature = InferSelectModel<typeof features>;
export type Photo = InferSelectModel<typeof photos>;
