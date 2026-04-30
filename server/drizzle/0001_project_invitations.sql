CREATE TABLE "project_invitations" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "invited_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" text NOT NULL
);
