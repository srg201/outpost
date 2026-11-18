import { z } from "zod";

// The single source for every agent tool. The API route hands these to the model with no
// `execute`, so each call comes back to the browser, which runs it against the live editors
// (that's where the real, collaboratively edited state lives) and parses the input with the
// same schema. Canvas tools are one call per shape and take a caller-assigned `id`, so the model
// can reference a shape it created earlier in the same turn.

/** What the model gets back for every call. Every call needs one, or the chat waits forever. */
const toolOutput = z.union([
  z.object({ success: z.literal(true) }),
  z.object({ success: z.literal(false), error: z.string() }),
]);
export type ToolOutput = z.infer<typeof toolOutput>;

type ToolDefs = Record<string, { description: string; inputSchema: z.ZodType }>;

// Every tool shares the same output shape, so the chat can type the results it sends back.
function withOutput<T extends ToolDefs>(tools: T) {
  return Object.fromEntries(Object.entries(tools).map(([name, def]) => [name, { ...def, outputSchema: toolOutput }])) as {
    [K in keyof T]: T[K] & { outputSchema: typeof toolOutput };
  };
}

const point = z.object({ x: z.number(), y: z.number() });
const newId = (example: string) => z.string().describe(`Unique id you assign, e.g. "${example}"`);
const box = (example: string) =>
  z.object({ id: newId(example), position: point, width: z.number(), height: z.number(), label: z.string().optional() });
const column = z.object({
  name: z.string(),
  dataType: z.string().describe('e.g. "uuid", "text", "int", "timestamptz"'),
  isPK: z.boolean().default(false),
  isFK: z.boolean().default(false),
});

export const canvasTools = withOutput({
  createRectangle: { description: "Create a rectangle on the canvas.", inputSchema: box("rect-1") },
  createEllipse: { description: "Create an ellipse on the canvas.", inputSchema: box("ellipse-1") },
  createText: {
    description: "Create a text label on the canvas.",
    inputSchema: z.object({ id: newId("text-1"), position: point, text: z.string(), fontSize: z.number().optional() }),
  },
  createArrow: {
    description: "Create an arrow between two existing shapes.",
    inputSchema: z.object({
      id: newId("arrow-1"),
      fromShapeId: z.string().describe("id of the shape the arrow starts at"),
      toShapeId: z.string().describe("id of the shape the arrow points to"),
      label: z.string().optional(),
    }),
  },
  updateShape: {
    description: "Move, resize or relabel an existing shape.",
    inputSchema: z.object({
      id: z.string().describe("id of the shape to update"),
      position: point.optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      label: z.string().optional(),
    }),
  },
  deleteShape: {
    description: "Delete a shape from the canvas.",
    inputSchema: z.object({ id: z.string().describe("id of the shape to delete") }),
  },
  createEntityTable: {
    description: "Create an ERD table (a database table with a name and typed columns).",
    inputSchema: z.object({
      id: newId("table-users"),
      position: point,
      tableName: z.string(),
      columns: z.array(column).describe("Columns, in order"),
    }),
  },
  addColumn: {
    description: "Add a column to an ERD table.",
    inputSchema: column.extend({ tableId: z.string().describe("id of the ERD table") }),
  },
  updateColumn: {
    description: "Rename, retype or toggle PK/FK on a column of an ERD table.",
    inputSchema: z.object({
      tableId: z.string(),
      columnName: z.string().describe("current name of the column"),
      name: z.string().optional(),
      dataType: z.string().optional(),
      isPK: z.boolean().optional(),
      isFK: z.boolean().optional(),
    }),
  },
  removeColumn: {
    description: "Remove a column from an ERD table.",
    inputSchema: z.object({ tableId: z.string(), columnName: z.string() }),
  },
  connectRelationship: {
    description: "Draw a foreign-key arrow from a primary-key column on one ERD table to the foreign-key column on another.",
    inputSchema: z.object({
      id: newId("rel-1"),
      fromTableId: z.string().describe("id of the table on the primary-key side"),
      fromColumnName: z.string().describe("the primary-key column"),
      toTableId: z.string().describe("id of the table on the foreign-key side"),
      toColumnName: z.string().describe("the foreign-key column"),
    }),
  },
});

const markdown = z.string().describe("Markdown: headings, lists, checklists, tables, code blocks, bold, links");

export const docTools = withOutput({
  insertDocContent: {
    description: "Add content to the doc, at the end or after a given block.",
    inputSchema: z.object({
      markdown,
      afterBlockId: z.string().optional().describe("Insert after this block; omit to append at the end"),
    }),
  },
  updateDocBlock: {
    description: "Rewrite one block of the doc (it may become several blocks).",
    inputSchema: z.object({ blockId: z.string(), markdown }),
  },
  deleteDocBlocks: {
    description: "Delete blocks from the doc.",
    inputSchema: z.object({ blockIds: z.array(z.string()).min(1) }),
  },
  replaceDoc: {
    description: "Replace the whole doc. Only for a full rewrite or an empty doc.",
    inputSchema: z.object({ markdown }),
  },
});

export const agentTools = { ...canvasTools, ...docTools };

export type CanvasToolName = keyof typeof canvasTools;
export type DocToolName = keyof typeof docTools;
export type AgentToolName = keyof typeof agentTools;

export function isDocTool(name: string): name is DocToolName {
  return name in docTools;
}

export function isAgentTool(name: string): name is AgentToolName {
  return name in agentTools;
}

/** Gemini sometimes sends newlines as a literal "\n". Unescape only text with no real line
 *  breaks, so code that genuinely contains "\n" stays intact. */
export function normalizeModelText(text: string) {
  return text.includes("\n") ? text : text.replace(/\\n/g, "\n");
}
