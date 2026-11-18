import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist_Mono, Onest, Outfit, Raleway } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { ruRU } from "@clerk/localizations";

import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import AppShell from "@/components/web/app-shell";
import { SiteFooter } from "@/components/web/site-footer";
import { UpgradeDialogProvider } from "@/components/workspace/upgrade-dialog";
import { I18nProvider } from "@/i18n/client";
import { LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

// Outfit has no Cyrillic, so Russian text falls through to Onest, a close geometric match.
// globals.css chains the two by family name (see --font-sans).
const fontSans = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-outfit" });
const fontCyrillic = Onest({ subsets: ["cyrillic", "cyrillic-ext"], variable: "--font-onest" });
const fontHeading = Raleway({ subsets: ["latin", "cyrillic"], variable: "--font-heading" });
const fontMono = Geist_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-geist-mono" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Cache Components needs every root param value up front.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = await getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: "%s · Outpost" },
    description: meta.description,
    applicationName: "Outpost",
    manifest: "/manifest.json",
    icons: {
      icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
      apple: "/apple-icon.png",
    },
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
    openGraph: {
      type: "website",
      siteName: "Outpost",
      title: "Outpost",
      description: meta.description,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      images: [{ url: "/social/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Outpost",
      description: meta.description,
      images: ["/social/og-image.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("h-full font-sans antialiased", fontSans.variable, fontCyrillic.variable, fontHeading.variable, fontMono.variable)}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClerkProvider appearance={{ theme: shadcn }} localization={locale === "ru" ? ruRU : undefined}>
            <I18nProvider locale={locale} dict={dict}>
              <TooltipProvider>
                {/* Global, so the header's command palette can open it too. */}
                <UpgradeDialogProvider>
                  {/* AppShell reads the pathname, which Cache Components requires inside Suspense */}
                  <Suspense>
                    <AppShell footer={<SiteFooter />}>{children}</AppShell>
                  </Suspense>
                </UpgradeDialogProvider>
              </TooltipProvider>
              <Toaster />
            </I18nProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
