import { WorkspaceCard } from "@/components/workspace/workspace-card";
import type { WorkspaceCardData } from "@/lib/workspace-status";

export function RecentWorkspaces({ workspaces }: { workspaces: WorkspaceCardData[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {workspaces.map((workspace) => (
        <li key={workspace.id}>
          <WorkspaceCard workspace={workspace} showStatus />
        </li>
      ))}
    </ul>
  );
}
