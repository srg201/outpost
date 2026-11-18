import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading, revealDelay } from "./section-heading";

const STEPS = [
  {
    title: "Open a workspace",
    description: "Create a workspace for a project. It comes with a doc and a canvas, ready to go.",
    detail: "workspace / new",
  },
  {
    title: "Prompt the agent",
    description: "Describe the system you're building. The agent lays out the diagram and writes the spec next to it.",
    detail: "agent / draw",
  },
  {
    title: "Refine and share",
    description: "Edit anything by hand, move it through your status board, and share a link when it's ready.",
    detail: "share / link",
  },
];

export function HowItWorksSection() {
  return (
    <Section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="border-y border-border/60 bg-muted/20"
    >
      <SectionHeading
        id="how-it-works-title"
        eyebrow="How it works"
        title="From idea to diagram in three steps"
        description="No blank-page problem. Start with a prompt, finish with a plan your team can read."
      />

      <div className="relative mt-16">
        {/* Dashed route connecting the step markers (desktop only, decorative) */}
        <div
          aria-hidden
          className="reveal absolute top-5 right-[16.66%] left-[16.66%] hidden border-t border-dashed border-amber-500/40 md:block"
        />

        <ol className="grid gap-12 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              style={revealDelay(i)}
              className="reveal group relative flex flex-col items-center text-center"
            >
              {/* Diamond step marker; the list itself conveys the order to screen readers */}
              <span
                aria-hidden
                className="relative z-10 flex size-10 rotate-45 items-center justify-center border border-amber-500/60 bg-background transition-[background-color,scale] duration-300 ease-out group-hover:scale-110 group-hover:bg-amber-500/10"
              >
                <span className="-rotate-45 font-mono text-sm text-amber-500">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3 className="mt-8 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              <Badge variant="outline" className="mt-5 font-mono text-[11px] font-normal text-muted-foreground">
                {step.detail}
              </Badge>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
