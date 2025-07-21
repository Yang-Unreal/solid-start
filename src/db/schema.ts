import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb, // Import the jsonb type
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

// --- Product Schema (Updated) ---

/**
 * Defines the expected structure for the 'images' column in the product table.
 * This will now store an array of string URLs.
 */
export type ProductImages = string[];

export const product = pgTable("product", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),

  /**
   * CHANGE: `images` now stores an array of string URLs.
   */
  images: jsonb("images").$type<ProductImages>().notNull(),

  category: text("category"),
  stockQuantity: integer("stock_quantity").default(0).notNull(),

  // CHANGE: Added new fields for brand, model, and fuel type.
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  fuelType: text("fuel_type").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = InferSelectModel<typeof product>;
