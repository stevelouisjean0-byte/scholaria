import Link from "next/link";

const ENTRIES: { roman: string; title: string; href: string; line: string }[] = [
  {
    roman: "I.",
    title: "How it works",
    href: "/how-it-works",
    line: "The autonomous review pipeline, agent by agent — intake, scoping, review, QA, delivery."
  },
  {
    roman: "II.",
    title: "Services",
    href: "/services",
    line: "Six review verticals: dissertation editing, APA 7, literature review, methodology, citation, scholarly editing."
  },
  {
    roman: "III.",
    title: "Dissertation editing",
    href: "/dissertation-editing",
    line: "Chapter-grade editing for Ph.D., Ed.D., and DBA candidates."
  },
  {
    roman: "IV.",
    title: "APA 7 review",
    href: "/apa-7-formatting",
    line: "Precision compliance against the current APA 7 specification."
  },
  {
    roman: "V.",
    title: "Literature review",
    href: "/literature-review-editing",
    line: "Synthesis depth, thematic coherence, gap analysis."
  },
  {
    roman: "VI.",
    title: "Methodology review",
    href: "/research-methodology-review",
    line: "Questions, framework, sampling, design, analysis — examined for alignment."
  },
  {
    roman: "VII.",
    title: "Rates & access",
    href: "/pricing",
    line: "Plans for graduate, doctoral, dissertation-intensive, and institutional use."
  },
  {
    roman: "VIII.",
    title: "Enterprise & universities",
    href: "/enterprise",
    line: "Cohort-wide deployment with SSO, FERPA controls, and programme analytics."
  },
  {
    roman: "IX.",
    title: "About the desk",
    href: "/about",
    line: "What Scholaria is, what it is not, and the principles that govern its outputs."
  },
  {
    roman: "X.",
    title: "Correspondence",
    href: "/contact",
    line: "Reach the concierge, the enterprise team, or the press desk."
  },
  {
    roman: "XI.",
    title: "Frequently raised",
    href: "/faq",
    line: "Privacy, formatting, turnaround, academic integrity."
  },
  {
    roman: "XII.",
    title: "Submit a manuscript",
    href: "/upload",
    line: "Send a chapter or full manuscript in PDF or DOCX."
  }
];

export function TableOfContents() {
  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">★</span>
          <span className="label">In this issue · Table of contents</span>
        </header>

        <h2 className="font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance max-w-3xl">
          The rest of the platform lives across the pages below.
        </h2>

        <ol className="mt-12 grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
          {ENTRIES.map((e, i) => (
            <li
              key={e.href}
              className={`col-span-12 lg:col-span-6 grid grid-cols-12 gap-4 py-7 border-b border-ink-200 ${
                i % 2 === 1 ? "lg:border-l lg:border-ink-200 lg:pl-10" : ""
              }`}
            >
              <span className="col-span-2 lg:col-span-1 font-serif text-[16px] text-ink-500 pt-1 tabular">
                {e.roman}
              </span>
              <div className="col-span-10 lg:col-span-11">
                <h3 className="font-serif text-[22px] leading-tight">
                  <Link
                    href={e.href}
                    className="text-ink-900 hover:underline underline-offset-[6px] decoration-1"
                  >
                    {e.title}
                  </Link>
                </h3>
                <p className="mt-1.5 text-[14px] leading-[1.65] text-ink-700 max-w-prose">{e.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
