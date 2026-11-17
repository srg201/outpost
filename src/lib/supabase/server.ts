import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Sends the signed-in Clerk user's session token, so RLS policies can use
 * `auth.jwt()->>'sub'` (the Clerk user ID). Signed-out requests use the anon role.
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    },
  );
}
