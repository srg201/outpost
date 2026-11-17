import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AiMagicIcon,
  KanbanIcon,
  Link01Icon,
  Note01Icon,
  PenTool03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { SectionHeading } from "./section-heading";

const PILLARS: { icon: IconSvgElement; title: string; body: string; tag: string }[] = [
  {
    icon: Note01Icon,
    title: "Doc",
    tag: "Write",
    body: "A live document for specs, decisions and notes. Edit together in real time, every change synced.",
  },
  {
    icon: PenTool03Icon,
    title: "Canvas",
    tag: "Sketch",
    body: "An open canvas for architecture, flows and wireframes. Drag shapes, connect them, rearrange freely.",
  },
  {
    icon: AiMagicIcon,
    title: "Agent",
    tag: "Generate",
    body: "Describe what you're building. The agent draws the diagram shape by shape and drafts the doc beside it.",
  },
];

const EXTRAS: { icon: IconSvgElement; title: string; body: string }[] = [
  { icon: UserGroupIcon, title: "Team workspaces", body: "Invite your team and work in shared workspaces." },
  { icon: KanbanIcon, title: "Status board", body: "Track each workspace from Planning to Done." },
  { icon: Link01Icon, title: "Share links", body: "Send a read-only link to anyone, no account needed." },
];

export function ProductSection() {
  return (
    <section id="product" aria-labelledby="product-title" className="scroll-mt-18 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="product-title"
          eyebrow="Product"
          title={
            <>
              Docs, canvas and an agent. <span className="text-muted-foreground">One workspace.</span>
            </>
          }
          description="Every workspace pairs a document with a canvas, and an AI agent that can work in both."
        />

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <article
              key={p.title}
              style={{ "--reveal-offset": `${i * 8}%` } as React.CSSProperties}
              className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 transition-[border-color,translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background text-amber-500 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <HugeiconsIcon icon={p.icon} className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                  {p.tag}
                </span>
              </div>
              <h3 className="mt-8 font-heading text-2xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -bottom-16 size-40 rounded-full bg-amber-500/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
              />
            </article>
          ))}
        </div>

        <div className="reveal mt-4 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-3">
          {EXTRAS.map((e) => (
            <div key={e.title} className="group flex gap-4 bg-background p-6 transition-colors duration-300 hover:bg-muted/40">
              <HugeiconsIcon icon={e.icon} className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-amber-500" aria-hidden />
              <div>
                <h3 className="font-medium">{e.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
