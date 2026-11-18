import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/** Mono eyebrow label with a diamond marker, shown above section titles. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 gap-2 border-border/60 bg-background/60 px-3 font-mono text-xs font-normal tracking-widest text-muted-foreground uppercase backdrop-blur-sm",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rotate-45 bg-amber-500" />
      {children}
    </Badge>
  );
}

type SectionHeadingProps = {
  /** id for the <h2>; pass the same value to the section's aria-labelledby */
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
};

/** Centered eyebrow, title and lead paragraph used at the top of each section. */
export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="reveal mx-auto flex max-w-2xl flex-col items-center text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-5 font-heading text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl"
      >
        {title}
      </h2>
      {description && <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </header>
  );
}

/** Wrapper giving every landing section the same spacing, width and anchor offset. */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("scroll-mt-18 px-6 py-24 md:py-32", className)} {...props}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Spreads a stagger offset onto a `reveal` element: the i-th item enters a little later. */
export function revealDelay(index: number): React.CSSProperties {
  return { "--reveal-offset": `${index * 8}%` } as React.CSSProperties;
}
