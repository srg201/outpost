import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist_Mono, Outfit, Raleway } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import AppShell from "@/components/web/app-shell";

const fontSans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const fontHeading = Raleway({ subsets: ["latin"], variable: "--font-heading" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Plan in docs, sketch on the canvas, and let an AI agent turn your ideas into diagrams, all in one workspace for you and your team.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Outpost: docs, canvas and an AI agent in one workspace",
    template: "%s · Outpost",
  },
  description,
  applicationName: "Outpost",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Outpost",
    title: "Outpost",
    description,
    images: [{ url: "/social/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Outpost",
    description,
    images: ["/social/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full font-sans antialiased", fontSans.variable, fontHeading.variable, fontMono.variable)}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClerkProvider appearance={{ theme: shadcn }}>
            <TooltipProvider>
              {/* AppShell reads the pathname, which Cache Components requires inside Suspense */}
              <Suspense>
                <AppShell>{children}</AppShell>
              </Suspense>
            </TooltipProvider>
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
