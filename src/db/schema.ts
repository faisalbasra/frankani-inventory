import { sql } from "drizzle-orm";
import { integer, text, real, sqliteTable } from "drizzle-orm/sqlite-core";

// Main inventory table (from Excel + compatibility tracking)
export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  model: text("model"),
  category: text("category"),
  deler: text("deler"), // Part name in Norwegian
  lagerplass: text("lagerplass"), // Storage location
  antall: integer("antall").default(0), // Quantity
  lagerkode: text("lagerkode"), // Stock code
  utpris_m_mva: real("utpris_m_mva"), // Price with VAT
  evt_bestilltid: text("evt_bestilltid"), // Order time
  leverandor: text("leverandor"), // Supplier
  delenummer_oem: text("delenummer_oem"), // OEM part number
  leverandor_pa_lager: text("leverandor_pa_lager"), // Supplier stock status
  oem_alt: text("oem_alt"), // Alternative OEM numbers
  link: text("link"), // Web link
  webshop_done: integer("webshop_done", { mode: "boolean" }).default(false),
  last_compatibility_check: integer("last_compatibility_check", { mode: "timestamp" }),
  compatibility_status: text("compatibility_status").default("unchecked"), // unchecked, checking, found, not_found
  manual_compatibility_override: integer("manual_compatibility_override", { mode: "boolean" }).default(false),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Lookup table for standardized part categories
export const partCategories = sqliteTable("part_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  name_norwegian: text("name_norwegian"),
  description: text("description"),
  sort_order: integer("sort_order").default(0),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Lookup table for suppliers
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),
  website_url: text("website_url"),
  notes: text("notes"),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Car makes/brands
export const carMakes = sqliteTable("car_makes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  logo_url: text("logo_url"),
  country: text("country"),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Car models
export const carModels = sqliteTable("car_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  make_id: integer("make_id").references(() => carMakes.id),
  name: text("name").notNull(),
  series: text("series"),
  full_name: text("full_name"), // e.g., "80 B2"
  year_from: integer("year_from"),
  year_to: integer("year_to"),
  body_types: text("body_types"), // JSON array as text
  engine_types: text("engine_types"), // JSON array as text
  fuel_types: text("fuel_types"), // JSON array as text
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Car compatibility data
export const compatibleVehicles = sqliteTable("compatible_vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inventory_item_id: integer("inventory_item_id").references(() => inventoryItems.id),
  make_id: integer("make_id").references(() => carMakes.id),
  model_id: integer("model_id").references(() => carModels.id),
  year_from: integer("year_from"),
  year_to: integer("year_to"),
  engine_code: text("engine_code"),
  body_type: text("body_type"),
  fuel_type: text("fuel_type"),
  trim_level: text("trim_level"),
  source: text("source").default("manual"), // manual, polcar_auto
  confidence_score: integer("confidence_score").default(5), // 1-10
  notes: text("notes"),
  verified: integer("verified", { mode: "boolean" }).default(false),
  created_at: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Polcar scraping audit trail
export const polcarLookupHistory = sqliteTable("polcar_lookup_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inventory_item_id: integer("inventory_item_id").references(() => inventoryItems.id),
  oem_number: text("oem_number").notNull(),
  search_url: text("search_url"),
  polcar_response_html: text("polcar_response_html"),
  extracted_vehicles: text("extracted_vehicles"), // JSON as text
  lookup_date: integer("lookup_date", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  processing_time_ms: integer("processing_time_ms"),
  success: integer("success", { mode: "boolean" }).default(false),
  error_message: text("error_message"),
});

// User activity tracking
export const activityLog = sqliteTable("activity_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inventory_item_id: integer("inventory_item_id").references(() => inventoryItems.id),
  action_type: text("action_type").notNull(), // update_quantity, add_compatibility, polcar_lookup, etc.
  old_value: text("old_value"),
  new_value: text("new_value"),
  change_amount: integer("change_amount"),
  user_note: text("user_note"),
  timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// System configuration
export const systemSettings = sqliteTable("system_settings", {
  setting_key: text("setting_key").primaryKey(),
  setting_value: text("setting_value"),
  description: text("description"),
});

// Types for TypeScript
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type PartCategory = typeof partCategories.$inferSelect;
export type NewPartCategory = typeof partCategories.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type CarMake = typeof carMakes.$inferSelect;
export type NewCarMake = typeof carMakes.$inferInsert;
export type CarModel = typeof carModels.$inferSelect;
export type NewCarModel = typeof carModels.$inferInsert;
export type CompatibleVehicle = typeof compatibleVehicles.$inferSelect;
export type NewCompatibleVehicle = typeof compatibleVehicles.$inferInsert;
export type PolcarLookupHistory = typeof polcarLookupHistory.$inferSelect;
export type NewPolcarLookupHistory = typeof polcarLookupHistory.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;