import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "./section-heading";

export function CtaSection() {
  return (
    <section aria-labelledby="cta-title" className="px-6 pb-24 md:pb-32">
      <div className="reveal relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card/40 px-6 py-20 text-center md:py-28">
        <div aria-hidden className="bg-topo absolute inset-0 -z-10 opacity-15 dark:opacity-20" />
        <Eyebrow>Set up camp</Eyebrow>
        <h2 id="cta-title" className="mx-auto mt-5 max-w-2xl font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Your next project needs an <span className="text-amber-500">Outpost</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Create a workspace, describe what you&apos;re building, and watch the plan take shape.
        </p>
        <div className="mt-10 flex justify-center">
          <Button size="lg" nativeButton={false} render={<Link href="/sign-up" />}>
            Start Building Free
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
