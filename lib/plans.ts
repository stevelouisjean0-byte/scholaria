export type PlanId = "graduate" | "doctoral" | "dissertation" | "university";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  audience: string;
  positioning: string;
  uploadLimit: string;
  storage: string;
  turnaround: string;
  agentAccess: string[];
  highlights: string[];
  cta: { label: string; href: string };
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "graduate",
    name: "Graduate",
    priceMonthly: 49,
    priceAnnual: 39,
    audience: "Master's and graduate coursework",
    positioning: "Scholarly editing for graduate papers, term-length writing, and conference drafts.",
    uploadLimit: "5 manuscripts / month · up to 12,000 words each",
    storage: "12-month retention",
    turnaround: "24–48 hour standard",
    agentAccess: ["Lead Intake", "Project Scoping", "Professional Editor", "Research Support", "QA"],
    highlights: ["Full annotated PDF", "APA 7 report", "Side-by-side review"],
    cta: { label: "Start Graduate plan", href: "/upload?plan=graduate" }
  },
  {
    id: "doctoral",
    name: "Doctoral",
    priceMonthly: 129,
    priceAnnual: 99,
    audience: "Ph.D. and Ed.D. candidates",
    positioning: "Chapter-level review with methodology, synthesis, and citation verification built in.",
    uploadLimit: "12 manuscripts / month · up to 25,000 words each",
    storage: "Unlimited retention",
    turnaround: "Priority queue · 12–24 hours",
    agentAccess: ["All review agents", "Citation verification", "Methodology review"],
    highlights: ["Methodology alignment report", "Citation cross-check", "Revision history & versioning"],
    cta: { label: "Start Doctoral plan", href: "/upload?plan=doctoral" },
    recommended: true
  },
  {
    id: "dissertation",
    name: "Dissertation Intensive",
    priceMonthly: 299,
    priceAnnual: 249,
    audience: "Active dissertation writers",
    positioning: "Full-dissertation orchestration, with multi-chapter coherence and a dedicated review track.",
    uploadLimit: "Unlimited manuscripts · up to 80,000 words each",
    storage: "Unlimited retention · committee-shareable exports",
    turnaround: "Rush queue · 6–12 hours",
    agentAccess: ["Every reviewing agent", "Cross-chapter coherence", "Defense readiness scoring"],
    highlights: [
      "Multi-chapter coherence analysis",
      "Concierge support channel",
      "Defense readiness package"
    ],
    cta: { label: "Start Dissertation plan", href: "/upload?plan=dissertation" }
  },
  {
    id: "university",
    name: "University Enterprise",
    priceMonthly: null,
    priceAnnual: null,
    audience: "Universities, writing centers, programs",
    positioning: "Institution-wide deployment with SSO, FERPA-aware controls, and program-level analytics.",
    uploadLimit: "Institution-wide seats",
    storage: "Institution-controlled retention",
    turnaround: "Priority pool · SLAs available",
    agentAccess: ["Every agent", "Program-level configuration", "Branded reports"],
    highlights: ["SSO & SCIM", "FERPA controls", "Program analytics", "Branded deliverables"],
    cta: { label: "Talk to enterprise", href: "/enterprise" }
  }
];
