-- Realtime Authorization for private channels ("doc:<workspaceId>", later "canvas:<workspaceId>").
-- Supabase checks the Clerk session token (third-party auth) against these policies whenever a
-- client joins a private channel or broadcasts on it. Mirrors canAccessWorkspace():
--   a personal workspace -> only its creator; a team workspace -> members of the active org.
-- Idempotent: safe to run again (pnpm db:realtime).

-- SECURITY DEFINER: the app tables have RLS on with no policies, so the check reads them as
-- the owner. Fixed search_path so callers can't shadow the referenced objects.
create or replace function public.can_access_workspace_channel(channel_topic text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public."Workspace" w
    join public."User" u on u.id = w."creatorId"
    where w.id = split_part(channel_topic, ':', 2)
      and (
        (w."clerkOrgId" is null and u."clerkId" = (auth.jwt() ->> 'sub'))
        -- Clerk session token v2 keeps the active org in "o", v1 in "org_id".
        or w."clerkOrgId" = coalesce(auth.jwt() -> 'o' ->> 'id', auth.jwt() ->> 'org_id')
      )
  );
$$;

revoke all on function public.can_access_workspace_channel(text) from public, anon;
grant execute on function public.can_access_workspace_channel(text) to authenticated;

drop policy if exists "workspace members receive channel messages" on realtime.messages;
create policy "workspace members receive channel messages"
  on realtime.messages for select to authenticated
  using (
    realtime.messages.extension in ('broadcast', 'presence')
    and public.can_access_workspace_channel((select realtime.topic()))
  );

drop policy if exists "workspace members send channel messages" on realtime.messages;
create policy "workspace members send channel messages"
  on realtime.messages for insert to authenticated
  with check (
    realtime.messages.extension in ('broadcast', 'presence')
    and public.can_access_workspace_channel((select realtime.topic()))
  );
