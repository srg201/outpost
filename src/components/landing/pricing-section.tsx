import { ClerkLoaded, ClerkLoading, PricingTable } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import { Section, SectionHeading } from "./section-heading";
import { getDictionary } from "@/i18n/get-dictionary";
export async function PricingSection() {
  const { pricing } = await getDictionary();

  return (
    <Section id="pricing" aria-labelledby="pricing-title">
      <SectionHeading
        id="pricing-title"
        eyebrow={pricing.eyebrow}
        title={pricing.title}
        description={pricing.description}
      />

      <div className="reveal mx-auto mt-16 max-w-4xl">
        {/* Placeholder about the table's size, so the page doesn't jump while Clerk loads */}
        <ClerkLoading>
          <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label={pricing.loading}>
            <Skeleton className="h-112 rounded-2xl" />
            <Skeleton className="h-112 rounded-2xl" />
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <PricingTable highlightedPlan="pro" newSubscriptionRedirectUrl="/dashboard" />
        </ClerkLoaded>
      </div>
    </Section>
  );
}
