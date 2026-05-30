/**
 * Service catalog — one-time purchases, not subscriptions.
 *
 * Doctoral candidates buy by milestone (Chapter 2 review, full manuscript
 * review) — not by month. Each purchase = one review credit consumed on
 * first /upload after Stripe checkout success.
 *
 * Phase 1 (trust-build): 3 entry-priced services
 * Phase 2 (+25-50% after reviews): same 3 services, repriced
 * Phase 3 (premium): full ladder up to Full Dissertation Review + add-ons
 *
 * Pricing is sourced from this file at checkout-time via Stripe's
 * price_data API — no dashboard Price IDs required.
 */

export type ProductSlug =
  | "research_paper"
  | "apa_7_review"
  | "dissertation_chapter"
  // Phase 2/3 — defined but disabled until launched
  | "graduate_paper"
  | "proposal_review"
  | "full_dissertation";

export type ProductPhase = 1 | 2 | 3;

export interface Product {
  slug: ProductSlug;
  name: string;
  audience: string;
  priceCents: number;
  positioning: string;
  highlights: string[];
  wordCap: number;
  turnaround: string;
  phase: ProductPhase;
  enabled: boolean;
  recommended?: boolean;
}

export const PRODUCTS: Product[] = [
  // ──────────────────────────────────────────────────────────────────────
  // PHASE 1 — Trust-build pricing. Live now.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "research_paper",
    name: "Research Paper Review",
    audience: "Graduate research papers, term-length writing, conference drafts",
    priceCents: 3900,
    positioning:
      "AI-driven review for a single graduate-level research paper — tone, structure, citation cross-check, and a 0–100 readiness score.",
    highlights: [
      "Annotated PDF",
      "APA 7 verification",
      "Citation cross-check",
      "Readiness score",
      "24-hour delivery"
    ],
    wordCap: 8000,
    turnaround: "24 hours",
    phase: 1,
    enabled: true
  },
  {
    slug: "apa_7_review",
    name: "APA 7 Review",
    audience: "Anyone needing a fast APA 7 formatting pass",
    priceCents: 2900,
    positioning:
      "Focused APA 7 compliance audit — headings, in-text patterns, DOI structure, hanging indents, reference list verification.",
    highlights: [
      "Heading hierarchy audit",
      "In-text citation patterns",
      "Reference list verification",
      "DOI + URL formatting",
      "Returned with corrections marked"
    ],
    wordCap: 10000,
    turnaround: "24 hours",
    phase: 1,
    enabled: true
  },
  {
    slug: "dissertation_chapter",
    name: "Dissertation Chapter Review",
    audience: "Ph.D., Ed.D., DBA candidates",
    priceCents: 9900,
    positioning:
      "Chapter-grade review with methodology alignment, framework continuity, citation verification, and revision plan — committee-ready feedback in 24 hours.",
    highlights: [
      "Annotated PDF + APA 7 report",
      "Methodology alignment scoring",
      "Citation cross-check vs. reference list",
      "Framework continuity audit",
      "Prioritized revision plan",
      "Committee-shareable audit record"
    ],
    wordCap: 25000,
    turnaround: "24 hours",
    phase: 1,
    enabled: true,
    recommended: true
  },

  // ──────────────────────────────────────────────────────────────────────
  // PHASE 2/3 — Defined but disabled. Flip `enabled: true` when ready.
  // ──────────────────────────────────────────────────────────────────────
  {
    slug: "graduate_paper",
    name: "Graduate Paper Review",
    audience: "Master's and graduate coursework",
    priceCents: 7900,
    positioning: "Mid-tier paper review for master's coursework, capstone drafts, and graduate-level analytical writing.",
    highlights: ["Annotated PDF", "APA 7 verification", "Citation cross-check", "Tone & register pass"],
    wordCap: 15000,
    turnaround: "24 hours",
    phase: 2,
    enabled: false
  },
  {
    slug: "proposal_review",
    name: "Proposal Review (Chapters 1–3)",
    audience: "Candidates preparing proposal defense",
    priceCents: 39900,
    positioning: "Full proposal review — Chapters 1, 2, 3 read together for framework continuity, methodology alignment, and defense readiness.",
    highlights: ["3-chapter cross-coherence", "Methodology alignment", "Defense readiness score", "Committee briefing memo"],
    wordCap: 60000,
    turnaround: "48–72 hours",
    phase: 2,
    enabled: false
  },
  {
    slug: "full_dissertation",
    name: "Full Dissertation Review",
    audience: "Final pre-defense polish",
    priceCents: 89900,
    positioning: "Complete dissertation review with cross-chapter coherence, methodology alignment, citation verification across the entire reference list, and a defense readiness package.",
    highlights: ["Full-manuscript coherence", "Reference list reconciliation", "Defense readiness package", "Concierge support channel"],
    wordCap: 120000,
    turnaround: "72–96 hours",
    phase: 3,
    enabled: false
  }
];

export const PRODUCTS_BY_SLUG: Record<ProductSlug, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.slug, p])
) as Record<ProductSlug, Product>;

export function enabledProducts(): Product[] {
  return PRODUCTS.filter((p) => p.enabled);
}

export function getProduct(slug: string): Product | null {
  return PRODUCTS_BY_SLUG[slug as ProductSlug] ?? null;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
