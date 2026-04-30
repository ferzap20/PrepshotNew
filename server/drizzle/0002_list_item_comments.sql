CREATE TABLE IF NOT EXISTS "list_item_comments" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "list_item_id" text NOT NULL REFERENCES "project_general_lists"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "text" text NOT NULL,
  "created_at" text NOT NULL
);
