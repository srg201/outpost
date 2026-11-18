import type { Editor } from "tldraw";
import type { BlockNoteEditor } from "@blocknote/core";

import { runCanvasTool, type ShapeIdMap } from "./canvas";
import { runDocTool } from "./doc";
import { isAgentTool, isDocTool, type AgentToolName, type ToolOutput } from "./tools";

/** A change the agent made, as the executors return it. */
export type AppliedChange = {
  /** A short human hint for the chat card: a label, table or first line of text. */
  detail?: string;
  /** Undoes exactly this change, leaving everything made since in place. */
  revert: () => void;
  /**
   * Shows the change: selects and zooms to shapes, or puts the cursor in the block. `cover` is an
   * element laid over the editors (the agent panel) that the shapes are kept clear of.
   */
  focus?: (cover?: Element | null) => void;
};

export type ChangeStatus = "pending" | "accepted" | "rejected";

/**
 * Review mode: every change the agent makes is applied right away as a preview, so you see it in
 * place, and is kept here until you accept it (keep) or reject it (undo just that change).
 */
export type AgentChange = AppliedChange & {
  toolCallId: string;
  tool: AgentToolName;
  surface: "canvas" | "doc";
  status: ChangeStatus;
  /** The editor it was made in. Switching views replaces editors, and a change can only be
   *  undone in the editor that holds it. */
  editor: Editor | BlockNoteEditor | null;
};

export type Editors = { canvasEditor: Editor | null; docEditor: BlockNoteEditor | null };

/** Runs one tool call against the live editors. Never throws: the model always gets an output. */
export function runAgentTool(
  editors: Editors,
  ids: ShapeIdMap,
  toolName: string,
  input: unknown,
): { output: ToolOutput; change?: AppliedChange } {
  if (!isAgentTool(toolName)) return { output: { success: false, error: `Unknown tool: ${toolName}` } };

  try {
    if (isDocTool(toolName)) {
      if (!editors.docEditor) {
        return { output: { success: false, error: "The doc isn't open. Ask the user to switch to the Both or Document view." } };
      }
      return { output: { success: true }, change: runDocTool(editors.docEditor, toolName, input) };
    }
    if (!editors.canvasEditor) {
      return { output: { success: false, error: "The canvas isn't open. Ask the user to switch to the Both or Canvas view." } };
    }
    return { output: { success: true }, change: runCanvasTool(editors.canvasEditor, ids, toolName, input) };
  } catch (error) {
    return { output: { success: false, error: error instanceof Error ? error.message : "The tool failed" } };
  }
}
