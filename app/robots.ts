import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" }
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE
  };
}
