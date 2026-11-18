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
