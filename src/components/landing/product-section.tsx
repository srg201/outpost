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
import { getDictionary } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/dictionaries/en";

type FeatureKey<T> = { key: keyof T; icon: IconSvgElement };

const PILLARS: FeatureKey<Dictionary["product"]["pillars"]>[] = [
  { key: "doc", icon: Note01Icon },
  { key: "canvas", icon: PenTool03Icon },
  { key: "agent", icon: AiMagicIcon },
];

const EXTRAS: FeatureKey<Dictionary["product"]["extras"]>[] = [
  { key: "teams", icon: UserGroupIcon },
  { key: "board", icon: KanbanIcon },
  { key: "share", icon: Link01Icon },
];

export async function ProductSection() {
  const { product } = await getDictionary();

  return (
    <Section id="product" aria-labelledby="product-title">
      <SectionHeading
        id="product-title"
        eyebrow={product.eyebrow}
        title={
          <>
            {product.title} <span className="text-muted-foreground">{product.titleMuted}</span>
          </>
        }
        description={product.description}
      />

      <ul className="mt-16 grid gap-4 md:grid-cols-3">
        {PILLARS.map(({ key, icon }, i) => {
          const pillar = product.pillars[key];
          return (
          <li key={key} className="reveal" style={revealDelay(i)}>
            <Card className="relative h-full bg-card/50 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 hover:ring-amber-500/40">
              <CardHeader className="gap-3">
                <span className="mb-5 flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background text-amber-500 transition-transform duration-300 ease-out group-hover/card:scale-110 group-hover/card:-rotate-6">
                  <HugeiconsIcon icon={icon} className="size-5" aria-hidden />
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
          );
        })}
      </ul>

      <ItemGroup className="reveal mt-4 grid gap-4 sm:grid-cols-3">
        {EXTRAS.map(({ key, icon }) => {
          const extra = product.extras[key];
          return (
          <Item key={key} variant="outline" className="items-start border-border/60 p-5 hover:bg-muted/40">
            <ItemMedia variant="icon" className="text-muted-foreground transition-colors group-hover/item:text-amber-500">
              <HugeiconsIcon icon={icon} className="size-5" aria-hidden />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <h3>{extra.title}</h3>
              </ItemTitle>
              <ItemDescription>{extra.description}</ItemDescription>
            </ItemContent>
          </Item>
          );
        })}
      </ItemGroup>
    </Section>
  );
}
