"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Script from "next/script";
import { faqPage } from "@/lib/jsonld";

export const FAQ_ITEMS = [
  {
    q: "Does Scholaria write my dissertation for me?",
    a: "No, and that is intentional. Scholaria reviews, edits, and guides scholarly writing — it does not author dissertations or assignments on a student's behalf. The platform is engineered to strengthen your work without replacing your voice."
  },
  {
    q: "Which formatting styles are supported?",
    a: "APA 7 is fully supported with a dedicated formatting engine. APA 6, MLA, and Chicago are supported for scholarly tone and clarity reviews; APA 7-specific compliance scoring is reserved for APA 7 submissions."
  },
  {
    q: "How private and secure are my uploads?",
    a: "Documents are received over an encrypted channel, stored with envelope encryption, and accessible only to the agents executing your review. Retention is plan-controlled and institution-controlled on Enterprise. Scholaria is FERPA-aware and audit-friendly."
  },
  {
    q: "Will the feedback feel like AI?",
    a: "It is engineered not to. Findings are written in a calm, scholarly, executive register, reference verbatim excerpts from your manuscript, and are filtered against AI-detection patterns before delivery. If the QA agent finds a generic or template-driven response, it is rejected and regenerated."
  },
  {
    q: "How fast does a review come back?",
    a: "Standard turnaround is 24–48 hours. Doctoral plans run on a 12–24 hour priority queue. Dissertation Intensive runs on a 6–12 hour rush queue with dedicated capacity."
  },
  {
    q: "Can my university deploy Scholaria for a cohort?",
    a: "Yes — the Enterprise tier supports SSO, SCIM, FERPA-aware controls, program-level analytics, and branded deliverables. Contact the enterprise team to discuss a pilot."
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
