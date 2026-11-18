import type { KeyboardEvent } from "react";

export { cn } from "cn";

// Enter submits, Shift+Enter adds a new line (and IME composition is left alone).
export function submitOnEnter(submit: () => void) {
  return (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };
}

const CURSOR_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#eab308", "#14b8a6", "#ef4444"];

// The same user always gets the same cursor color, across tabs, sessions, the doc and the canvas.
export function colorForUser(userId: string) {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
