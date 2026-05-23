import Link from "next/link";
import Script from "next/script";
import type { Photo } from "@/lib/media";
import { PageMasthead } from "@/components/page-masthead";

export interface SeoPageProps {
  number: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  photo: Photo;
  intro: string[];
  pillars: { title: string; body: string }[];
  comparison: { left: string; right: string }[];
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref?: string;
  ctaLabel?: string;
  jsonLd?: Record<string, unknown>;
}

export function SeoPage(p: SeoPageProps) {
  return (
    <>
      {p.jsonLd && (
        <Script
          id="seo-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(p.jsonLd) }}
        />
      )}

      <PageMasthead
        number={p.number}
        eyebrow={p.eyebrow}
        title={p.heading}
        dek={p.subheading}
        photo={p.photo}
        ctas={[
          { label: p.ctaLabel ?? "Submit a manuscript", href: p.ctaHref ?? "/upload", primary: true },
          { label: "Read the editorial process", href: "/how-it-works" }
        ]}
      />

      <section className="section">
        <div className="container grid grid-cols-12 gap-10">
          <article className="col-span-12 lg:col-span-7 space-y-5 text-[15.5px] leading-[1.75] text-ink-800">
            {p.intro.map((para, i) =>
              i === 0 ? (
                <p key={i} className="dropcap">{para}</p>
              ) : (
                <p key={i}>{para}</p>
              )
            )}
          </article>
          <aside className="col-span-12 lg:col-span-5 lg:border-l lg:border-ink-200 lg:pl-10">
            <div className="eyebrow">Inside this service</div>
            <ol className="mt-4 space-y-3 text-[14px] text-ink-700">
              {p.pillars.map((pillar, i) => (
                <li key={pillar.title} className="grid grid-cols-12 gap-3">
                  <span className="col-span-1 font-mono tabular text-[11.5px] text-ink-500 pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-11 text-ink-800">{pillar.title}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container">
          <header className="chapter">
            <span className="roman">II.</span>
            <span className="label">What the service contains</span>
          </header>
          <ol className="grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
            {p.pillars.map((pillar, i) => (
              <li
                key={pillar.title}
                className={`col-span-12 lg:col-span-6 grid grid-cols-12 gap-4 py-8 border-b border-ink-200 ${
                  i % 2 === 1 ? "lg:border-l lg:border-ink-200 lg:pl-10" : ""
                }`}
              >
                <span className="col-span-2 lg:col-span-1 font-mono tabular text-[12px] text-ink-500 pt-1">
                  §{String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-10 lg:col-span-11">
                  <h3 className="font-serif text-[22px] leading-tight text-ink-900">{pillar.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-700 max-w-prose">{pillar.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-5xl">
          <header className="chapter">
            <span className="roman">III.</span>
            <span className="label">What changes after a Scholaria review</span>
          </header>
          <div className="grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
            {p.comparison.map(({ left, right }, i) => (
              <div key={i} className="col-span-12 lg:col-span-6 py-8 border-b border-ink-200">
                <div className="text-[11px] uppercase tracking-[0.28em] text-ink-500">Before</div>
                <p className="mt-2 font-serif text-[19px] leading-snug text-ink-900 balance">{left}</p>
                <div className="my-5 h-px bg-ink-200" />
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-700">After</div>
                <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-700">{right}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container">
          <header className="chapter">
            <span className="roman">IV.</span>
            <span className="label">Questions students ask before uploading</span>
          </header>
          <dl className="grid grid-cols-12 gap-x-10 gap-y-8 border-t border-ink-900/90 pt-10">
            {p.faq.map((it) => (
              <div key={it.q} className="col-span-12 lg:col-span-6">
                <dt className="font-serif text-[19px] leading-snug text-ink-900">{it.q}</dt>
                <dd className="mt-2 text-[14.5px] leading-[1.7] text-ink-700 max-w-prose">{it.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-3xl text-center">
          <h2 className="font-serif text-[40px] lg:text-[52px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            {p.ctaTitle}
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.75] text-ink-700">{p.ctaBody}</p>
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link
              href={p.ctaHref ?? "/upload"}
              className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2 text-[15.5px]"
            >
              {p.ctaLabel ?? "Submit a manuscript"} →
            </Link>
            <Link href="/pricing" className="text-ink-700 hover:text-ink-900 text-[15.5px]">
              View rates &amp; access →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
