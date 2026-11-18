"use client";

import { useState } from "react";
import { getToolName, isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowUp02Icon,
  Cancel01Icon,
  File01Icon,
  PenTool03Icon,
  StopIcon,
  Tick02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import { MicButton } from "@/components/workspace/mic-button";
import { useUpgradeDialog } from "@/components/workspace/upgrade-dialog";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import type { AgentChange } from "@/lib/agent/changes";
import { isAgentTool, type ToolOutput } from "@/lib/agent/tools";
import { PROMPT_LIMIT_ERROR } from "@/lib/plan-limits";
import { cn, submitOnEnter } from "@/lib/utils";
import { useAgent, type AgentMessage } from "./agent-provider";

/** The agent chat, laid over the right side of the workspace so the editors keep their size. */
export function AgentPanel() {
  const agent = useAgent();
  const { dict } = useI18n();
  const t = dict.agent;
  const openUpgrade = useUpgradeDialog();
  const { messages, sendMessage, stop, status, error } = agent.chat;
  const [input, setInput] = useState("");

  const isBusy = status === "submitted" || status === "streaming";
  // Mid-response, a second request would run alongside the first and duplicate its message.
  const canSend = agent.isReady && !isBusy;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !canSend) return;
    void sendMessage({ text: trimmed });
    setInput("");
  };

  if (!agent.open) return null;

  return (
    <aside
      id="agent-panel"
      aria-label={t.title}
      className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l bg-background shadow-2xl sm:w-100"
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <h2 className="font-heading text-sm font-semibold">{t.title}</h2>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground" title={t.reviewModeHint}>
          {t.reviewMode}
          <Switch size="sm" checked={agent.reviewMode} onCheckedChange={agent.setReviewMode} />
        </label>
        <Button variant="ghost" size="icon-sm" aria-label={t.close} title={t.close} onClick={() => agent.setOpen(false)}>
          <HugeiconsIcon icon={Cancel01Icon} aria-hidden />
        </Button>
      </header>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport aria-label={t.title}>
            <MessageScrollerContent className="gap-5 p-4">
              {messages.length === 0 ? (
                <EmptyState onPick={send} disabled={!canSend} />
              ) : (
                messages.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"}>
                    <ChatMessage message={message} />
                  </MessageScrollerItem>
                ))
              )}
              {status === "submitted" && (
                <TraceLine status="running">
                  <TraceTitle>{t.thinking}</TraceTitle>
                </TraceLine>
              )}
              {error && (
                <p role="alert" className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">
                  {error.message.includes(PROMPT_LIMIT_ERROR) ? (
                    <>
                      {t.limitReached}{" "}
                      <button type="button" onClick={() => openUpgrade("prompts")} className="font-medium text-primary hover:underline">
                        {t.upgrade}
                      </button>
                    </>
                  ) : (
                    t.error
                  )}
                </p>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <ReviewBar />

      <form
        className="shrink-0 border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={submitOnEnter(() => send(input))}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            rows={1}
            disabled={!agent.isReady}
            className="max-h-32 min-h-9 flex-1 resize-none"
          />
          <MicButton value={input} onChange={setInput} disabled={!agent.isReady} />
          {isBusy ? (
            <Button type="button" size="icon" variant="secondary" aria-label={t.stop} title={t.stop} onClick={() => void stop()}>
              <HugeiconsIcon icon={StopIcon} aria-hidden />
            </Button>
          ) : (
            <Button type="submit" size="icon" aria-label={t.send} title={t.send} disabled={!input.trim() || !canSend}>
              <HugeiconsIcon icon={ArrowUp02Icon} aria-hidden />
            </Button>
          )}
        </div>
        {agent.usage && (
          <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
            {format(t.usage, { used: agent.usage.used, limit: agent.usage.limit })}
          </p>
        )}
      </form>
    </aside>
  );
}

