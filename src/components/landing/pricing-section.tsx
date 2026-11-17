import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

type Plan = {
  name: string;
  price: string;
  note?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string } | null;
  featured?: boolean;
  badge?: string;
};

const PLANS: Plan[] = [
  {
    name: "Free trial",
    price: "$0",
    description: "Try Outpost on a real project before you commit.",
    features: [
      "Doc and canvas in every workspace",
      "AI agent for diagrams and specs",
      "Share links",
    ],
    cta: { label: "Start Free Trial", href: "/sign-up" },
  },
  {
    name: "Pro",
    price: "$12",
    note: "/ month",
    description: "For builders who plan in Outpost every day.",
    features: [
      "Everything in Free trial",
      "Unlimited workspaces",
      "Unlimited agent prompts",
      "Status board for every workspace",
    ],
    cta: { label: "Get Pro", href: "/sign-up" },
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    price: "Coming soon",
    description: "For teams that plan together, with shared workspaces and roles.",
    features: ["Everything in Pro", "Team workspaces and invites", "Roles and permissions", "Priority support"],
    cta: null,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-18 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple pricing that grows with you"
          description="Start with a free trial, upgrade to Pro when Outpost becomes part of your day."
        />

        <div className="mt-16 grid items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              style={{ "--reveal-offset": `${i * 8}%` } as React.CSSProperties}
              className={cn("reveal", plan.featured && "survey-frame")}
            >
              <article
                className={cn(
                  "flex h-full flex-col rounded-2xl border bg-card/50 p-8 transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl",
                  plan.featured ? "border-amber-500/40" : "border-border/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{plan.name}</h3>
                  {plan.badge && (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-amber-500 uppercase">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-semibold">{plan.price}</span>
                  {plan.note && <span className="text-sm text-muted-foreground">{plan.note}</span>}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-8 flex flex-col gap-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className={cn("size-4 shrink-0", plan.featured ? "text-amber-500" : "text-muted-foreground")}
                      aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  {plan.cta ? (
                    <Button
                      size="lg"
                      variant={plan.featured ? "default" : "outline"}
                      className="w-full"
                      nativeButton={false}
                      render={<Link href={plan.cta.href} />}
                    >
                      {plan.cta.label}
                    </Button>
                  ) : (
                    <Button size="lg" variant="outline" className="w-full" disabled>
                      Coming soon
                    </Button>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
