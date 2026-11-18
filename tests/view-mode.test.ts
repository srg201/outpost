import { describe, expect, it } from "vitest";

import { normalizeModelText } from "@/lib/agent/tools";
import { parseViewMode, viewHref } from "@/lib/view-mode";

describe("view modes", () => {
  it("falls back to both for anything unknown", () => {
    expect(parseViewMode("doc")).toBe("doc");
    expect(parseViewMode("canvas")).toBe("canvas");
    expect(parseViewMode(undefined)).toBe("both");
    expect(parseViewMode("nonsense")).toBe("both");
    expect(parseViewMode(["doc", "canvas"])).toBe("both");
  });

  it("keeps the default view's URL clean", () => {
    expect(viewHref("/workspace/abc", "both")).toBe("/workspace/abc");
    expect(viewHref("/shared/token", "canvas")).toBe("/shared/token?view=canvas");
  });
});

describe("normalizeModelText", () => {
  it("turns escaped newlines into real ones when the model sent no real ones", () => {
    expect(normalizeModelText("# Title\\n\\n- item")).toBe("# Title\n\n- item");
  });

  it("leaves text with real newlines alone, including literal backslash-n in code", () => {
    const text = 'Use "\\n" to split\nlines';
    expect(normalizeModelText(text)).toBe(text);
  });
});
