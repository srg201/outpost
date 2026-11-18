import { T, type RecordProps, type TLShape } from "tldraw";

export type EntityRow = { id: string; name: string; dataType: string; isPK: boolean; isFK: boolean };

export type EntityTableProps = {
  w: number;
  /** Never edited directly: always derived from the row count (see getTableHeight). */
  h: number;
  tableName: string;
  rows: EntityRow[];
};

export const ENTITY_TABLE = "entity-table";

// Adds the shape to tldraw's shape union, which every custom shape needs.
declare module "tldraw" {
  interface TLGlobalShapePropsMap {
    [ENTITY_TABLE]: EntityTableProps;
  }
}

export type EntityTableShape = TLShape<typeof ENTITY_TABLE>;

// The sync Worker validates every change against the same props
// (tldraw-sync/src/TldrawRoom.ts, keep the two in sync).
export const entityTableProps: RecordProps<EntityTableShape> = {
  w: T.number,
  h: T.number,
  tableName: T.string,
  rows: T.arrayOf(T.object({ id: T.string, name: T.string, dataType: T.string, isPK: T.boolean, isFK: T.boolean })),
};

export const HEADER_HEIGHT = 36;
export const ROW_HEIGHT = 28;
export const TABLE_WIDTH = 260;

export function getTableHeight(rowCount: number) {
  return HEADER_HEIGHT + Math.max(rowCount, 1) * ROW_HEIGHT;
}

// Random ids, so rows added in quick succession (or by two people at once) never collide.
export function newRow(row: Partial<EntityRow> = {}): EntityRow {
  return { id: crypto.randomUUID(), name: "", dataType: "text", isPK: false, isFK: false, ...row };
}

/** The vertical center of a row as a 0–1 fraction of the table's height, used as an arrow anchor. */
export function rowAnchorY(rowIndex: number, rowCount: number) {
  return (HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2) / getTableHeight(rowCount);
}
