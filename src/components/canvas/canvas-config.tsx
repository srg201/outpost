"use client";

import { DefaultToolbar, DefaultToolbarContent, defaultShapeUtils, type TLComponents } from "tldraw";

import { AddTableButton } from "./entity-table/add-table-button";
import { EntityTableShapeUtil } from "./entity-table/shape-util";

// Shared by every canvas (the live editor, and later the read-only shared view). Module-level so
// they keep their identity: new arrays on every render make useSync rebuild the store in a loop.

/** Our custom shapes, for <Tldraw shapeUtils>, which adds them to the built-in ones. */
export const customShapeUtils = [EntityTableShapeUtil];

/** Built-in plus custom shapes, for useSync, which (unlike <Tldraw>) doesn't add the defaults. */
export const allShapeUtils = [...defaultShapeUtils, ...customShapeUtils];

/** A focused single-page canvas: no page, main or style menus; a vertical toolbar with Add table first. */
export const canvasComponents: TLComponents = {
  PageMenu: null,
  MainMenu: null,
  StylePanel: null,
  Toolbar: () => (
    <DefaultToolbar orientation="vertical">
      <AddTableButton />
      <DefaultToolbarContent />
    </DefaultToolbar>
  ),
};

/** `isolate` keeps tldraw's high z-indexes inside the canvas, so app dialogs stay on top. The
 * toolbar moves up into the space the hidden page menu leaves (`!` beats tldraw.css). */
export const canvasFrameClass = "isolate h-full [&_.tlui-main-toolbar--vertical]:top-4!";
