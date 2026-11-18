import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

// Stand-in for a surface that can't run here, with the reason.
export function PendingSurface({ icon, title, text }: { icon: IconSvgElement; title: string; text: string }) {
  return (
    <section aria-label={title} className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl border bg-muted/30 text-amber-500">
        <HugeiconsIcon icon={icon} className="size-5" aria-hidden />
      </span>
      <p className="font-medium">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
    </section>
  );
}
