import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
};

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
