"use client";

import { createShapeId, useEditor } from "tldraw";

import { useI18n } from "@/i18n/client";
import { ENTITY_TABLE, TABLE_WIDTH, getTableHeight, newRow } from "./shape";

/** Toolbar button: drops a starter table in the middle of the view and selects it. */
export function AddTableButton() {
  const editor = useEditor();
  const t = useI18n().dict.canvas;

  const addTable = () => {
    const center = editor.getViewportPageBounds().center;
    const rows = [newRow({ name: "id", dataType: "uuid", isPK: true }), newRow({ name: "created_at", dataType: "timestamptz" })];
    const id = createShapeId();
    editor.createShape({
      id,
      type: ENTITY_TABLE,
      x: center.x - TABLE_WIDTH / 2,
      y: center.y - getTableHeight(rows.length) / 2,
      props: { tableName: "new_table", rows, h: getTableHeight(rows.length) },
    });
    editor.select(id);
  };

  return (
    // tldraw's own toolbar button classes, so it matches the other tools.
    <button type="button" onClick={addTable} title={t.addTable} aria-label={t.addTable} className="tlui-button tlui-button__tool">
      <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="14" height="14" rx="1.5" />
        <line x1="2" y1="6.5" x2="16" y2="6.5" />
        <line x1="9" y1="6.5" x2="9" y2="16" />
      </svg>
    </button>
  );
}
