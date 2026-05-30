import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteGraph } from "@/lib/jsonld";
import { clerkEnabled } from "@/lib/clerk-config";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dissertation Editing Center — Chapter-grade AI review for Ph.D., Ed.D., and DBA candidates",
    template: "%s · Dissertation Editing Center"
  },
  description:
    "Chapter-grade dissertation review for Ph.D., Ed.D., and DBA candidates. A coordinated multi-agent review system that critiques, never authors — methodology alignment, APA 7 verification, citation cross-check, and a submission readiness score in 24 hours. Free first review.",
  keywords: [
    "dissertation editing",
    "PhD editing",
    "EdD editing",
    "doctoral paper editing",
    "dissertation review service",
    "APA 7 editing",
    "literature review editing",
    "research methodology review",
    "citation verification",
    "scholarly editing service",
    "dissertation editor NYC",
    "dissertation editor New Jersey",
    "dissertation editor Connecticut"
  ],
  openGraph: {
    title: "Dissertation Editing Center — Chapter-grade AI review for doctoral candidates",
    description:
      "Coordinated multi-agent review that critiques, never authors. Methodology alignment, APA 7 verification, citation cross-check, and a readiness score in 24 hours. Free first review.",
    type: "website",
    siteName: "Dissertation Editing Center",
    locale: "en_US",
    url: SITE_URL,
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Dissertation Editing Center — chapter-grade AI review for doctoral candidates."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Dissertation Editing Center — Chapter-grade AI review for doctoral candidates",
    description:
      "Coordinated multi-agent review that critiques, never authors. Methodology alignment, APA 7 verification, citation cross-check, readiness score in 24 hours. Free first review.",
    images: ["/og/default.png"]
  },
  alternates: { canonical: "/" },
  authors: [{ name: "Dissertation Editing Center editorial desk" }],
  creator: "Dissertation Editing Center",
  publisher: "Dissertation Editing Center",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  category: "education"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="content">{children}</main>
        <SiteFooter />
        <Script
          id="ld-site-graph"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
        />
      </body>
    </html>
  );

  // When Clerk is configured, wrap the entire app in <ClerkProvider> so
  // useUser(), <SignedIn>, <SignedOut>, and <UserButton> work everywhere.
  // When it is not configured, ship the same shell — the placeholder
  // <AuthForm> on /signin / /signup handles the unauth flow gracefully.
  return clerkEnabled ? <ClerkProvider>{shell}</ClerkProvider> : shell;
}
