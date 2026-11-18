"use client";

import { useState } from "react";

import { updateWorkspace } from "@/actions/workspace";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";

// Click the name to rename in place: Enter or leaving the field saves, Escape cancels.
export function EditableWorkspaceName({ workspaceId, initialName }: { workspaceId: string; initialName: string }) {
  const t = useI18n().dict.workspacePage;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const update = useFetch(updateWorkspace);

  const cancel = () => {
    setName(saved);
    setEditing(false);
  };

  const commit = async () => {
    setEditing(false);
    const trimmed = name.trim();
    if (!trimmed || trimmed === saved) return cancel();

    setName(trimmed);
    if ((await update.fn(workspaceId, trimmed)).ok) setSaved(trimmed);
    else setName(saved);
  };

  if (editing) {
    return (
      <input
        aria-label={t.nameLabel}
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") cancel();
        }}
        autoFocus
        className="h-8 w-64 max-w-full rounded-lg border border-input bg-transparent px-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    );
  }

  return (
    <h1 className="min-w-0">
      <button
        type="button"
        onClick={() => setEditing(true)}
        title={t.rename}
        aria-label={`${name}. ${t.rename}`}
        className="h-8 max-w-full truncate rounded-lg px-2 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {name}
      </button>
    </h1>
  );
}
