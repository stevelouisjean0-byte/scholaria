import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];
type Route = { path: string; priority: number; changeFrequency: Freq };

const ROUTES: Route[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/upload", priority: 0.95, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.95, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
  { path: "/agent-ecosystem", priority: 0.85, changeFrequency: "monthly" },
  { path: "/dissertation-intelligence", priority: 0.85, changeFrequency: "monthly" },
  { path: "/services", priority: 0.85, changeFrequency: "monthly" },
  { path: "/dissertation-editing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/literature-review-editing", priority: 0.85, changeFrequency: "monthly" },
  { path: "/apa-7-formatting", priority: 0.85, changeFrequency: "monthly" },
  { path: "/research-methodology-review", priority: 0.85, changeFrequency: "monthly" },
  { path: "/sample-review", priority: 0.9, changeFrequency: "monthly" },
  { path: "/enterprise", priority: 0.9, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.85, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/security", priority: 0.7, changeFrequency: "monthly" },
  { path: "/academic-integrity", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/press", priority: 0.5, changeFrequency: "monthly" },
  { path: "/vs-grammarly", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vs-chatgpt", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vs-paperpal", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vs-editage", priority: 0.8, changeFrequency: "monthly" },
  { path: "/nyc", priority: 0.85, changeFrequency: "monthly" },
  { path: "/new-jersey", priority: 0.85, changeFrequency: "monthly" },
  { path: "/connecticut", priority: 0.85, changeFrequency: "monthly" },
  { path: "/signin", priority: 0.4, changeFrequency: "yearly" },
  { path: "/signup", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" }
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority
  }));
}
