"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import * as Y from "yjs";

import { fromBase64 } from "@/lib/base64";
import { SupabaseYjsProvider } from "@/lib/realtime/yjs-provider";

/**
 * The shared Yjs document for a workspace, connected to its private Realtime channel.
 * Null until the provider is ready, so the editor mounts once it has the saved state plus
 * whatever peers send. Supabase authenticates the channel with the user's Clerk session token.
 */
export function useCollaborativeDoc(workspaceId: string, initialState: string | null) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Only the first saved state counts: later server refreshes (after a rename, say) must not
  // reconnect the editor.
  const [savedState] = useState(initialState);
  const [collab, setCollab] = useState<{ doc: Y.Doc; provider: SupabaseYjsProvider } | null>(null);

  useEffect(() => {
    // A client per connection; it asks for a fresh session token whenever Realtime needs one.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { accessToken: async () => (await getTokenRef.current()) ?? null },
    );
    const doc = new Y.Doc();
    if (savedState) Y.applyUpdate(doc, fromBase64(savedState));
    const provider = new SupabaseYjsProvider(supabase, doc, `doc:${workspaceId}`, () => setCollab({ doc, provider }));

    return () => {
      provider.destroy();
      doc.destroy();
      void supabase.realtime.disconnect();
    };
  }, [workspaceId, savedState]);

  return collab;
}
