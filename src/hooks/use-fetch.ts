"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";

export type FetchResult<T> = { ok: true; data: T } | { ok: false; error: Error };

// Runs an async call (usually a Server Action) and tracks its loading and error state.
// Failures show a toast, so callers only branch on `ok`. Production hides server error
// messages, so the toast title is a translated generic one and the message is the detail.
export function useFetch<Args extends unknown[], Result>(cb: (...args: Args) => Promise<Result>) {
  const { common } = useI18n().dict;
  const [data, setData] = useState<Result | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args): Promise<FetchResult<Result>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await cb(...args);
      setData(result);
      return { ok: true, data: result };
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      toast.add({ type: "error", title: common.somethingWentWrong, description: e.message });
      return { ok: false, error: e };
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}
