import { HTMLContainer, Rectangle2d, ShapeUtil, resizeBox, type TLResizeInfo } from "tldraw";

import { ENTITY_TABLE, TABLE_WIDTH, entityTableProps, getTableHeight, type EntityTableShape } from "./shape";
import { EntityTable } from "./entity-table";

/** A database table on the canvas: a name, typed columns with PK/FK flags, and row-level arrows. */
export class EntityTableShapeUtil extends ShapeUtil<EntityTableShape> {
  static override type = ENTITY_TABLE;
  static override props = entityTableProps;

  getDefaultProps(): EntityTableShape["props"] {
    return { w: TABLE_WIDTH, h: getTableHeight(0), tableName: "new_table", rows: [] };
  }

  getGeometry(shape: EntityTableShape) {
    return new Rectangle2d({ width: shape.props.w, height: getTableHeight(shape.props.rows.length), isFilled: true });
  }

  override canEdit() {
    return true;
  }

  // Arrows can bind to a table; snapArrowToRow then moves the anchor onto the nearest row.
  override canBind() {
    return true;
  }

  // Only the width really resizes: the height is put back to fit the rows.
  override onResize(shape: EntityTableShape, info: TLResizeInfo<EntityTableShape>) {
    const resized = resizeBox(shape, info, { minWidth: TABLE_WIDTH });
    return { ...resized, props: { ...resized.props, h: getTableHeight(shape.props.rows.length) } };
  }

  component(shape: EntityTableShape) {
    return (
      <HTMLContainer>
        <EntityTable shape={shape} />
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: EntityTableShape) {
    const path = new Path2D();
    path.roundRect(0, 0, shape.props.w, getTableHeight(shape.props.rows.length), 6);
    return path;
  }
}
