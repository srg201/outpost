"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicButton } from "@/components/workspace/mic-button";
import { useUpgradeDialog } from "@/components/workspace/upgrade-dialog";
import { createWorkspace } from "@/actions/workspace";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";
import { submitOnEnter } from "@/lib/utils";

const MAX_NAME_LENGTH = 48;

// The workspace is named after the prompt, cut at a word boundary.
function nameFromPrompt(prompt: string) {
  const text = prompt.trim().replace(/\s+/g, " ");
  if (text.length <= MAX_NAME_LENGTH) return text;
  const cut = text.slice(0, MAX_NAME_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 20 ? cut.slice(0, lastSpace) : cut}…`;
}

// Describe what to plan: this creates a workspace and hands the prompt to its agent.
export function DashboardPrompt() {
  const router = useRouter();
  const t = useI18n().dict.dashboard;
  const openUpgrade = useUpgradeDialog();
  const [prompt, setPrompt] = useState("");
  const { loading, fn: create } = useFetch(createWorkspace);
  const canSubmit = !!prompt.trim() && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    const text = prompt.trim();
    const result = await create(nameFromPrompt(text));
    if (!result) return;
    if ("limit" in result) {
      openUpgrade(result.limit);
      return;
    }
    router.push(`/workspace/${result.workspace.id}?prompt=${encodeURIComponent(text)}`);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  return (
    <section aria-labelledby="prompt-title" className="mx-auto w-full max-w-2xl text-center">
      <h1 id="prompt-title" className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {t.promptTitle}
      </h1>
      <p className="mt-3 text-muted-foreground">{t.promptDescription}</p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-3xl border bg-card/60 p-2 text-left shadow-sm backdrop-blur-sm focus-within:ring-[3px] focus-within:ring-ring/30"
      >
        <label htmlFor="dashboard-prompt" className="sr-only">
          {t.promptLabel}
        </label>
        <Textarea
          id="dashboard-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={submitOnEnter(() => void submit())}
          placeholder={t.promptPlaceholder}
          disabled={loading}
          rows={3}
          className="max-h-60 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="flex items-center justify-end gap-1 px-1 pb-1">
          <MicButton value={prompt} onChange={setPrompt} disabled={loading} />
          <Button type="submit" size="icon" className="rounded-full" disabled={!canSubmit} aria-label={t.submit}>
            <HugeiconsIcon icon={ArrowUp02Icon} aria-hidden />
          </Button>
        </div>
      </form>

      <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label={t.examplesLabel}>
        {t.examples.map((example) => (
          <li key={example}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={() => setPrompt(example)}
              disabled={loading}
            >
              {example}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
