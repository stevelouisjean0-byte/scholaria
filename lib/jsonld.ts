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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dissertationeditingcenter.com";
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
        name: "Dissertation Editing Center",
        alternateName: ["Scholaria", "Scholaria — A Review of Doctoral Writing"],
        url: APP_URL,
        logo: `${APP_URL}/logo.png`,
        sameAs: [
          "https://www.linkedin.com/company/dissertation-editing-center",
          "https://twitter.com/dissedit_center"
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "New York",
          addressRegion: "NY",
          addressCountry: "US"
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "concierge@dissertationeditingcenter.com",
            areaServed: ["US", "GB", "CA", "AU", "EU"],
            availableLanguage: ["en"],
            hoursAvailable: "Mo-Fr 09:00-19:00, Sa 10:00-16:00 America/New_York"
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "enterprise@dissertationeditingcenter.com",
            areaServed: ["US", "GB", "CA", "AU", "EU"],
            availableLanguage: ["en"]
          },
          {
            "@type": "ContactPoint",
            contactType: "privacy",
            email: "privacy@dissertationeditingcenter.com",
            availableLanguage: ["en"]
          }
        ],
        description:
          "Agentic AI operating system for doctoral research. A coordinated ecosystem of Agentic AI Agents that validate scholarly workflows, perform intelligent multi-step verification, and reduce human error across dissertation review, literature synthesis, methodology alignment, and citation integrity.",
        knowsAbout: [
          "Agentic AI Agents",
          "Autonomous academic assistance",
          "Research-grade workflow automation",
          "Dissertation validation",
          "APA 7 verification",
          "Literature review analysis",
          "Research methodology alignment",
          "Citation verification",
          "Precision-driven AI systems",
          "Doctoral writing support"
        ],
        areaServed: "Worldwide"
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: APP_URL,
        name: "Dissertation Editing Center",
        alternateName: "Scholaria",
        publisher: { "@id": ORG_ID },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };
}

/* -------------------------------------------------------------------------- *
 * Service / Offer schema — emitted only on commercial pages (/, /pricing,
 * /dissertation-editing, /literature-review-editing, etc.), NOT site-wide.
 * Google's structured-data guidance treats Service+Offer on /signin or
 * /contact as misleading.
 * -------------------------------------------------------------------------- */
export function dissertationService() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${APP_URL}/#service`,
    name: "Dissertation Editing Center — chapter-grade dissertation review",
    serviceType:
      "Multi-agent dissertation review, methodology alignment, APA 7 verification, and citation cross-check",
    provider: { "@id": ORG_ID },
    url: APP_URL,
    areaServed: ["United States", "United Kingdom", "Canada", "Australia", "European Union"],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "Doctoral, Ph.D., Ed.D., DBA, and graduate-level researcher"
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      highPrice: "299",
      offerCount: 4,
      availability: "https://schema.org/InStock"
    }
  };
}

/* -------------------------------------------------------------------------- *
 * Per-tier Offer/Subscription schema for /pricing. Adds rich-result eligibility
 * the audit specifically flagged as missing.
 * -------------------------------------------------------------------------- */
export function pricingOffers(tiers: {
  id: string;
  name: string;
  description: string;
  priceMonthly: number | null;
  audience: string;
}[]) {
  return {
    "@context": "https://schema.org",
    "@graph": tiers
      .filter((t) => t.priceMonthly !== null)
      .map((t) => ({
        "@type": "Product",
        "@id": `${APP_URL}/pricing#${t.id}`,
        name: t.name,
        description: t.description,
        brand: { "@id": ORG_ID },
        category: "Dissertation editing subscription",
        offers: {
          "@type": "Offer",
          url: `${APP_URL}/pricing`,
          priceCurrency: "USD",
          price: t.priceMonthly === 0 ? "0" : String(t.priceMonthly),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: t.priceMonthly === 0 ? "0" : String(t.priceMonthly),
            priceCurrency: "USD",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
            billingDuration: "P1M"
          },
          availability: "https://schema.org/InStock",
          eligibleCustomerType: t.audience
        }
      }))
  };
}

/* -------------------------------------------------------------------------- *
 * Review + AggregateRating schema for /reviews.
 * -------------------------------------------------------------------------- */
export function reviewsAggregate(testimonials: {
  authorName: string;
  authorRole: string;
  institution: string;
  body: string;
  rating?: number;
}[]) {
  const ratings = testimonials.map((t) => t.rating ?? 5);
  const avg = ratings.reduce((a, b) => a + b, 0) / Math.max(1, ratings.length);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(2),
      ratingCount: testimonials.length,
      bestRating: 5,
      worstRating: 1
    },
    review: testimonials.slice(0, 10).map((t) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating ?? 5,
        bestRating: 5,
        worstRating: 1
      },
      author: {
        "@type": "Person",
        name: t.authorName,
        jobTitle: t.authorRole,
        affiliation: { "@type": "EducationalOrganization", name: t.institution }
      },
      reviewBody: t.body
    }))
  };
}

/* -------------------------------------------------------------------------- *
 * LocalBusiness schema for location pages (/nyc, /new-jersey, /connecticut).
 * -------------------------------------------------------------------------- */
export function localBusiness(opts: {
  region: string;
  city: string;
  state: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${APP_URL}${opts.slug}#localbusiness`,
    name: `Dissertation Editing Center — ${opts.region}`,
    parentOrganization: { "@id": ORG_ID },
    url: `${APP_URL}${opts.slug}`,
    areaServed: {
      "@type": "AdministrativeArea",
      name: opts.region
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: opts.city,
      addressRegion: opts.state,
      addressCountry: "US"
    },
    serviceType:
      "Dissertation editing, APA 7 verification, methodology review, literature review editing",
    priceRange: "$0–$299/mo"
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
