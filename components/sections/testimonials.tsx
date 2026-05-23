import Image from "next/image";
import { PORTRAITS } from "@/lib/media";

const LETTERS = [
  {
    portrait: PORTRAITS.patel,
    body:
      "The feedback read like notes from a methodologist who actually sat with the chapter. The synthesis gap they flagged on page 12 was the same one my chair found three weeks later.",
    name: "M. Patel",
    role: "Doctoral candidate · Ed.D. · R1 Education program",
    place: "Atlanta"
  },
  {
    portrait: PORTRAITS.okafor,
    body:
      "I have used three editing services. This is the first one whose APA report I trusted enough to forward unedited to my committee.",
    name: "S. Okafor",
    role: "Ph.D. candidate · Public Health",
    place: "Bristol"
  },
  {
    portrait: PORTRAITS.ibarra,
    body:
      "It told me what to revise — not how to think — and the revision plan was sequenced sensibly. That distinction matters at this stage.",
    name: "R. Ibarra",
    role: "DBA candidate · Strategy",
    place: "Mexico City"
  }
];

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">VI.</span>
          <span className="label">Correspondence</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Letters from the doctoral cohort.
          </h2>
          <p className="col-span-12 lg:col-span-5 text-[15px] leading-[1.75] text-ink-700 lg:border-l lg:border-ink-200 lg:pl-8">
            Excerpts shared with permission. Identifying programs are kept general because committees and
            chairs read these pages too.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-x-10 border-t border-ink-900/90">
          {LETTERS.map((l, i) => (
            <article
              key={l.name}
              className={`col-span-12 lg:col-span-4 py-10 ${
                i > 0 ? "lg:border-l lg:border-ink-200 lg:pl-8" : ""
              }`}
            >
              {/* Portrait — rendered as a squircle, sized to match the type column. */}
              <div className="relative h-20 w-20 overflow-hidden rounded-[14px] ring-1 ring-ink-200">
                <Image
                  src={l.portrait.src}
                  alt={l.portrait.alt}
                  fill
                  sizes="80px"
                  className="object-cover grayscale-[35%]"
                />
              </div>
              <p className="mt-6 font-serif text-[18px] leading-[1.6] text-ink-900 balance">“{l.body}”</p>
              <p className="mt-6 text-[13px] text-ink-700">— {l.name}</p>
              <p className="text-[12.5px] text-ink-500 italic">{l.role}</p>
              <p className="text-[12.5px] text-ink-500">{l.place}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
