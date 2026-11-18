"use client";

import { useTheme } from "next-themes";
import type { Block } from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "./doc-editor.css";

import { useI18n } from "@/i18n/client";

/** A read-only doc from saved blocks, for the public shared page. Never joins the live doc. */
export function DocViewer({ content }: { content: Block[] | null }) {
  const { locale, dict } = useI18n();
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    dictionary: locales[locale],
    initialContent: content?.length ? content : undefined,
  });

  return (
    <div className="outpost-doc h-full overflow-y-auto pt-8 pb-24">
      {content?.length ? (
        <BlockNoteView editor={editor} editable={false} theme={resolvedTheme === "light" ? "light" : "dark"} />
      ) : (
        <p className="px-12 text-sm text-muted-foreground">{dict.shared.emptyDoc}</p>
      )}
    </div>
  );
}
