import Link from "next/link";

const TEASER = [
  ["Dissertation editing", "/dissertation-editing", "Chapter-grade review for Ph.D., Ed.D., and DBA candidates."],
  ["APA 7 review", "/apa-7-formatting", "Precision compliance against the current APA 7 specification."],
  ["Literature review", "/literature-review-editing", "Synthesis depth, thematic coherence, and gap analysis."],
  ["Methodology review", "/research-methodology-review", "Alignment across questions, design, sampling, and analysis."]
] as const;

export function ServicesTeaser() {
  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">II.</span>
          <span className="label">Services — a brief catalogue</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[52px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Four review verticals. Each with its own dedicated brief.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Every service is staffed by the agents best suited to it. Open any one for the full editorial
            brief, comparison plates, and FAQ.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
          {TEASER.map(([title, href, body], i) => (
            <li
              key={href}
              className={`col-span-12 lg:col-span-6 grid grid-cols-12 gap-4 py-8 border-b border-ink-200 ${
                i % 2 === 1 ? "lg:border-l lg:border-ink-200 lg:pl-10" : ""
              }`}
            >
              <span className="col-span-2 lg:col-span-1 font-mono tabular text-[12px] text-ink-500 pt-1">
                §{String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10 lg:col-span-11">
                <h3 className="font-serif text-[22px] leading-tight text-ink-900">
                  <Link href={href} className="hover:underline underline-offset-[6px] decoration-1">
                    {title}
                  </Link>
                </h3>
                <p className="mt-2 text-[14px] leading-[1.65] text-ink-700 max-w-prose">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-[13.5px]">
          <Link href="/services" className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2">
            View every service →
          </Link>
        </p>
      </div>
    </section>
  );
}
