// Signed-in app pages (dashboard, board, workspace).
export default function MainLayout({ children }: LayoutProps<"/[lang]">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
