CREATE TABLE "notifications" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "project_id" text REFERENCES "projects"("id") ON DELETE CASCADE,
  "message" text NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "created_at" text NOT NULL
);
