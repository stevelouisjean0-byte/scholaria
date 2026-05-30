import Link from "next/link";
import { GraduationCap, MapPin, ArrowUpRight } from "lucide-react";

export interface LocationPageProps {
  region: string; // "New York City"
  state: string; // "NY"
  shortName: string; // "NYC"
  intro: string;
  institutions: { name: string; type: string; programs: string[] }[];
  testimonial?: { quote: string; author: string; institution: string };
}

export function LocationPageBody(props: LocationPageProps) {
  return (
    <>
      <section className="section">
        <div className="container max-w-3xl">
          <div className="eyebrow flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {props.region}
          </div>
          <h1 className="mt-4 h-display text-display-lg">
            Dissertation editing for {props.region} doctoral candidates.
          </h1>
          <p className="mt-5 text-[16px] leading-[1.7] text-ink-700">{props.intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload" className="btn-primary">
              Upload a chapter — free
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/sample-review" className="btn-secondary">
              See a sample review
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container max-w-4xl">
          <div className="eyebrow">{props.region} doctoral programs we work with</div>
          <h2 className="mt-3 font-serif text-[32px] lg:text-[40px] leading-tight text-ink-900 balance">
            Candidates from {props.shortName}-region R1 universities review with us daily.
          </h2>

          <div className="mt-10 grid grid-cols-12 gap-3">
            {props.institutions.map((i) => (
              <div key={i.name} className="col-span-12 md:col-span-6 card-quiet p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white shrink-0">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-serif text-[18px] text-ink-900">{i.name}</h3>
                    <div className="text-[11.5px] uppercase tracking-[0.18em] text-ink-500 mt-0.5">{i.type}</div>
                  </div>
                </div>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {i.programs.map((p) => (
                    <li key={p} className="text-[11.5px] text-ink-700 bg-ink-50 ring-1 ring-ink-200 rounded-full px-2 py-0.5">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[12.5px] italic text-ink-500">
            We do not claim institutional partnership with the universities listed; we work with
            individual candidates and programs on a per-engagement basis. For institutional pilot
            inquiries, please contact{" "}
            <a href="mailto:support@doctoralediting.com" className="underline underline-offset-4">
              support@doctoralediting.com
            </a>.
          </p>
        </div>
      </section>

      {props.testimonial && (
        <section className="section">
          <div className="container max-w-3xl">
            <div className="eyebrow">From a {props.shortName}-region candidate</div>
            <blockquote className="mt-6 font-serif italic text-[24px] lg:text-[30px] leading-[1.45] text-ink-900 balance">
              "{props.testimonial.quote}"
            </blockquote>
            <p className="mt-5 text-[14px] text-ink-700">
              {props.testimonial.author}, {props.testimonial.institution}
            </p>
          </div>
        </section>
      )}

      <section className="bg-ink-900 text-white">
        <div className="container py-16 max-w-3xl text-center">
          <h2 className="font-serif text-[32px] lg:text-[40px] leading-tight text-white balance">
            Free first review for every {props.region} doctoral candidate.
          </h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            No credit card. 24-hour turnaround. We'll email you the annotated PDF, APA report,
            and revision plan.
          </p>
          <div className="mt-7">
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-white text-ink-900 text-[14px] font-medium hover:bg-ink-100 transition"
            >
              Upload your chapter
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
