import type { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";

import type { AppliedChange } from "./changes";
import { docTools, normalizeModelText, type DocToolName } from "./tools";

const SUMMARY_BLOCK_CHARS = 400;

// A new doc is one empty paragraph; it counts as empty, so new content replaces it.
function isEmptyDoc(blocks: Block[]) {
  const [first] = blocks;
  return (
    blocks.length === 1 &&
    first.type === "paragraph" &&
    first.children.length === 0 &&
    Array.isArray(first.content) &&
    first.content.length === 0
  );
}

/** State for the model: one line per top-level block (id, type, Markdown), so it can target edits. */
export function summarizeDoc(editor: BlockNoteEditor) {
  const blocks = editor.document;
  if (isEmptyDoc(blocks)) return "(empty doc)";
  return blocks
    .map((block) => {
      const text = editor.blocksToMarkdownLossy([block]).trim().replace(/\s*\n\s*/g, " / ");
      const clipped = text.length > SUMMARY_BLOCK_CHARS ? `${text.slice(0, SUMMARY_BLOCK_CHARS)}…` : text;
      return `- id: ${block.id}, type: ${block.type}: ${clipped}`;
    })
    .join("\n");
}

function toBlocks(editor: BlockNoteEditor, markdown: string) {
  if (!markdown.trim()) throw new Error("The Markdown is empty");
  return editor.tryParseMarkdownToBlocks(normalizeModelText(markdown));
}

// The first line of a change as plain text, for its card in the chat.
function firstLine(markdown: string) {
  return normalizeModelText(markdown)
    .trim()
    .split("\n")[0]
    .replace(/^\s*(#+|>|[-*+]|\d+\.)\s+(\[[ x]\]\s+)?/i, "")
    .replace(/[*_`~]/g, "")
    .slice(0, 80);
}

// Snapshots are plain JSON, so later edits to the live blocks can't change what a revert restores.
const snapshot = (blocks: Block[]) => JSON.parse(JSON.stringify(blocks)) as PartialBlock[];

/**
 * Runs one doc tool and returns how to undo exactly that change. Every revert works on the doc as
 * it is at that moment, by block id, so other edits made since (by people or the agent) survive.
 */
export function runDocTool(editor: BlockNoteEditor, name: DocToolName, rawInput: unknown): AppliedChange {
  const existing = (ids: string[]) => ids.filter((id) => editor.getBlock(id));
  const remove = (ids: string[]) => {
    const present = existing(ids);
    if (present.length === editor.document.length) editor.replaceBlocks(present, [{ type: "paragraph" }]);
    else if (present.length) editor.removeBlocks(present);
  };
  const focusOn = (ids: string[]) => () => {
    const [id] = existing(ids);
    if (!id) return;
    editor.setTextCursorPosition(id, "start");
    editor.focus();
  };

  switch (name) {
    case "insertDocContent": {
      const input = docTools.insertDocContent.inputSchema.parse(rawInput);
      const blocks = toBlocks(editor, input.markdown);
      const doc = editor.document;

      if (!input.afterBlockId && isEmptyDoc(doc)) {
        const placeholder = doc[0].id;
        const { insertedBlocks } = editor.replaceBlocks([placeholder], blocks);
        const ids = insertedBlocks.map((b) => b.id);
        return { detail: firstLine(input.markdown), revert: () => remove(ids), focus: focusOn(ids) };
      }

      const reference = input.afterBlockId ? editor.getBlock(input.afterBlockId) : doc.at(-1);
      if (!reference) throw new Error("Unknown block id");
      const ids = editor.insertBlocks(blocks, reference, "after").map((b) => b.id);
      return { detail: firstLine(input.markdown), revert: () => remove(ids), focus: focusOn(ids) };
    }

    case "updateDocBlock": {
      const input = docTools.updateDocBlock.inputSchema.parse(rawInput);
      const block = editor.getBlock(input.blockId);
      if (!block) throw new Error("Unknown block id");
      const [before] = snapshot([block]);

      // Updated in place, so the block keeps its id for later calls; extra blocks follow it.
      const [first, ...rest] = toBlocks(editor, input.markdown);
      editor.updateBlock(block.id, first);
      const extra = rest.length ? editor.insertBlocks(rest, block.id, "after").map((b) => b.id) : [];

      return {
        detail: firstLine(input.markdown),
        revert: () => {
          remove(extra);
          if (editor.getBlock(block.id)) editor.updateBlock(block.id, before);
        },
        focus: focusOn([block.id]),
      };
    }

    case "deleteDocBlocks": {
      const input = docTools.deleteDocBlocks.inputSchema.parse(rawInput);
      const missing = input.blockIds.filter((id) => !editor.getBlock(id));
      if (missing.length) throw new Error(`Unknown block ids: ${missing.join(", ")}`);

      // Remember each deleted block with the block it came after, to put it back in place.
      const doc = editor.document;
      const deleted = doc
        .map((block, index) => ({ block, after: doc[index - 1]?.id }))
        .filter(({ block }) => input.blockIds.includes(block.id))
        .map(({ block, after }) => ({ block: snapshot([block])[0], after }));
      remove(input.blockIds);

      return {
        detail: String(input.blockIds.length),
        revert: () => {
          for (const { block, after } of deleted) {
            const anchor = after && editor.getBlock(after);
            if (anchor) editor.insertBlocks([block], anchor, "after");
            else editor.insertBlocks([block], editor.document[0], "before");
          }
        },
        focus: focusOn(deleted.map(({ after }) => after).filter((id): id is string => !!id)),
      };
    }

    case "replaceDoc": {
      const input = docTools.replaceDoc.inputSchema.parse(rawInput);
      const before = snapshot(editor.document);
      const { insertedBlocks } = editor.replaceBlocks(editor.document, toBlocks(editor, input.markdown));
      const ids = insertedBlocks.map((b) => b.id);

      return {
        detail: firstLine(input.markdown),
        // Swap the agent's blocks (whatever is left of them) back for the previous doc.
        revert: () => {
          const present = existing(ids);
          if (present.length) editor.replaceBlocks(present, before);
          else editor.insertBlocks(before, editor.document.at(-1)!, "after");
        },
        focus: focusOn(ids),
      };
    }
  }
}
