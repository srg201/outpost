import type { Editor, TLArrowBinding } from "tldraw";

import { ENTITY_TABLE, HEADER_HEIGHT, ROW_HEIGHT, getTableHeight, rowAnchorY } from "./shape";

/**
 * Moves a new arrow binding's anchor to the middle of the nearest table row. The anchor is stored
 * as a fraction of the shape, so the arrow stays on that row as the table grows or resizes.
 */
export function snapArrowToRow(editor: Editor, binding: TLArrowBinding) {
  const table = editor.getShape(binding.toId);
  if (!table || !editor.isShapeOfType(table, ENTITY_TABLE)) return;

  const rowCount = table.props.rows.length;
  if (rowCount === 0) return;

  const y = binding.props.normalizedAnchor.y * getTableHeight(rowCount) - HEADER_HEIGHT;
  const rowIndex = Math.min(rowCount - 1, Math.max(0, Math.floor(y / ROW_HEIGHT)));

  editor.updateBinding({
    id: binding.id,
    type: "arrow",
    props: {
      ...binding.props,
      normalizedAnchor: { x: binding.props.normalizedAnchor.x, y: rowAnchorY(rowIndex, rowCount) },
      isPrecise: true,
    },
  });
}
