import {
  createShapeId,
  toRichText,
  type Editor,
  type TLRecord,
  type TLShape,
  type TLShapeId,
  type TLShapePartial,
  type VecModel,
} from "tldraw";

import {
  ENTITY_TABLE,
  TABLE_WIDTH,
  getTableHeight,
  newRow,
  rowAnchorY,
  type EntityRow,
  type EntityTableShape,
} from "@/components/canvas/entity-table/shape";
import type { AppliedChange } from "./changes";
import { canvasTools, normalizeModelText, type CanvasToolName } from "./tools";

/** The model's own ids ("rect-1") mapped to real tldraw ids, so later calls in the same chat can
 *  reference shapes it just created. Shapes that already existed are referenced by real id. */
export type ShapeIdMap = Map<string, TLShapeId>;

type RecordsDiff = ReturnType<Editor["store"]["extractingChanges"]>;

// ---------------------------------------------------------------------------------------------
// State for the model: one line per shape, so it only ever references shapes that exist.

export function summarizeCanvas(editor: Editor) {
  const shapes = editor.getCurrentPageShapes();
  if (shapes.length === 0) return "(empty canvas)";
  return shapes.map(summarizeShape).join("\n");
}

function summarizeShape(shape: TLShape) {
  const base = `- id: ${shape.id}, type: ${shape.type}, position: (${Math.round(shape.x)}, ${Math.round(shape.y)})`;
  if (shape.type === ENTITY_TABLE) {
    const { tableName, rows } = (shape as EntityTableShape).props;
    const columns = rows.map((r) => `${r.name}:${r.dataType}${r.isPK ? " PK" : ""}${r.isFK ? " FK" : ""}`);
    return `${base}, table: "${tableName}", columns: [${columns.join(", ")}]`;
  }
  const text = "richText" in shape.props ? plainText(shape.props.richText) : "";
  return text ? `${base}, label: "${text}"` : base;
}

