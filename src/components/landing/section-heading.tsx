import { cn } from "@/lib/utils";

/** Mono eyebrow with a diamond marker, as used in the hero. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 font-mono text-xs tracking-widest text-muted-foreground uppercase backdrop-blur-sm",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rotate-45 bg-amber-500" />
      {children}
    </p>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  /** id for the heading; pass the same value to the section's aria-labelledby */
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="reveal mx-auto flex max-w-2xl flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-5 font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
      )}
    </div>
  );
}
