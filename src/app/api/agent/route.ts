import { createGoogle } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage } from "ai";
import { z } from "zod";

import { LOCALE_NAMES, hasLocale } from "@/i18n/config";
import { agentTools } from "@/lib/agent/tools";
import { getPromptUsage, getWorkspaceOwnerId, recordPrompt } from "@/lib/billing";
import { getCurrentUser } from "@/lib/current-user";
import { PROMPT_LIMIT_ERROR } from "@/lib/plan-limits";
import { canAccessWorkspace } from "@/lib/workspace-access";

// A turn that draws a whole diagram is a few dozen short tool calls.
export const maxDuration = 60;

const MODEL = "gemini-3.5-flash-lite";
const google = createGoogle({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are the Outpost workspace agent. A workspace has two surfaces: a canvas (an infinite whiteboard for diagrams) and a doc (a rich-text document). You change them only by calling tools, never by describing changes in text. Never use em dashes.

Existing content belongs to the user:
- Never delete, replace or rewrite shapes, blocks or text the user didn't ask you to change. Add new content next to what is there.
- deleteShape, deleteDocBlocks and replaceDoc are only for when the user explicitly asks to remove, clear or rewrite something.
- Place new canvas shapes in empty space, away from the shapes listed in the current canvas state.

Where to work:
- If the user names a surface ("in the doc", "only the diagram"), change only that one.
- Otherwise decide from the request: flows, architectures, ERDs and anything visual go on the canvas; specs, notes, explanations and plans go in the doc. Use both when the request needs both, and keep them consistent.
- To turn one surface into the other ("write up this diagram", "draw what the doc says"), read its current state below.
- If a surface you need is marked as not open, tell the user to switch to the Both view instead of calling its tools.
- When you're done, reply with one short sentence about what you did.

Doc:
- Write Markdown: headings, lists, checklists, tables, code blocks, bold, links.
- Prefer targeted edits: insertDocContent to add, updateDocBlock to rewrite a block the user asked about. Use replaceDoc only when the doc is empty or the user asks for a full rewrite.
- Reference only block ids listed in the current doc state.

Canvas:
- One tool call per shape. Give every new shape a unique id (e.g. "rect-1") so later calls in the same turn can reference it, such as an arrow's fromShapeId and toShapeId.
- For entity-relationship diagrams use the ERD tools (createEntityTable, addColumn, updateColumn, removeColumn, connectRelationship), not rectangles.
- Reference only shape ids listed in the current canvas state or created earlier in this turn. Never invent one.

Canvas layout: diagrams must never look cluttered or overlap. The canvas is infinite, so spread out instead of packing shapes near (0, 0).
- Size each box to its label (a short label about 140x80, two or three lines about 260x140) and compute spacing from real sizes.
- Stacked boxes: at least 100px of empty space between them (next y >= previous y + previous height + 100).
- Side-by-side boxes: at least 120px of empty space between them (next x >= previous x + previous width + 120).
- Plan every position before creating shapes.
- A title (createText) goes centered at least 100px above the topmost box.
- Give each ERD table its own column with at least 150px of horizontal clearance, since tables grow as columns are added.`;

const NOT_OPEN = "(not open in this view, so its tools will fail)";

const requestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  workspaceId: z.string().min(1),
  locale: z.string(),
  reviewMode: z.boolean(),
  canvasContext: z.string().nullable(),
  docContext: z.string().nullable(),
  /** Changes the user rejected in review since the last request, so the agent doesn't redo them. */
  rejected: z.array(z.string()).max(100),
});

function contextFor({ locale, reviewMode, canvasContext, docContext, rejected }: z.infer<typeof requestSchema>) {
  const language = hasLocale(locale) ? LOCALE_NAMES[locale] : "the user's language";
  return [
    SYSTEM_PROMPT,
    `Reply in ${language}, whatever language the workspace content is in.`,
    reviewMode &&
      "Review mode is on: each change you make is shown to the user as a proposal they accept or reject one by one. Keep changes focused so each one is easy to judge.",
    rejected.length > 0 &&
      `The user rejected these proposed changes, so don't make them again unless asked:\n${rejected.map((r) => `- ${r}`).join("\n")}`,
    `Current canvas state:\n${canvasContext ?? NOT_OPEN}`,
    `Current doc state:\n${docContext ?? NOT_OPEN}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  const body = parsed.data;
  if (!(await canAccessWorkspace(body.workspaceId))) return new Response("Workspace not found", { status: 404 });

  // Only a message the user typed counts as a prompt. The automatic follow-ups after tool calls
  // end with the agent's own message, so a prompt that draws twenty shapes still counts once.
  let ownerId: string | null = null;
  if (body.messages.at(-1)?.role === "user") {
    ownerId = await getWorkspaceOwnerId(body.workspaceId);
    const { used, limit } = await getPromptUsage(ownerId);
    // Checked before calling Gemini, so a used-up allowance costs nothing.
    if (used >= limit) return Response.json({ error: PROMPT_LIMIT_ERROR, used, limit }, { status: 402 });
  }

  const result = streamText({
    model: google(MODEL),
    system: contextFor(body),
    // No `execute`: tool calls go back to the browser, which runs them on the live editors.
    tools: agentTools,
    messages: await convertToModelMessages(body.messages),
    providerOptions: { google: { thinkingConfig: { includeThoughts: true } } },
    // Counted once Gemini has answered, so a failed request (e.g. overloaded) costs nothing.
    onEnd: async () => {
      if (ownerId) await recordPrompt(ownerId, user.id, body.workspaceId);
    },
  });

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
}
