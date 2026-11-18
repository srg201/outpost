import { ClerkLoaded, ClerkLoading, PricingTable } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import { Section, SectionHeading } from "./section-heading";

/**
 * Plans, prices and features come from Clerk Billing
 * (Clerk Dashboard -> Billing -> Plans), so pricing changes need no deploy.
 * Signed-out visitors who pick a plan are sent to sign in first; checkout
 * runs in Clerk's drawer.
 */
export function PricingSection() {
  return (
    <Section id="pricing" aria-labelledby="pricing-title">
      <SectionHeading
        id="pricing-title"
        eyebrow="Pricing"
        title="Simple pricing that grows with you"
        description="Start free, upgrade to Pro when Outpost becomes part of your day."
      />

      <div className="reveal mx-auto mt-16 max-w-4xl">
        {/* Placeholder about the table's size, so the page doesn't jump while Clerk loads */}
        <ClerkLoading>
          <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading plans">
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
