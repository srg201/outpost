"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type InferUITools, type UIDataTypes, type UIMessage } from "ai";

import { useUpgradeDialog } from "@/components/workspace/upgrade-dialog";
import { useWorkspaceEditors } from "@/components/workspace/editors-context";
import { getAgentUsage } from "@/actions/agent";
import { useI18n } from "@/i18n/client";
import { summarizeCanvas, type ShapeIdMap } from "@/lib/agent/canvas";
import { runAgentTool, type AgentChange, type Editors } from "@/lib/agent/changes";
import { summarizeDoc } from "@/lib/agent/doc";
import { isDocTool, type agentTools } from "@/lib/agent/tools";
import { PROMPT_LIMIT_ERROR } from "@/lib/plan-limits";

export type AgentMessage = UIMessage<never, UIDataTypes, InferUITools<typeof agentTools>>;

// Review mode is a personal preference, kept in this browser.
const REVIEW_MODE_KEY = "outpost:agent-review-mode";
const reviewModeListeners = new Set<() => void>();
const reviewModeStore = {
  subscribe(listener: () => void) {
    reviewModeListeners.add(listener);
    return () => reviewModeListeners.delete(listener);
  },
  get: () => localStorage.getItem(REVIEW_MODE_KEY) !== "off",
  getServer: () => true,
  set(on: boolean) {
    localStorage.setItem(REVIEW_MODE_KEY, on ? "on" : "off");
    reviewModeListeners.forEach((listener) => listener());
  },
};

type Usage = { used: number; limit: number };

function useAgentState({
  workspaceId,
  initialPrompt,
  needs,
  cleanUrl,
}: {
  workspaceId: string;
  initialPrompt?: string;
  needs: { canvas: boolean; doc: boolean };
  cleanUrl: string;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const openUpgrade = useUpgradeDialog();
  const { canvasEditor, docEditor } = useWorkspaceEditors();

  const [open, setOpen] = useState(!!initialPrompt);
  const [changes, setChanges] = useState<AgentChange[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const reviewMode = useSyncExternalStore(reviewModeStore.subscribe, reviewModeStore.get, reviewModeStore.getServer);

  // Read when a request is sent or a tool runs, never during render.
  const live = useRef({ editors: { canvasEditor, docEditor } as Editors, reviewMode, locale });
  useEffect(() => {
    live.current = { editors: { canvasEditor, docEditor }, reviewMode, locale };
  });
  const shapeIds = useRef<ShapeIdMap>(new Map());
  // What the user rejected since the last request, so the agent hears about it once.
  const rejectedSinceLastRequest = useRef<string[]>([]);

  const refreshUsage = useCallback(() => {
    getAgentUsage(workspaceId).then(setUsage, () => setUsage(null));
  }, [workspaceId]);

  // Built once. Every request, including the automatic follow-ups after tool calls, carries the
  // current state of both surfaces.
  const [transport] = useState(
    // The refs are read only when a request is sent, never during render.
    // eslint-disable-next-line react-hooks/refs
    () =>
      new DefaultChatTransport<AgentMessage>({
        api: "/api/agent",
        body: () => {
          const { editors, reviewMode, locale } = live.current;
          const rejected = rejectedSinceLastRequest.current;
          rejectedSinceLastRequest.current = [];
          return {
            workspaceId,
            locale,
            reviewMode,
            rejected,
            canvasContext: editors.canvasEditor ? summarizeCanvas(editors.canvasEditor) : null,
            docContext: editors.docEditor ? summarizeDoc(editors.docEditor) : null,
          };
        },
      }),
  );

  const chat = useChat<AgentMessage>({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onFinish: refreshUsage,
    onError: (error) => {
      if (!error.message.includes(PROMPT_LIMIT_ERROR)) return;
      refreshUsage();
      openUpgrade("prompts");
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.dynamic) return;
      const { editors, reviewMode } = live.current;
      const { output, change } = runAgentTool(editors, shapeIds.current, toolCall.toolName, toolCall.input);

      if (change) {
        setChanges((current) => [
          ...current,
          {
            ...change,
            toolCallId: toolCall.toolCallId,
            tool: toolCall.toolName,
            surface: isDocTool(toolCall.toolName) ? "doc" : "canvas",
            status: reviewMode ? "pending" : "accepted",
            editor: isDocTool(toolCall.toolName) ? editors.docEditor : editors.canvasEditor,
          },
        ]);
      }
      // Not awaited: the SDK checks for the automatic follow-up right after this returns.
      void chat.addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output });
    },
  });

  // ---------------------------------------------------------------------------------------
  // Review

  // A change can be undone only while the editor it was made in is still open.
  const canRevert = (change: AgentChange) =>
    change.editor === (change.surface === "doc" ? docEditor : canvasEditor) && change.editor !== null;

  // Accepting applies to pending changes. Rejecting also works on accepted ones (an undo), as
  // long as the editor that holds them is still open.
  const resolve = (ids: string[], decision: "accepted" | "rejected") => {
    const targets = changes.filter(
      (c) => ids.includes(c.toolCallId) && (decision === "accepted" ? c.status === "pending" : c.status !== "rejected"),
    );
    if (decision === "rejected") {
      // Newest first, so a later change built on an earlier one is undone before it.
      for (const change of [...targets].reverse()) {
        if (!canRevert(change)) continue;
        change.revert();
        rejectedSinceLastRequest.current.push(change.detail ? `${change.tool}: ${change.detail}` : change.tool);
      }
    }
    const resolved = new Set(
      targets.filter((c) => decision === "accepted" || canRevert(c)).map((c) => c.toolCallId),
    );
    setChanges((current) => current.map((c) => (resolved.has(c.toolCallId) ? { ...c, status: decision } : c)));
  };

  const pending = changes.filter((c) => c.status === "pending");

  // ---------------------------------------------------------------------------------------
  // A prompt from the dashboard goes out once the editors this view shows are ready, so the
  // agent sees them. It then leaves the URL, so a refresh doesn't send it again.
  const sentInitialPrompt = useRef(false);
  const ready = (!needs.canvas || !!canvasEditor) && (!needs.doc || !!docEditor);
  useEffect(() => {
    if (!initialPrompt || sentInitialPrompt.current || !ready) return;
    sentInitialPrompt.current = true;
    void chat.sendMessage({ text: initialPrompt });
    router.replace(cleanUrl, { scroll: false });
  }, [initialPrompt, ready, chat, router, cleanUrl]);

  useEffect(() => {
    if (open) refreshUsage();
  }, [open, refreshUsage]);

  return {
    open,
    setOpen,
    chat,
    usage,
    isReady: !!canvasEditor || !!docEditor,
    reviewMode,
    setReviewMode: reviewModeStore.set,
    changes,
    pending,
    canRevert,
    accept: (ids: string[]) => resolve(ids, "accepted"),
    reject: (ids: string[]) => resolve(ids, "rejected"),
  };
}

export type AgentState = ReturnType<typeof useAgentState>;

const AgentContext = createContext<AgentState | null>(null);

/** Owns the agent chat for a workspace, so it survives closing the panel and switching views. */
export function AgentProvider({
  children,
  ...options
}: Parameters<typeof useAgentState>[0] & { children: ReactNode }) {
  const state = useAgentState(options);
  return <AgentContext.Provider value={state}>{children}</AgentContext.Provider>;
}

export function useAgent() {
  const value = useContext(AgentContext);
  if (!value) throw new Error("useAgent must be used inside <AgentProvider>");
  return value;
}
