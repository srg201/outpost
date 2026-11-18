import type { ReactNode } from "react";

import { Logo } from "./logo";

/** A centered full-page message (404, errors), on the same topographic texture as the landing page. */
export function StatusScreen({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-[70dvh] flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div aria-hidden className="bg-topo absolute inset-0 -z-10 opacity-15 dark:opacity-20" />
      <Logo />
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{code}</p>
      <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="max-w-md text-muted-foreground text-pretty">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>
    </div>
  );
}
