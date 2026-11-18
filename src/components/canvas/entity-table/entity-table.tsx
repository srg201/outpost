"use client";

import { useState, type KeyboardEvent } from "react";
import { useEditor, useIsEditing } from "tldraw";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { ENTITY_TABLE, HEADER_HEIGHT, ROW_HEIGHT, getTableHeight, newRow, type EntityRow, type EntityTableShape } from "./shape";

export function EntityTable({ shape }: { shape: EntityTableShape }) {
  const editor = useEditor();
  const t = useI18n().dict.canvas;
  // Editing state lives in a tldraw signal; this hook subscribes to it.
  const isEditing = useIsEditing(shape.id);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const { rows, tableName, w } = shape.props;
  // From the rows, not props.h, which only catches up on resize.
  const height = getTableHeight(rows.length);

  const update = (props: Partial<EntityTableShape["props"]>) =>
    editor.updateShape({ id: shape.id, type: ENTITY_TABLE, props });
  const setRows = (next: EntityRow[]) => update({ rows: next, h: getTableHeight(next.length) });
  const updateRow = (rowId: string, patch: Partial<EntityRow>) =>
    setRows(rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));

  const addRow = () => {
    const row = newRow();
    setRows([...rows, row]);
    setEditingRowId(row.id);
  };

  const finishOnEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") setEditingRowId(null);
  };

  return (
    // Not clipped, so "Add row" can sit below the table. Pointer events stay on so the arrow tool
    // can bind to the table; they're only swallowed while editing, so the shape still drags.
    <div
      style={{ width: w, height, pointerEvents: "auto" }}
      className="relative text-left font-sans text-foreground"
      onPointerDown={(event) => isEditing && event.stopPropagation()}
    >
      <div className="h-full overflow-hidden rounded-md border bg-card shadow-lg">
        <div style={{ height: HEADER_HEIGHT }} className="flex items-center bg-primary/15 px-2.5 text-sm font-semibold">
          {isEditing ? (
            <input
              value={tableName}
              onChange={(event) => update({ tableName: event.target.value })}
              aria-label={t.tableName}
              className="w-full bg-transparent outline-none"
              autoFocus
            />
          ) : (
            <span className="truncate">{tableName}</span>
          )}
        </div>

        {rows.map((row) => {
          const isEditingRow = isEditing && editingRowId === row.id;
          return (
            <div
              key={row.id}
              style={{ height: ROW_HEIGHT }}
              className="flex items-center gap-1.5 border-t px-2.5 text-xs"
              onDoubleClick={() => isEditing && setEditingRowId(row.id)}
            >
              <KeyBadge
                label="PK"
                title={t.togglePrimaryKey}
                on={row.isPK}
                editing={isEditingRow}
                onToggle={() => updateRow(row.id, { isPK: !row.isPK })}
              />
              <KeyBadge
                label="FK"
                title={t.toggleForeignKey}
                on={row.isFK}
                editing={isEditingRow}
                onToggle={() => updateRow(row.id, { isFK: !row.isFK })}
              />

              {isEditingRow ? (
                <>
                  <input
                    value={row.name}
                    onChange={(event) => updateRow(row.id, { name: event.target.value })}
                    onKeyDown={finishOnEnter}
                    placeholder={t.columnName}
                    aria-label={t.columnName}
                    className="min-w-0 flex-1 bg-transparent outline-none"
                    autoFocus
                  />
                  <input
                    value={row.dataType}
                    onChange={(event) => updateRow(row.id, { dataType: event.target.value })}
                    onKeyDown={finishOnEnter}
                    placeholder={t.columnType}
                    aria-label={t.columnType}
                    className="w-24 shrink-0 bg-transparent text-right text-muted-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingRowId(null)}
                    title={t.doneRow}
                    aria-label={t.doneRow}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
                    title={t.removeRow}
                    aria-label={t.removeRow}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <span className={cn("flex-1 truncate", !row.name && "text-muted-foreground/60 italic")}>
                    {row.name || t.unnamedColumn}
                  </span>
                  <span className="text-muted-foreground">{row.dataType}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {isEditing && (
        <button
          type="button"
          onClick={addRow}
          className="absolute inset-x-0 top-full mt-1 rounded-md border bg-card py-1 text-xs text-muted-foreground shadow-lg hover:bg-muted hover:text-foreground"
        >
          + {t.addRow}
        </button>
      )}
    </div>
  );
}

// PK/FK tag: shown only when set, and a toggle while its row is being edited.
function KeyBadge({
  label,
  title,
  on,
  editing,
  onToggle,
}: {
  label: "PK" | "FK";
  title: string;
  on: boolean;
  editing: boolean;
  onToggle: () => void;
}) {
  const color = label === "PK" ? "bg-primary/20 text-primary" : "bg-accent text-accent-foreground";
  const base = "rounded px-1 font-mono text-[10px] font-medium";

  if (!editing) return on ? <span className={cn(base, color)}>{label}</span> : null;
  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      aria-pressed={on}
      className={cn(base, on ? color : "text-muted-foreground/40 hover:text-muted-foreground")}
    >
      {label}
    </button>
  );
}
