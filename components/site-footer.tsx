import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-white border-t border-ink-900/90">
      <div className="container py-16 grid grid-cols-12 gap-10">
        {/* Imprint block — set as a colophon. */}
        <div className="col-span-12 lg:col-span-5">
          <div className="font-serif text-[40px] leading-tight tracking-[-0.02em] text-ink-900">
            Dissertation Editing Center
          </div>
          <div className="mt-2 font-serif italic text-[15px] text-ink-500">
            Chapter-grade review for doctoral candidates · NYC · NJ · CT
          </div>
          <p className="mt-6 max-w-md text-[14.5px] leading-7 text-ink-700">
            A coordinated multi-agent review system for Ph.D., Ed.D., DBA, and graduate
            researchers — methodology alignment, APA 7 verification, citation cross-check, and
            submission-readiness scoring in 24 hours. We critique, edit, and guide; we never
            author your dissertation. That distinction is the platform's first principle.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[12px] text-ink-700">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-50 ring-1 ring-ink-200">
              Plans from $49/mo
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-50 ring-1 ring-ink-200">
              14-day money back
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-50 ring-1 ring-ink-200">
              FERPA-aware · AES-256
            </span>
          </div>
        </div>

        <Column className="col-span-6 md:col-span-3 lg:col-span-2" title="Platform" links={[
          ["Dissertation Intelligence", "/dissertation-intelligence"],
          ["The reviewing system", "/agent-ecosystem"],
          ["How it works", "/how-it-works"],
          ["Upload paper", "/upload"],
          ["Pricing", "/pricing"]
        ]} />
        <Column className="col-span-6 md:col-span-3 lg:col-span-2" title="Services" links={[
          ["Dissertation editing", "/dissertation-editing"],
          ["APA 7 review", "/apa-7-formatting"],
          ["Literature review", "/literature-review-editing"],
          ["Methodology", "/research-methodology-review"]
        ]} />
        <Column className="col-span-12 md:col-span-6 lg:col-span-3" title="Editorial desk" links={[
          ["About", "/about"],
          ["Reviews", "/reviews"],
          ["Enterprise & universities", "/enterprise"],
          ["Security & privacy", "/security"],
          ["Academic integrity", "/academic-integrity"],
          ["FAQ", "/faq"],
          ["Correspondence", "/contact"]
        ]} />
      </div>

      {/* Bottom colophon bar. */}
      <div className="border-t border-ink-200">
        <div className="container py-5 grid grid-cols-12 gap-6 text-[12px] text-ink-500">
          <span className="col-span-12 md:col-span-5">
            © {new Date().getFullYear()} Dissertation Editing Center · support@doctoralediting.com
          </span>
          <span className="col-span-12 md:col-span-4">
            8315 Northern Blvd, Suite 2 · Jackson Heights, NY 11372 · (407) 850-8823
          </span>
          <nav className="col-span-12 md:col-span-3 flex items-center justify-end gap-5">
            <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            <Link href="/academic-integrity" className="hover:text-ink-900">Integrity</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function Column({ title, links, className = "" }: { title: string; links: [string, string][]; className?: string }) {
  return (
    <div className={className}>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2.5 text-[14px]">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-ink-700 hover:text-ink-900">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
