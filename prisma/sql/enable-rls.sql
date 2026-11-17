-- Lock the Supabase Data API out of Prisma-managed tables.
-- Prisma connects as `postgres` and bypasses RLS, so app queries keep working.
-- Add policies later for any table the browser should reach via supabase-js.
alter table "User"        enable row level security;
alter table "Workspace"   enable row level security;
alter table "Doc"         enable row level security;
alter table "Canvas"      enable row level security;
alter table "AgentPrompt" enable row level security;
