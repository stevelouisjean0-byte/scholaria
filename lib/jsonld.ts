/**
 * Centralised JSON-LD builders.
 *
 * Every page either emits the site-wide entity graph (rendered once at the
 * root layout level) or its own page-specific schema. We keep these in one
 * file so we never duplicate definitions or drift identity between pages.
 *
 * `@id` URIs are stable identifiers; LLMs and search engines rely on them
 * to de-duplicate the same entity referenced across multiple pages.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://scholaria.ai";
const ORG_ID = `${APP_URL}/#organization`;
const SITE_ID = `${APP_URL}/#website`;

/* -------------------------------------------------------------------------- *
 * Site-wide graph — emitted once from the root layout.
 * -------------------------------------------------------------------------- */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "Scholaria",
        alternateName: "Scholaria — A Review of Doctoral Writing",
        url: APP_URL,
        logo: `${APP_URL}/logo.png`,
        sameAs: [],
        description:
          "Enterprise AI dissertation review and scholarly editing platform — an autonomous, multi-agent academic intelligence ecosystem for Ph.D., Ed.D., doctoral, and graduate-level researchers.",
        knowsAbout: [
          "Dissertation editing",
          "APA 7 formatting",
          "Literature review analysis",
          "Research methodology review",
          "Citation verification",
          "Scholarly editing",
          "Doctoral writing support"
        ],
        areaServed: "Worldwide"
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: APP_URL,
        name: "Scholaria",
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Service",
        "@id": `${APP_URL}/#service`,
        serviceType: "Scholarly editing and dissertation review",
        provider: { "@id": ORG_ID },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "Doctoral, Ph.D., Ed.D., and graduate-level researcher"
        },
        offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock" }
      }
    ]
  };
}

/* -------------------------------------------------------------------------- *
 * Per-page schemas — each accepts the minimum it needs and returns a graph
 * fragment ready to be JSON-stringified into a <script type="ld+json"> tag.
 * -------------------------------------------------------------------------- */

export function breadcrumb(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${APP_URL}${it.href}`
    }))
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a }
    }))
  };
}

export function howTo(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    totalTime: opts.totalTime,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text
    }))
  };
}

export function service(opts: {
  name: string;
  slug: string;
  description: string;
  serviceType: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${APP_URL}${opts.slug}#service`,
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    provider: { "@id": ORG_ID },
    url: `${APP_URL}${opts.slug}`,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "Doctoral, Ph.D., Ed.D., and graduate-level researcher"
    },
    areaServed: "Worldwide",
    additionalProperty: opts.keywords?.map((k) => ({
      "@type": "PropertyValue",
      name: "keyword",
      value: k
    }))
  };
}
