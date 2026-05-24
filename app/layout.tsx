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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://scholaria.ai"),
  title: {
    default: "Scholaria — Agentic AI Operating System for Doctoral Research & Academic Workflows",
    template: "%s · Scholaria"
  },
  description:
    "An Agentic AI operating system for doctoral research. Coordinated Agentic AI Agents validate scholarly workflows, perform intelligent multi-step verification, and reduce human error across dissertation review, literature synthesis, methodology alignment, and citation integrity.",
  keywords: [
    "agentic AI agents",
    "agentic AI for research",
    "autonomous academic assistance",
    "research-grade workflow automation",
    "dissertation editing",
    "doctoral research validation",
    "PhD editing",
    "EdD editing",
    "APA 7 verification",
    "multi-agent academic review",
    "citation verification",
    "precision-driven AI systems"
  ],
  openGraph: {
    title: "Scholaria — Agentic AI Operating System for Doctoral Research",
    description:
      "Coordinated Agentic AI Agents that validate research workflows, reduce human error, and deliver research-grade consistency for doctoral and graduate-level scholarship.",
    type: "website",
    siteName: "Scholaria",
    locale: "en_US",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "Scholaria — Agentic AI Agents for doctoral research."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Scholaria — Agentic AI Operating System for Doctoral Research",
    description:
      "Coordinated Agentic AI Agents that validate research workflows, reduce human error, and deliver research-grade consistency.",
    images: ["/og/default.png"]
  },
  alternates: { canonical: "/" },
  authors: [{ name: "Scholaria editorial desk" }],
  creator: "Scholaria",
  publisher: "Scholaria",
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
