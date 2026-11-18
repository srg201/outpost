import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { SignIn } from "@clerk/nextjs";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.signIn };
}

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      {/* Clerk's catch-all component reads the request, so it must render inside Suspense */}
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
