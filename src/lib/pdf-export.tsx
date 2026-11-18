import { Children, type ReactElement, type ReactNode } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import type { Editor } from "tldraw";

export type PdfPart = "doc" | "canvas" | "both";

// Both libraries are large, so they load only when someone exports.
async function loadPdfLibraries() {
  const [exporter, renderer] = await Promise.all([
    import("@blocknote/xl-pdf-exporter/react-pdf"),
    import("@react-pdf/renderer"),
  ]);
  return { ...exporter, ...renderer };
}

type Pdf = Awaited<ReturnType<typeof loadPdfLibraries>>;

/** The doc as real, selectable PDF text (BlockNote's exporter, with fonts that cover Cyrillic). */
async function docPages(pdf: Pdf, editor: BlockNoteEditor) {
  const exporter = new pdf.PDFExporter(editor.schema, pdf.pdfDefaultSchemaMappings);
  const document = await exporter.toReactPDFDocument(editor.document);
  return Children.toArray((document as ReactElement<{ children: ReactNode }>).props.children);
}

/** The whole canvas as one page, sized to the drawing so nothing is shrunk onto A4. */
async function canvasPage(pdf: Pdf, editor: Editor) {
  const shapeIds = [...editor.getCurrentPageShapeIds()];
  if (shapeIds.length === 0) return null;
  const { url, width, height } = await editor.toImageDataUrl(shapeIds, {
    format: "png",
    background: true,
    padding: 32,
    pixelRatio: 2,
  });
  // width/height are in canvas units (the bitmap is pixelRatio times larger), so one unit is one
  // point and the 2x bitmap stays sharp when the PDF is zoomed in.
  const size = { width, height };
  return (
    <pdf.Page key="canvas" size={size} style={{ padding: 0 }}>
      <pdf.Image src={url} style={size} />
    </pdf.Page>
  );
}

export class EmptyCanvasError extends Error {}

/**
 * A PDF of the doc, the canvas, or both in one file (the doc's pages, then the canvas on its own
 * page). Runs in the browser, from the live editors, so it matches exactly what's on screen.
 */
export async function exportPdf({
  part,
  title,
  docEditor,
  canvasEditor,
}: {
  part: PdfPart;
  title: string;
  docEditor: BlockNoteEditor | null;
  canvasEditor: Editor | null;
}) {
  const pdf = await loadPdfLibraries();
  // Keyed: Children.toArray keys the doc pages, and the canvas page has its own key.
  const pages: ReactNode[] = [];

  if (part !== "canvas" && docEditor) pages.push(...(await docPages(pdf, docEditor)));
  if (part !== "doc" && canvasEditor) {
    const page = await canvasPage(pdf, canvasEditor);
    if (page) pages.push(page);
    else if (part === "canvas") throw new EmptyCanvasError();
  }

  const document = (
    <pdf.Document title={title} creator="Outpost" producer="Outpost">
      {pages}
    </pdf.Document>
  );
  return pdf.pdf(document).toBlob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Revoked on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
