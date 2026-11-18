import type { Metadata } from "next";
import { Suspense } from "react";

import { getDictionary } from "@/i18n/get-dictionary";
import { DashboardPrompt } from "./_components/dashboard-prompt";
import { RecentWorkspaces, RecentWorkspacesSkeleton } from "./_components/recent-workspaces";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.dashboard };
}

// The prompt is static and shows at once; the user's workspaces stream in behind Suspense.
export default function DashboardPage() {
  return (
    <div className="relative isolate flex-1">
      <div aria-hidden className="bg-topo absolute inset-x-0 top-0 -z-10 h-96 opacity-10 mask-b-from-20% dark:opacity-15" />

      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20">
        <DashboardPrompt />

        <Suspense fallback={<RecentWorkspacesSkeleton />}>
          <RecentWorkspaces />
        </Suspense>
      </div>
    </div>
  );
}
