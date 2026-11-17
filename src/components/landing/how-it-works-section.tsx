import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    title: "Open a workspace",
    body: "Create a workspace for a project. It comes with a doc and a canvas, ready to go.",
    detail: "workspace / new",
  },
  {
    title: "Prompt the agent",
    body: "Describe the system you're building. The agent lays out the diagram and writes the spec next to it.",
    detail: "agent / draw",
  },
  {
    title: "Refine and share",
    body: "Edit anything by hand, move it through your status board, and share a link when it's ready.",
    detail: "share / link",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="relative scroll-mt-18 border-y border-border/60 bg-muted/20 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="how-it-works-title"
          eyebrow="How it works"
          title="From idea to diagram in three steps"
          description="No blank-page problem. Start with a prompt, finish with a plan your team can read."
        />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Route line connecting the markers on desktop */}
          <div
            aria-hidden
            className="reveal absolute top-5 right-[16.66%] left-[16.66%] hidden border-t border-dashed border-amber-500/40 md:block"
          />
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              style={{ "--reveal-offset": `${i * 8}%` } as React.CSSProperties}
              className="reveal group relative flex flex-col items-center text-center"
            >
              <span className="relative z-10 flex size-10 rotate-45 items-center justify-center border border-amber-500/60 bg-background transition-[background-color,scale] duration-300 ease-out group-hover:scale-110 group-hover:bg-amber-500/10">
                <span className="-rotate-45 font-mono text-sm text-amber-500">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3 className="mt-8 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              <code className="mt-5 rounded-md border border-border/60 bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
                {step.detail}
              </code>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
