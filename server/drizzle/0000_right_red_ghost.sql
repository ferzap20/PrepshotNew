CREATE TABLE "app_settings" (
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"value" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "app_settings_key_user_id_pk" PRIMARY KEY("key","user_id")
);
--> statement-breakpoint
CREATE TABLE "catalog_items" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"brand" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"compatibility_notes" text DEFAULT '' NOT NULL,
	"image_url" text,
	"subcategory" text,
	"mount" text,
	"specs" jsonb,
	"weight_kg" real,
	"connectors" jsonb,
	"source" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_rental_sources" (
	"catalog_item_id" text NOT NULL,
	"rental_source_id" text NOT NULL,
	CONSTRAINT "catalog_rental_sources_catalog_item_id_rental_source_id_pk" PRIMARY KEY("catalog_item_id","rental_source_id")
);
--> statement-breakpoint
CREATE TABLE "daily_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"day_id" text NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_list_modifications" (
	"id" text PRIMARY KEY NOT NULL,
	"day_id" text NOT NULL,
	"catalog_item_id" text NOT NULL,
	"modification_type" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_general_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"catalog_item_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"source" text,
	"user_gear_id" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"crew_type" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"joined_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"crew_type" text DEFAULT '' NOT NULL,
	"start_date" text,
	"end_date" text,
	"trial_start_date" text,
	"trial_end_date" text,
	"role" text DEFAULT '' NOT NULL,
	"production_company" text DEFAULT '' NOT NULL,
	"first_ac" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"latitude" real,
	"longitude" real,
	"contact_info" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shooting_days" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"date" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_items" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"catalog_item_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_gear" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"catalog_item_id" text NOT NULL,
	"serial_number" text DEFAULT '' NOT NULL,
	"condition" text DEFAULT 'Good' NOT NULL,
	"purchase_date" text,
	"notes" text DEFAULT '' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"name" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_rental_sources" ADD CONSTRAINT "catalog_rental_sources_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog_rental_sources" ADD CONSTRAINT "catalog_rental_sources_rental_source_id_rental_sources_id_fk" FOREIGN KEY ("rental_source_id") REFERENCES "public"."rental_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_documents" ADD CONSTRAINT "daily_documents_day_id_shooting_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."shooting_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_list_modifications" ADD CONSTRAINT "day_list_modifications_day_id_shooting_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."shooting_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_list_modifications" ADD CONSTRAINT "day_list_modifications_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_general_lists" ADD CONSTRAINT "project_general_lists_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_general_lists" ADD CONSTRAINT "project_general_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_general_lists" ADD CONSTRAINT "project_general_lists_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shooting_days" ADD CONSTRAINT "shooting_days_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_template_id_package_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."package_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_items" ADD CONSTRAINT "template_items_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gear" ADD CONSTRAINT "user_gear_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gear" ADD CONSTRAINT "user_gear_catalog_item_id_catalog_items_id_fk" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE cascade ON UPDATE no action;