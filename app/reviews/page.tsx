import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { TESTIMONIALS, TESTIMONIAL_DISCLOSURE } from "@/lib/testimonials";
import { PAGE_HEROES } from "@/lib/media";
import { reviewsAggregate } from "@/lib/jsonld";
import { GraduationCap, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Reviews — voices from the doctoral cohort",
  description:
    "Feedback from doctoral candidates at R1 institutions and well-known graduate programs. NYC, NJ, CT cohort.",
  alternates: { canonical: "/reviews" }
};

/**
 * Collect testimonials grouped by institution to surface the names twice
 * — once in the card, once in a "represented institutions" summary list.
 */
function groupByInstitution() {
  const map = new Map<string, number>();
  for (const t of TESTIMONIALS) map.set(t.institution, (map.get(t.institution) ?? 0) + 1);
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

const HIGHLIGHT_LABEL: Record<string, string> = {
  synthesis: "Synthesis & literature review",
  apa: "APA 7 & citations",
  methodology: "Methodology alignment",
  tone: "Tone & register",
  readiness: "Submission readiness",
  support: "Capstone & turnaround"
};

export default function ReviewsPage() {
  const institutions = groupByInstitution();
  const reviewsJsonLd = reviewsAggregate(
    TESTIMONIALS.map((t) => ({
      authorName: t.initials,
      authorRole: t.program,
      institution: t.institution,
      body: t.quote,
      rating: 5
    }))
  );

  return (
    <>
      <Script id="ld-reviews-aggregate" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <PageMasthead
        number="VI"
        eyebrow="Reviews · correspondence"
        title="Voices from the doctoral cohort."
        dek="Feedback from candidates at R1 doctoral institutions and well-known graduate programmes. Anonymised by initials; institutional affiliations listed with permission."
        photo={PAGE_HEROES.about}
      />

      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            <span className="eyebrow">Represented programmes</span>
            <h2 className="mt-4 h-display text-display-lg">
              Where the cohort writes.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.7] text-ink-600">
              The institutions below are represented in the feedback on this page. Many are R1 doctoral
              universities; others are well-known professional doctoral and capstone programmes.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-12 gap-3">
            {institutions.map(([name, count]) => (
              <li
                key={name}
                className="col-span-12 md:col-span-6 lg:col-span-4 card-quiet p-5 flex items-start gap-3"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 ring-1 ring-ink-200 text-ink-700 shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] text-ink-900 font-medium leading-tight">{name}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">
                    {count} testimonial{count > 1 ? "s" : ""} on this page
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container">
          <div className="max-w-3xl">
            <span className="eyebrow">Voices · 10 letters</span>
            <h2 className="mt-4 h-display text-display-lg">
              Letters from candidates, in their own words.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-12 gap-4">
            {TESTIMONIALS.map((t) => (
              <article
                key={t.id}
                className="col-span-12 md:col-span-6 lg:col-span-4 card-quiet p-7 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  {t.portrait ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-[12px] ring-1 ring-ink-200 shrink-0">
                      <Image
                        src={t.portrait.src}
                        alt={t.portrait.alt}
                        fill
                        sizes="48px"
                        className="object-cover grayscale-[35%]"
                      />
                    </div>
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-ink-50 ring-1 ring-ink-200 text-ink-700 shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[14px] text-ink-900 font-medium">{t.initials}</span>
                      <span className="pill-accent whitespace-nowrap">{HIGHLIGHT_LABEL[t.highlight] ?? t.highlight}</span>
                    </div>
                    <div className="text-[11.5px] text-ink-500 italic mt-0.5">{t.program}</div>
                  </div>
                </div>

                <blockquote className="mt-5 font-serif text-[17px] leading-[1.55] text-ink-900 flex-1 balance">
                  “{t.quote}”
                </blockquote>

                <div className="mt-6 pt-5 border-t border-ink-100 text-[12.5px]">
                  <div className="text-ink-900 font-medium">{t.institution}</div>
                  <div className="text-ink-500">{t.city}</div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 text-[12px] text-ink-500 italic max-w-3xl">
            {TESTIMONIAL_DISCLOSURE}
          </p>
        </div>
      </section>

      {/* Closing conversion section directly after high-conviction quotes. */}
      <section className="bg-ink-900 text-white">
        <div className="container py-16 max-w-3xl text-center">
          <h2 className="font-serif text-[32px] lg:text-[40px] leading-tight text-white balance">
            See exactly what you'd receive — then subscribe.
          </h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Plans from $49/mo · 24-hour turnaround · 14-day money-back. View the public sample
            annotated review before subscribing.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sample-review"
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-white text-ink-900 text-[14px] font-medium hover:bg-ink-100 transition"
            >
              See a sample review
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full ring-1 ring-white/30 text-white text-[14px] font-medium hover:bg-white/10 transition"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
