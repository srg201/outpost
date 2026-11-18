"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ClerkLoaded, ClerkLoading, PricingTable } from "@clerk/nextjs";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { FREE_WORKSPACE_LIMIT, type LimitError } from "@/lib/plan-limits";

type Reason = LimitError | "default";

const UpgradeDialogContext = createContext<(reason?: LimitError) => void>(() => {});

// Lets any part of the app open the pricing dialog with its own reason, e.g.
// openUpgrade("workspaces") when the free workspace limit is hit.
export function UpgradeDialogProvider({ children }: { children: ReactNode }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState<Reason | null>(null);
  const copy = open === null ? null : open === "default" ? dict.upgrade.default : dict.upgrade.reasons[open];
  const values = { limit: FREE_WORKSPACE_LIMIT };
  const reason = copy && { title: format(copy.title, values), description: format(copy.description, values) };

  return (
    <UpgradeDialogContext.Provider value={(next) => setOpen(next ?? "default")}>
      {children}
      <Dialog open={open !== null} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">{reason?.title}</DialogTitle>
            {reason?.description && <DialogDescription>{reason.description}</DialogDescription>}
          </DialogHeader>
          <ClerkLoading>
            <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label={dict.pricing.loading}>
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <PricingTable highlightedPlan="pro" newSubscriptionRedirectUrl="/dashboard" />
          </ClerkLoaded>
        </DialogContent>
      </Dialog>
    </UpgradeDialogContext.Provider>
  );
}

export function useUpgradeDialog() {
  return useContext(UpgradeDialogContext);
}