function EmptyState({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  const t = useI18n().dict.agent;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.intro}</p>
      <ul className="space-y-2">
        {t.suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(suggestion)}
              className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatMessage({ message }: { message: AgentMessage }) {
  const t = useI18n().dict.agent;

  if (message.role === "user") {
    return (
      <Message align="end">
        <Bubble align="end">
          <BubbleContent className="whitespace-pre-wrap">
            {message.parts.map((part) => (isTextUIPart(part) ? part.text : "")).join("")}
          </BubbleContent>
        </Bubble>
      </Message>
    );
  }

  return (
    <Message>
      <MessageContent className="gap-2">
        {message.parts.map((part, index) => {
          if (isReasoningUIPart(part)) {
            if (!part.text) return null;
            return (
              <TraceCollapsible key={index}>
                <TraceCollapsibleTrigger>
                  <TraceLine status={part.state === "streaming" ? "running" : undefined}>
                    <TraceTitle>{part.state === "streaming" ? t.thinking : t.reasoning}</TraceTitle>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent className="text-xs whitespace-pre-wrap">{part.text}</TraceCollapsibleContent>
              </TraceCollapsible>
            );
          }
          if (isTextUIPart(part)) {
            return part.text ? (
              <p key={index} className="leading-relaxed whitespace-pre-wrap">
                {part.text}
              </p>
            ) : null;
          }
          if (isToolUIPart(part)) {
            // Every agent tool returns a ToolOutput (dynamic tools, typed unknown, aren't used).
            const output = part.state === "output-available" ? (part.output as ToolOutput) : undefined;
            const error = output && !output.success ? output.error : undefined;
            return <ChangeCard key={part.toolCallId} toolCallId={part.toolCallId} toolName={getToolName(part)} error={error} />;
          }
          return null;
        })}
      </MessageContent>
    </Message>
  );
}

/** One change the agent made: what and where, and in review mode, accept / reject / show. */
function ChangeCard({ toolCallId, toolName, error }: { toolCallId: string; toolName: string; error?: string }) {
  const agent = useAgent();
  const t = useI18n().dict.agent;
  const change = agent.changes.find((c) => c.toolCallId === toolCallId);
  const label = isAgentTool(toolName) ? t.tools[toolName] : toolName;

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Alert02Icon} aria-hidden className="mt-px size-3.5 shrink-0 text-destructive" />
        <span>
          {t.failed}: {label}. <span className="opacity-70">{error}</span>
        </span>
      </div>
    );
  }

  if (!change) {
    return (
      <TraceLine status="running">
        <TraceTitle>{label}</TraceTitle>
      </TraceLine>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        change.status === "pending" && "border-primary/40 bg-primary/5",
        change.status === "rejected" && "opacity-60",
      )}
    >
      <HugeiconsIcon
        icon={change.surface === "canvas" ? PenTool03Icon : File01Icon}
        aria-label={t.surfaces[change.surface]}
        className="size-3.5 shrink-0 text-muted-foreground"
      />
      <span className={cn("min-w-0 flex-1 truncate", change.status === "rejected" && "line-through")}>
        <span className="font-medium">{label}</span>
        {change.detail && <span className="text-muted-foreground"> · {change.detail}</span>}
      </span>
      <ChangeActions change={change} />
    </div>
  );
}

function ChangeActions({ change }: { change: AgentChange }) {
  const agent = useAgent();
  const t = useI18n().dict.agent;

  const live = agent.canRevert(change);

  if (change.status !== "pending") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
        {change.status === "accepted" ? t.accepted : t.rejected}
        {change.status === "accepted" && live && (
          <Button variant="ghost" size="xs" onClick={() => agent.reject([change.toolCallId])}>
            {t.undo}
          </Button>
        )}
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {change.focus && live && (
        <Button variant="ghost" size="icon-xs" aria-label={t.show} title={t.show} onClick={change.focus}>
          <HugeiconsIcon icon={ViewIcon} aria-hidden />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={t.reject}
        title={t.reject}
        disabled={!live}
        onClick={() => agent.reject([change.toolCallId])}
        className="hover:text-destructive"
      >
        <HugeiconsIcon icon={Cancel01Icon} aria-hidden />
      </Button>
      <Button variant="ghost" size="icon-xs" aria-label={t.accept} title={t.accept} onClick={() => agent.accept([change.toolCallId])}>
        <HugeiconsIcon icon={Tick02Icon} aria-hidden />
      </Button>
    </span>
  );
}

function ReviewBar() {
  const agent = useAgent();
  const t = useI18n().dict.agent;
  if (agent.pending.length === 0) return null;
  const ids = agent.pending.map((c) => c.toolCallId);

  return (
    <div className="flex shrink-0 items-center gap-2 border-t bg-muted/40 px-4 py-2 text-xs">
      <span className="font-medium tabular-nums">{format(t.pendingCount, { count: agent.pending.length })}</span>
      <Button variant="ghost" size="xs" className="ml-auto" onClick={() => agent.reject(ids)}>
        {t.rejectAll}
      </Button>
      <Button size="xs" onClick={() => agent.accept(ids)}>
        {t.acceptAll}
      </Button>
    </div>
  );
}
