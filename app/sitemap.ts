import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://scholaria.ai";
  const routes = [
    "",
    "/dissertation-intelligence",
    "/agent-ecosystem",
    "/services",
    "/how-it-works",
    "/upload",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/enterprise",
    "/dissertation-editing",
    "/apa-7-formatting",
    "/literature-review-editing",
    "/research-methodology-review",
    "/preview/sample-report",
    "/reviews",
    "/security",
    "/academic-integrity"
  ];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: r === "" ? 1 : r.startsWith("/dissertation-editing") ? 0.9 : 0.7
  }));
}
