import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { checkUser } from "@/actions/check-user";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard");

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Welcome{user.name ? `, ${user.name}` : ""}
      </h1>
    </div>
  );
}
