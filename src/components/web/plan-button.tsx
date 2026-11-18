"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useSubscription,
  SubscriptionDetailsButton,
} from "@clerk/nextjs/experimental";
import { Button } from "../ui/button";
import { useI18n } from "@/i18n/client";

const PlanButton = () => {
  const { orgId, has } = useAuth();
  const { common } = useI18n().dict;
  const payerType = orgId ? "organization" : "user";

  const { data: subscription } = useSubscription({ for: payerType });

  const paidPlan = subscription?.subscriptionItems.find(
    (item) => item.status === "active" && !item.plan.isDefault,
  )?.plan;

  const isPaid = Boolean(paidPlan);

  const planButton = <Button
  type="button"
  className={'flex h-full items-center px-3 font-medium text-foreground bg-background transition-colors hover:bg-foreground/5'}
  >
    {paidPlan?.name ?? common.freePlan}
  </Button>

  const canManage =
    isPaid && (!orgId || has?.({ permission: "ord:sys_billing:manage" }));

  return (
    <div className="flex h-8 items-center overflow-hidden rounded-full border border-foreground/10 bg-background text-xs">
      {canManage ? (
        <SubscriptionDetailsButton for={payerType}>{planButton}</SubscriptionDetailsButton>
      ) : (
        planButton
      )}
    </div>
  );
};

export default PlanButton;