// tldraw's richText is a small ProseMirror JSON tree; the model only needs its text.
function plainText(node: unknown): string {
  if (typeof node !== "object" || node === null) return "";
  const { text, content } = node as { text?: string; content?: unknown[] };
  return [text ?? "", ...(content ?? []).map(plainText)].filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------------------------
// Running a tool. Each call is captured as a diff of the records it touched, so review mode can
// undo exactly that change later without disturbing anything else on the canvas.

export function runCanvasTool(editor: Editor, ids: ShapeIdMap, name: CanvasToolName, input: unknown): AppliedChange {
  let detail: string | undefined;
  const diff = editor.store.extractingChanges(() => {
    editor.run(() => {
      detail = applyTool(editor, ids, name, input);
    });
  });

  const touched = [...Object.values(diff.added), ...Object.values(diff.updated).map(([, to]) => to)]
    .filter((record): record is TLShape => record.typeName === "shape")
    .map((shape) => shape.id);

  return {
    detail,
    revert: () => revertDiff(editor, diff),
    focus: (cover) => {
      const existing = touched.filter((id) => editor.getShape(id));
      if (!existing.length) return;
      editor.select(...existing);
      zoomToSelectionBeside(editor, cover);
    },
  };
}

const FOCUS_INSET = 64;
// Narrower than this, what's left beside the cover is too small to show anything, so use it all.
const MIN_VISIBLE_WIDTH = 240;

/**
 * Like editor.zoomToSelection, but fits the selection into the part of the canvas not hidden under
 * `cover` (the agent panel, laid over the right side), so "Show" doesn't zoom to behind the chat.
 */
function zoomToSelectionBeside(editor: Editor, cover?: Element | null) {
  const bounds = editor.getSelectionPageBounds();
  if (!bounds) return;

  const { width, height } = editor.getViewportScreenBounds();
  const container = editor.getContainer().getBoundingClientRect();
  const coverLeft = cover?.getBoundingClientRect().left ?? container.right;
  const hidden = Math.max(0, container.right - Math.max(coverLeft, container.left));
  const visibleWidth = width - hidden >= MIN_VISIBLE_WIDTH ? width - hidden : width;

  // Never zoom past 100%, so a single small shape isn't blown up to fill the screen.
  const zoom = Math.min(1, (visibleWidth - FOCUS_INSET) / bounds.w, (height - FOCUS_INSET) / bounds.h);
  editor.setCamera(
    {
      x: -bounds.x + (visibleWidth - bounds.w * zoom) / 2 / zoom,
      y: -bounds.y + (height - bounds.h * zoom) / 2 / zoom,
      z: zoom,
    },
    { animation: { duration: 300 } },
  );
}

// Undo one captured change against the canvas as it is now: remove what it added, restore what it
// removed, and put back the old version of what it updated, skipping records that are gone since.
function revertDiff(editor: Editor, diff: RecordsDiff) {
  const store = editor.store;
  editor.run(() => {
    const added = Object.keys(diff.added) as TLRecord["id"][];
    store.remove(added.filter((id) => store.has(id)));
    const restored = [
      ...Object.values(diff.removed),
      ...Object.values(diff.updated)
        .filter(([from]) => store.has(from.id))
        .map(([from]) => from),
    ];
    if (restored.length) store.put(restored);
  });
}

function applyTool(editor: Editor, ids: ShapeIdMap, name: CanvasToolName, rawInput: unknown): string | undefined {
  switch (name) {
    case "createRectangle":
    case "createEllipse": {
      const input = canvasTools[name].inputSchema.parse(rawInput);
      editor.createShape({
        id: assignId(ids, input.id),
        type: "geo",
        x: input.position.x,
        y: input.position.y,
        props: {
          geo: name === "createRectangle" ? "rectangle" : "ellipse",
          w: input.width,
          h: input.height,
          ...(input.label && { richText: richText(input.label) }),
        },
      });
      return input.label;
    }

    case "createText": {
      const input = canvasTools.createText.inputSchema.parse(rawInput);
      editor.createShape({
        id: assignId(ids, input.id),
        type: "text",
        x: input.position.x,
        y: input.position.y,
        props: { richText: richText(input.text), ...(input.fontSize && { size: textSize(input.fontSize) }) },
      });
      return input.text;
    }

    case "createArrow": {
      const input = canvasTools.createArrow.inputSchema.parse(rawInput);
      const from = findShape(editor, ids, input.fromShapeId);
      const to = findShape(editor, ids, input.toShapeId);
      if (!from || !to) throw new Error("fromShapeId or toShapeId isn't a shape on the canvas");
      connect(editor, assignId(ids, input.id), { id: from.id }, { id: to.id }, input.label);
      return input.label;
    }

    case "updateShape": {
      const input = canvasTools.updateShape.inputSchema.parse(rawInput);
      const shape = findShape(editor, ids, input.id);
      if (!shape) throw new Error("Unknown shape id");
      // The shape's type is only known at runtime, so the patch uses tldraw's loose partial.
      editor.updateShape({
        id: shape.id,
        type: shape.type,
        ...(input.position && { x: input.position.x, y: input.position.y }),
        props: {
          ...(input.width && { w: input.width }),
          ...(input.height && { h: input.height }),
          ...(input.label && "richText" in shape.props && { richText: richText(input.label) }),
        },
      } as TLShapePartial<TLShape>);
      return input.label;
    }

    case "deleteShape": {
      const input = canvasTools.deleteShape.inputSchema.parse(rawInput);
      const shape = findShape(editor, ids, input.id);
      if (!shape) throw new Error("Unknown shape id");
      editor.deleteShape(shape.id);
      return undefined;
    }

    case "createEntityTable": {
      const input = canvasTools.createEntityTable.inputSchema.parse(rawInput);
      const rows = input.columns.map(newRow);
      editor.createShape<EntityTableShape>({
        id: assignId(ids, input.id),
        type: ENTITY_TABLE,
        x: input.position.x,
        y: input.position.y,
        props: { w: TABLE_WIDTH, h: getTableHeight(rows.length), tableName: input.tableName, rows },
      });
      return input.tableName;
    }

    case "addColumn": {
      const { tableId, ...column } = canvasTools.addColumn.inputSchema.parse(rawInput);
      const table = findTable(editor, ids, tableId);
      setRows(editor, table, [...table.props.rows, newRow(column)]);
      return `${table.props.tableName}.${column.name}`;
    }

    case "updateColumn": {
      const { tableId, columnName, ...changes } = canvasTools.updateColumn.inputSchema.parse(rawInput);
      const table = findTable(editor, ids, tableId);
      const defined = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
      setRows(editor, table, mapColumn(table, columnName, (row) => ({ ...row, ...defined })));
      return `${table.props.tableName}.${columnName}`;
    }

    case "removeColumn": {
      const { tableId, columnName } = canvasTools.removeColumn.inputSchema.parse(rawInput);
      const table = findTable(editor, ids, tableId);
      setRows(editor, table, mapColumn(table, columnName, () => null));
      return `${table.props.tableName}.${columnName}`;
    }

    case "connectRelationship": {
      const input = canvasTools.connectRelationship.inputSchema.parse(rawInput);
      const fromTable = findTable(editor, ids, input.fromTableId);
      const toTable = findTable(editor, ids, input.toTableId);
      connect(
        editor,
        assignId(ids, input.id),
        { id: fromTable.id, anchor: rowAnchor(fromTable, input.fromColumnName) },
        { id: toTable.id, anchor: rowAnchor(toTable, input.toColumnName) },
      );
      return `${fromTable.props.tableName}.${input.fromColumnName} → ${toTable.props.tableName}.${input.toColumnName}`;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Helpers

const richText = (text: string) => toRichText(normalizeModelText(text));

function assignId(ids: ShapeIdMap, callerId: string) {
  const id = ids.get(callerId) ?? createShapeId();
  ids.set(callerId, id);
  return id;
}

function findShape(editor: Editor, ids: ShapeIdMap, id: string) {
  return editor.getShape(ids.get(id) ?? (id as TLShapeId));
}

function findTable(editor: Editor, ids: ShapeIdMap, id: string) {
  const shape = findShape(editor, ids, id);
  if (!shape || !editor.isShapeOfType(shape, ENTITY_TABLE)) throw new Error(`"${id}" isn't an ERD table on the canvas`);
  return shape;
}

function setRows(editor: Editor, table: EntityTableShape, rows: EntityRow[]) {
  editor.updateShape<EntityTableShape>({ id: table.id, type: ENTITY_TABLE, props: { rows, h: getTableHeight(rows.length) } });
}

// Replaces (or with null, removes) the named column; throws if the table has no such column.
function mapColumn(table: EntityTableShape, columnName: string, change: (row: EntityRow) => EntityRow | null) {
  if (!table.props.rows.some((row) => row.name === columnName)) {
    throw new Error(`Table "${table.props.tableName}" has no column "${columnName}"`);
  }
  return table.props.rows.flatMap((row) => (row.name === columnName ? (change(row) ?? []) : row));
}

// Where an arrow attaches on a table: the middle of the named column's row.
function rowAnchor(table: EntityTableShape, columnName: string): VecModel {
  const index = table.props.rows.findIndex((row) => row.name === columnName);
  return { x: 0.5, y: index === -1 ? 0.5 : rowAnchorY(index, table.props.rows.length) };
}

function connect(
  editor: Editor,
  arrowId: TLShapeId,
  from: { id: TLShapeId; anchor?: VecModel },
  to: { id: TLShapeId; anchor?: VecModel },
  label?: string,
) {
  const fromBounds = editor.getShapePageBounds(from.id);
  const toBounds = editor.getShapePageBounds(to.id);
  if (!fromBounds || !toBounds) throw new Error("Couldn't find where the shapes are");

  editor.createShape({
    id: arrowId,
    type: "arrow",
    props: {
      // Plain {x, y}: records can't hold class instances like the Vec that .center returns.
      start: { x: fromBounds.center.x, y: fromBounds.center.y },
      end: { x: toBounds.center.x, y: toBounds.center.y },
      ...(label && { richText: richText(label) }),
    },
  });
  for (const [terminal, end] of [
    ["start", from],
    ["end", to],
  ] as const) {
    editor.createBinding({
      type: "arrow",
      fromId: arrowId,
      toId: end.id,
      props: { terminal, normalizedAnchor: end.anchor ?? { x: 0.5, y: 0.5 }, isPrecise: !!end.anchor, isExact: false },
    });
  }
}

function textSize(px: number) {
  if (px <= 18) return "s";
  if (px <= 24) return "m";
  if (px <= 36) return "l";
  return "xl";
}
