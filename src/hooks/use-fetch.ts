"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";

// Runs an async call (usually a server action) and tracks its data, loading and error state.
// Errors also show a toast, so callers only handle the happy path. Production hides server error
// messages, so the toast uses a translated generic title and keeps the message as detail.
export function useFetch<Args extends unknown[], Result>(cb: (...args: Args) => Promise<Result>) {
  const { common } = useI18n().dict;
  const [data, setData] = useState<Result | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cb(...args);
      setData(result);
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      toast.add({ type: "error", title: common.somethingWentWrong, description: e.message });
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}
