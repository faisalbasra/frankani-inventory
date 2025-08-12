CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventory_item_id` integer,
	`action_type` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`change_amount` integer,
	`user_note` text,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `car_makes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`logo_url` text,
	`country` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `car_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`make_id` integer,
	`name` text NOT NULL,
	`series` text,
	`full_name` text,
	`year_from` integer,
	`year_to` integer,
	`body_types` text,
	`engine_types` text,
	`fuel_types` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`make_id`) REFERENCES `car_makes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `compatible_vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventory_item_id` integer,
	`make_id` integer,
	`model_id` integer,
	`year_from` integer,
	`year_to` integer,
	`engine_code` text,
	`body_type` text,
	`fuel_type` text,
	`trim_level` text,
	`source` text DEFAULT 'manual',
	`confidence_score` integer DEFAULT 5,
	`notes` text,
	`verified` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`make_id`) REFERENCES `car_makes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `car_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model` text,
	`category` text,
	`deler` text,
	`lagerplass` text,
	`antall` integer DEFAULT 0,
	`lagerkode` text,
	`utpris_m_mva` real,
	`evt_bestilltid` text,
	`leverandor` text,
	`delenummer_oem` text,
	`leverandor_pa_lager` text,
	`oem_alt` text,
	`link` text,
	`webshop_done` integer DEFAULT false,
	`last_compatibility_check` integer,
	`compatibility_status` text DEFAULT 'unchecked',
	`manual_compatibility_override` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `part_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`name_norwegian` text,
	`description` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `polcar_lookup_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventory_item_id` integer,
	`oem_number` text NOT NULL,
	`search_url` text,
	`polcar_response_html` text,
	`extracted_vehicles` text,
	`lookup_date` integer DEFAULT CURRENT_TIMESTAMP,
	`processing_time_ms` integer,
	`success` integer DEFAULT false,
	`error_message` text,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact_email` text,
	`contact_phone` text,
	`website_url` text,
	`notes` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`setting_key` text PRIMARY KEY NOT NULL,
	`setting_value` text,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `car_makes_name_unique` ON `car_makes` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `part_categories_name_unique` ON `part_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_name_unique` ON `suppliers` (`name`);