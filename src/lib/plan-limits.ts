export const FREE_WORKSPACE_LIMIT = 3;
export const FREE_MONTHLY_PROMPTS = 20;

export const PROMPT_LIMIT_ERROR = "prompt_limit_reached";

// What the upgrade dialog explains; the copy for each lives in the dictionaries (upgrade.reasons).
export const LIMIT_ERRORS = ["prompts", "workspaces", "sharing", "pdfExport"] as const;
export type LimitError = (typeof LIMIT_ERRORS)[number];
