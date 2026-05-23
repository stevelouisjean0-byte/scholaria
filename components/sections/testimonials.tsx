import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { TESTIMONIALS, TESTIMONIAL_DISCLOSURE } from "@/lib/testimonials";

interface TestimonialsProps {
  /** Restrict to a subset by highlight category (e.g. tone, apa, methodology). */
  filter?: string[];
  /** Maximum cards to show. Defaults to 3 for homepage; pass undefined for full reviews page. */
  limit?: number;
  /** Heading override per surface. */
  heading?: string;
  /** Eyebrow override per surface. */
  eyebrow?: string;
  /** Background tone — default is paper. */
  tone?: "paper" | "white";
}

export function Testimonials({
  filter,
  limit = 3,
  heading = "Voices from the doctoral cohort.",
  eyebrow = "Correspondence",
  tone = "paper"
}: TestimonialsProps) {
  const items = TESTIMONIALS
    .filter((t) => !filter || filter.includes(t.highlight))
    .slice(0, limit);

  return (
    <section className={`section ${tone === "paper" ? "bg-paper" : "bg-white"}`}>
      <div className="container">
        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <div className="col-span-12 lg:col-span-7">
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="mt-4 h-display text-display-lg">{heading}</h2>
          </div>
          <p className="col-span-12 lg:col-span-5 text-[14.5px] leading-[1.7] text-ink-600 lg:pl-8 lg:border-l lg:border-ink-200">
            Feedback from candidates at R1 doctoral institutions and well-known graduate programmes.
            Names are anonymised; institutional affiliations are listed with permission.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-4">
          {items.map((t) => (
            <article key={t.id} className="col-span-12 md:col-span-6 lg:col-span-4 card-quiet p-7 flex flex-col">
              <div className="flex items-center gap-3">
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
                <div className="min-w-0">
                  <div className="text-[14px] text-ink-900 font-medium">{t.initials}</div>
                  <div className="text-[11.5px] text-ink-500 italic truncate">{t.program}</div>
                </div>
              </div>

              <blockquote className="mt-5 font-serif text-[16.5px] leading-[1.55] text-ink-900 flex-1 balance">
                “{t.quote}”
              </blockquote>

              <div className="mt-6 pt-5 border-t border-ink-100 text-[12.5px]">
                <div className="text-ink-900 font-medium">{t.institution}</div>
                <div className="text-ink-500">{t.city}</div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-[12px] text-ink-500 italic max-w-3xl">
          {TESTIMONIAL_DISCLOSURE}
        </p>
      </div>
    </section>
  );
}
