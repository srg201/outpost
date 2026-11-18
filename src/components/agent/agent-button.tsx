"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { useAgent } from "./agent-provider";

/** Opens and closes the agent panel; shows how many changes are waiting for review. */
export function AgentButton() {
  const agent = useAgent();
  const t = useI18n().dict.agent;
  const pending = agent.pending.length;

  return (
    <Button
      size="sm"
      variant={agent.open ? "secondary" : "default"}
      aria-expanded={agent.open}
      aria-controls="agent-panel"
      onClick={() => agent.setOpen(!agent.open)}
      className="gap-1.5"
    >
      <Image src="/brand/mascot-dark.png" alt="" width={16} height={16} className="size-4 dark:hidden" />
      <Image src="/brand/mascot.png" alt="" width={16} height={16} className="hidden size-4 dark:block" />
      {t.open}
      {pending > 0 && (
        <span className="rounded-full bg-background/20 px-1.5 text-[10px] font-semibold tabular-nums" aria-label={format(t.pendingCount, { count: pending })}>
          {pending}
        </span>
      )}
    </Button>
  );
}
