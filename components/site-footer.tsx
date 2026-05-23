import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-white border-t border-ink-900/90">
      <div className="container py-16 grid grid-cols-12 gap-10">
        {/* Imprint block — set as a colophon. */}
        <div className="col-span-12 lg:col-span-5">
          <div className="font-serif text-[44px] leading-none tracking-[-0.02em] text-ink-900">
            Scholaria
          </div>
          <div className="mt-2 font-serif italic text-[16px] text-ink-500">
            a review of doctoral writing
          </div>
          <p className="mt-6 max-w-md text-[14.5px] leading-7 text-ink-700">
            An autonomous AI review and scholarly editing platform for Ph.D., Ed.D., doctoral, and graduate
            researchers. Scholaria critiques, edits, and guides scholarly writing — it does not author
            dissertations on a student's behalf.
          </p>
          <p className="mt-8 text-[12px] uppercase tracking-[0.3em] text-ink-500">
            Est. mmxxvi · Issued continuously · Open to scholars
          </p>
        </div>

        <Column className="col-span-6 md:col-span-3 lg:col-span-2" title="Sections" links={[
          ["I. Ecosystem", "/how-it-works"],
          ["II. Workflow", "/how-it-works"],
          ["III. Examined", "/services"],
          ["IV. Excerpts", "/dissertation-editing"],
          ["V. Rates", "/pricing"]
        ]} />
        <Column className="col-span-6 md:col-span-3 lg:col-span-2" title="Services" links={[
          ["Dissertation editing", "/dissertation-editing"],
          ["APA 7 review", "/apa-7-formatting"],
          ["Literature review", "/literature-review-editing"],
          ["Methodology", "/research-methodology-review"]
        ]} />
        <Column className="col-span-12 md:col-span-6 lg:col-span-3" title="Editorial desk" links={[
          ["About", "/about"],
          ["Enterprise & universities", "/enterprise"],
          ["Correspondence", "/contact"],
          ["FAQ", "/faq"],
          ["Submit a manuscript", "/upload"]
        ]} />
      </div>

      {/* Bottom colophon bar. */}
      <div className="border-t border-ink-200">
        <div className="container py-5 grid grid-cols-12 gap-6 text-[12px] text-ink-500">
          <span className="col-span-12 md:col-span-5">
            © {new Date().getFullYear()} Scholaria · Built for serious scholarship.
          </span>
          <span className="col-span-12 md:col-span-4 italic">
            Set in Newsreader, Inter, &amp; JetBrains Mono. Composed in the editorial register.
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
