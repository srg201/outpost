import { UpgradeDialogProvider } from "@/components/workspace/upgrade-dialog";

// Signed-in app pages. Any of them can open the upgrade dialog with useUpgradeDialog().
export default function MainLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <UpgradeDialogProvider>
      <div className="flex flex-1 flex-col">{children}</div>
    </UpgradeDialogProvider>
  );
}
