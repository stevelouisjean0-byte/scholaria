import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-paper min-h-[70vh]">
      <div className="container py-28 grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-7">
          <div className="eyebrow">404 · page not found</div>
          <h1 className="mt-3 font-serif text-display-xl text-ink-900 balance">
            The reference exists in the citation, but not in this list.
          </h1>
          <p className="mt-5 max-w-prose text-[15.5px] leading-7 text-ink-600">
            This page either moved, was renamed, or never made it past the QA agent. Below are the routes
            most students were trying to reach when they landed here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">Return home</Link>
            <Link href="/upload" className="btn-secondary">Upload your paper</Link>
            <Link href="/dashboard" className="btn-ghost">Open dashboard</Link>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="eyebrow-serif">Most likely intended</div>
          <ul className="mt-4 divide-y divide-ink-200 border-y border-ink-200">
            {[
              ["Dissertation editing", "/dissertation-editing"],
              ["APA 7 review", "/apa-7-formatting"],
              ["Literature review", "/literature-review-editing"],
              ["Research methodology review", "/research-methodology-review"],
              ["Pricing", "/pricing"],
              ["Contact concierge", "/contact"]
            ].map(([label, href]) => (
              <li key={href} className="py-3">
                <Link href={href} className="flex items-center justify-between text-[14.5px] text-ink-800 hover:text-ink-950">
                  <span>{label}</span>
                  <span aria-hidden className="text-ink-400">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
