import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AiMagicIcon,
  KanbanIcon,
  Link01Icon,
  Note01Icon,
  PenTool03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Section, SectionHeading, revealDelay } from "./section-heading";

type Feature = { icon: IconSvgElement; title: string; description: string };

const PILLARS: (Feature & { tag: string })[] = [
  {
    icon: Note01Icon,
    title: "Doc",
    tag: "Write",
    description: "A live document for specs, decisions and notes. Edit together in real time, every change synced.",
  },
  {
    icon: PenTool03Icon,
    title: "Canvas",
    tag: "Sketch",
    description: "An open canvas for architecture, flows and wireframes. Drag shapes, connect them, rearrange freely.",
  },
  {
    icon: AiMagicIcon,
    title: "Agent",
    tag: "Generate",
    description:
      "Describe what you're building. The agent draws the diagram shape by shape and drafts the doc beside it.",
  },
];

const EXTRAS: Feature[] = [
  { icon: UserGroupIcon, title: "Team workspaces", description: "Invite your team and work in shared workspaces." },
  { icon: KanbanIcon, title: "Status board", description: "Track each workspace from Planning to Done." },
  { icon: Link01Icon, title: "Share links", description: "Send a read-only link to anyone, no account needed." },
];

export function ProductSection() {
  return (
    <Section id="product" aria-labelledby="product-title">
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

      <ul className="mt-16 grid gap-4 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <li key={pillar.title} className="reveal" style={revealDelay(i)}>
            <Card className="relative h-full bg-card/50 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:ring-amber-500/40">
              <CardHeader className="gap-3">
                <span className="mb-5 flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background text-amber-500 transition-transform duration-300 ease-out group-hover/card:scale-110 group-hover/card:-rotate-6">
                  <HugeiconsIcon icon={pillar.icon} className="size-5" aria-hidden />
                </span>
                <CardAction>
                  <Badge variant="outline" className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    {pillar.tag}
                  </Badge>
                </CardAction>
                <CardTitle>
                  <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                </CardTitle>
                <CardDescription className="col-span-full leading-relaxed">{pillar.description}</CardDescription>
              </CardHeader>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -bottom-16 size-40 rounded-full bg-amber-500/10 opacity-0 blur-3xl transition-opacity group-hover/card:opacity-100"
              />
            </Card>
          </li>
        ))}
      </ul>

      <ItemGroup className="reveal mt-4 grid gap-4 sm:grid-cols-3">
        {EXTRAS.map((extra) => (
          <Item key={extra.title} variant="outline" className="items-start border-border/60 p-5 hover:bg-muted/40">
            <ItemMedia variant="icon" className="text-muted-foreground transition-colors group-hover/item:text-amber-500">
              <HugeiconsIcon icon={extra.icon} className="size-5" aria-hidden />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <h3>{extra.title}</h3>
              </ItemTitle>
              <ItemDescription>{extra.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </Section>
  );
}
