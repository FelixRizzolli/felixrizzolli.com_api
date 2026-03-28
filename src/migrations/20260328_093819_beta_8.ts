import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de', 'it');
  CREATE TYPE "public"."enum_wedding_users_settings_language" AS ENUM('english', 'deutsch', 'italiano');
  CREATE TYPE "public"."enum_wedding_users_settings_gallery_grid_gap" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_wedding_users_settings_gallery_view" AS ENUM('default', 'tiles', 'masonry');
  CREATE TYPE "public"."enum_wedding_categories_type" AS ENUM('images', 'people');
  CREATE TABLE "roles_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "wedding_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"username" varchar NOT NULL,
  	"invitation_token" varchar NOT NULL,
  	"settings_language" "enum_wedding_users_settings_language",
  	"settings_gallery_grid_gap" "enum_wedding_users_settings_gallery_grid_gap",
  	"settings_gallery_view" "enum_wedding_users_settings_gallery_view",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wedding_users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"roles_id" integer,
  	"wedding_categories_id" integer
  );
  
  CREATE TABLE "wedding_images_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"wedding_categories_id" integer,
  	"wedding_users_id" integer
  );
  
  CREATE TABLE "wedding_categories_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "wedding_category_groups_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "wedding_images" RENAME COLUMN "cloudflare_link" TO "cdn_link";
  DROP INDEX "wedding_images_cloudflare_link_idx";
  ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;
  ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "wedding_categories" ADD COLUMN "type" "enum_wedding_categories_type" DEFAULT 'images' NOT NULL;
  ALTER TABLE "wedding_categories" ADD COLUMN "category_group_id" integer NOT NULL;
  ALTER TABLE "wedding_categories" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "wedding_category_groups" ADD COLUMN "slug" varchar NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "wedding_users_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "wedding_users_id" integer;
  ALTER TABLE "roles_locales" ADD CONSTRAINT "roles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_users_rels" ADD CONSTRAINT "wedding_users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wedding_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_users_rels" ADD CONSTRAINT "wedding_users_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_users_rels" ADD CONSTRAINT "wedding_users_rels_wedding_categories_fk" FOREIGN KEY ("wedding_categories_id") REFERENCES "public"."wedding_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_images_rels" ADD CONSTRAINT "wedding_images_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wedding_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_images_rels" ADD CONSTRAINT "wedding_images_rels_wedding_categories_fk" FOREIGN KEY ("wedding_categories_id") REFERENCES "public"."wedding_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_images_rels" ADD CONSTRAINT "wedding_images_rels_wedding_users_fk" FOREIGN KEY ("wedding_users_id") REFERENCES "public"."wedding_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_categories_locales" ADD CONSTRAINT "wedding_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wedding_category_groups_locales" ADD CONSTRAINT "wedding_category_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wedding_category_groups"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "roles_locales_locale_parent_id_unique" ON "roles_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "wedding_users_username_idx" ON "wedding_users" USING btree ("username");
  CREATE INDEX "wedding_users_updated_at_idx" ON "wedding_users" USING btree ("updated_at");
  CREATE INDEX "wedding_users_created_at_idx" ON "wedding_users" USING btree ("created_at");
  CREATE INDEX "wedding_users_rels_order_idx" ON "wedding_users_rels" USING btree ("order");
  CREATE INDEX "wedding_users_rels_parent_idx" ON "wedding_users_rels" USING btree ("parent_id");
  CREATE INDEX "wedding_users_rels_path_idx" ON "wedding_users_rels" USING btree ("path");
  CREATE INDEX "wedding_users_rels_roles_id_idx" ON "wedding_users_rels" USING btree ("roles_id");
  CREATE INDEX "wedding_users_rels_wedding_categories_id_idx" ON "wedding_users_rels" USING btree ("wedding_categories_id");
  CREATE INDEX "wedding_images_rels_order_idx" ON "wedding_images_rels" USING btree ("order");
  CREATE INDEX "wedding_images_rels_parent_idx" ON "wedding_images_rels" USING btree ("parent_id");
  CREATE INDEX "wedding_images_rels_path_idx" ON "wedding_images_rels" USING btree ("path");
  CREATE INDEX "wedding_images_rels_wedding_categories_id_idx" ON "wedding_images_rels" USING btree ("wedding_categories_id");
  CREATE INDEX "wedding_images_rels_wedding_users_id_idx" ON "wedding_images_rels" USING btree ("wedding_users_id");
  CREATE UNIQUE INDEX "wedding_categories_locales_locale_parent_id_unique" ON "wedding_categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "wedding_category_groups_locales_locale_parent_id_unique" ON "wedding_category_groups_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "wedding_categories" ADD CONSTRAINT "wedding_categories_category_group_id_wedding_category_groups_id_fk" FOREIGN KEY ("category_group_id") REFERENCES "public"."wedding_category_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wedding_users_fk" FOREIGN KEY ("wedding_users_id") REFERENCES "public"."wedding_users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_wedding_users_fk" FOREIGN KEY ("wedding_users_id") REFERENCES "public"."wedding_users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "wedding_images_cdn_link_idx" ON "wedding_images" USING btree ("cdn_link");
  CREATE INDEX "wedding_categories_category_group_idx" ON "wedding_categories" USING btree ("category_group_id");
  CREATE INDEX "payload_locked_documents_rels_wedding_users_id_idx" ON "payload_locked_documents_rels" USING btree ("wedding_users_id");
  CREATE INDEX "payload_preferences_rels_wedding_users_id_idx" ON "payload_preferences_rels" USING btree ("wedding_users_id");
  ALTER TABLE "users" DROP COLUMN "invitation_token";
  ALTER TABLE "roles" DROP COLUMN "name";
  ALTER TABLE "roles" DROP COLUMN "description";
  ALTER TABLE "wedding_categories" DROP COLUMN "name";
  ALTER TABLE "wedding_category_groups" DROP COLUMN "name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "roles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wedding_users" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wedding_users_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wedding_images_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wedding_categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wedding_category_groups_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "roles_locales" CASCADE;
  DROP TABLE "wedding_users" CASCADE;
  DROP TABLE "wedding_users_rels" CASCADE;
  DROP TABLE "wedding_images_rels" CASCADE;
  DROP TABLE "wedding_categories_locales" CASCADE;
  DROP TABLE "wedding_category_groups_locales" CASCADE;
  ALTER TABLE "wedding_images" RENAME COLUMN "cdn_link" TO "cloudflare_link";
  ALTER TABLE "wedding_categories" DROP CONSTRAINT "wedding_categories_category_group_id_wedding_category_groups_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_wedding_users_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_wedding_users_fk";
  
  DROP INDEX "wedding_images_cdn_link_idx";
  DROP INDEX "wedding_categories_category_group_idx";
  DROP INDEX "payload_locked_documents_rels_wedding_users_id_idx";
  DROP INDEX "payload_preferences_rels_wedding_users_id_idx";
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
  ALTER TABLE "users" ADD COLUMN "invitation_token" varchar;
  ALTER TABLE "roles" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "roles" ADD COLUMN "description" jsonb;
  ALTER TABLE "wedding_categories" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "wedding_category_groups" ADD COLUMN "name" varchar NOT NULL;
  CREATE UNIQUE INDEX "wedding_images_cloudflare_link_idx" ON "wedding_images" USING btree ("cloudflare_link");
  ALTER TABLE "wedding_categories" DROP COLUMN "type";
  ALTER TABLE "wedding_categories" DROP COLUMN "category_group_id";
  ALTER TABLE "wedding_categories" DROP COLUMN "slug";
  ALTER TABLE "wedding_category_groups" DROP COLUMN "slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "wedding_users_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "wedding_users_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_wedding_users_settings_language";
  DROP TYPE "public"."enum_wedding_users_settings_gallery_grid_gap";
  DROP TYPE "public"."enum_wedding_users_settings_gallery_view";
  DROP TYPE "public"."enum_wedding_categories_type";`)
}
