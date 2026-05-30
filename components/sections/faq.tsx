"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Script from "next/script";
import { faqPage } from "@/lib/jsonld";

export const FAQ_ITEMS = [
  {
    q: "How much does it cost?",
    a: "Plans start at $49/month for Graduate, $129/month for Doctoral (most chosen by Ph.D. and Ed.D. candidates), and $299/month for Dissertation Intensive. All plans include a 14-day money-back guarantee and you can cancel anytime. To see exactly what you would receive before subscribing, view the public sample annotated review at /sample-review."
  },
  {
    q: "What is your refund policy?",
    a: "Every paid plan includes a 14-day money-back guarantee. If your first APA report and annotated review do not meet committee-grade quality, write to support@doctoralediting.com within 14 days of your first paid charge and we refund in full, no questions asked. Cancel anytime from your dashboard."
  },
  {
    q: "Can I see a sample annotated review before I upload?",
    a: "Yes. /sample-review shows five real findings from a redacted Ed.D. Chapter 2 review with the full annotated PDF available for download. No email required."
  },
  {
    q: "Do you write my dissertation for me?",
    a: "No, and that is intentional. We review, edit, and guide scholarly writing — we do not author dissertations or assignments on a candidate's behalf. The system is engineered to strengthen your work without replacing your voice. That is the platform's first principle."
  },
  {
    q: "How is this different from ChatGPT, Grammarly, or Paperpal?",
    a: "Grammarly fixes line-level grammar; we review chapter-level structure, methodology, and citations. ChatGPT can paraphrase but cannot show your chair a defensible audit log; we produce one with every review. Paperpal optimizes for journal submission; we optimize for the dissertation chapter and committee defense. See /vs-grammarly, /vs-chatgpt, /vs-paperpal, /vs-editage for side-by-side comparisons."
  },
  {
    q: "Will the feedback feel like AI?",
    a: "It is engineered not to. Findings are written in a calm, scholarly, executive register, reference verbatim excerpts from your manuscript, and are filtered by a QA agent before delivery. Anything that reads as generic or template-driven is rejected and regenerated."
  },
  {
    q: "Which formatting styles are supported?",
    a: "APA 7 is fully supported with a dedicated formatting engine. APA 6, MLA, and Chicago are supported for scholarly tone and clarity reviews; APA 7-specific compliance scoring is reserved for APA 7 submissions."
  },
  {
    q: "How fast does a review come back?",
    a: "Standard turnaround is 24 hours. Doctoral plans run on a 12–24 hour priority queue. Dissertation Intensive runs on a 6–12 hour rush queue with dedicated capacity."
  },
  {
    q: "How private and secure are my uploads?",
    a: "Documents are received over TLS 1.3, stored with AES-256 envelope encryption in single-tenant US-region Postgres, and accessible only to the reviewing agents. We do not send your manuscript to any third-party AI provider for training. Retention is plan-controlled (7 days on Free, 12 months on Graduate, candidate-controlled on Doctoral+). Hard-delete on demand. See /security for plain-language detail."
  },
  {
    q: "Do I need an account to upload?",
    a: "Yes — uploading requires an account and an active subscription. You can view a public sample annotated review at /sample-review without an account or credit card to see exactly what we deliver before subscribing."
  },
  {
    q: "Can my university deploy this for a cohort?",
    a: "Yes — the Enterprise tier supports SSO, SCIM, FERPA-aware controls, program-level analytics, and branded deliverables. SOC 2 Type II is in progress (target Q4 2026). Book a 20-minute demo at /enterprise."
  }
];

export function FAQ() {
  return (
    <section className="section">
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage(FAQ_ITEMS)) }}
      />
      <div className="container">
        <header className="chapter">
          <span className="roman">VIII.</span>
          <span className="label">Frequently raised at intake</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Answers, written like a registrar would write them.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Everything below is on the page — no progressive disclosure on desktop. Doctoral users have
            done enough hunting for the day.
          </p>
        </div>

        {/* Desktop: editorial two-column list, fully expanded. */}
        <dl className="mt-14 hidden lg:grid grid-cols-2 gap-x-12 gap-y-10 border-t border-ink-900/90 pt-10">
          {FAQ_ITEMS.map((it) => (
            <div key={it.q}>
              <dt className="font-serif text-[20px] leading-snug text-ink-900">{it.q}</dt>
              <dd className="mt-2 text-[14.5px] leading-[1.7] text-ink-700 max-w-prose">{it.a}</dd>
            </div>
          ))}
        </dl>

        {/* Mobile: collapsible to preserve vertical real estate. */}
        <div className="mt-10 lg:hidden divide-y divide-ink-200 border-y border-ink-200">
          {FAQ_ITEMS.map((it, i) => <MobileItem key={it.q} item={it} defaultOpen={i === 0} />)}
        </div>
      </div>
    </section>
  );
}

function MobileItem({ item, defaultOpen }: { item: { q: string; a: string }; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-5">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-serif text-[18px] text-ink-900">{item.q}</span>
        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      {open && <p className="mt-3 text-[14.5px] leading-7 text-ink-600">{item.a}</p>}
    </div>
  );
}
