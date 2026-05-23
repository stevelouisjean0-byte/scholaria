import Link from "next/link";
import Image from "next/image";
import { HERO_FIGURE } from "@/lib/media";

export function Hero() {
  return (
    <section className="bg-white">
      <div className="container pt-10 pb-16 lg:pt-14 lg:pb-20">
        {/* Imprint line. */}
        <div className="grid grid-cols-12 items-baseline gap-6 text-[11.5px] uppercase tracking-[0.28em] text-ink-500">
          <span className="col-span-6">Established for the doctoral cohort</span>
          <span className="col-span-6 text-right">Issue I · An autonomous review</span>
        </div>

        <hr className="journal-rule mt-3" />

        {/* Headline + dek. The headline carries weight; the dek carries
            substance. No forced line breaks — the type sets itself. */}
        <div className="mt-10 lg:mt-12 max-w-5xl">
          <h1 className="font-serif text-ink-900 leading-[1.02] tracking-[-0.03em] text-[clamp(2.25rem,4.8vw,4.5rem)] balance">
            A scholarly review of doctoral writing.
          </h1>
          <p className="mt-5 font-serif italic text-[clamp(1.05rem,1.6vw,1.4rem)] leading-[1.45] text-ink-600 max-w-3xl balance">
            Enterprise dissertation review and scholarly editing for Ph.D., Ed.D., and graduate researchers
            — run by a coordinated ecosystem of autonomous review agents.
          </p>
        </div>

        <hr className="border-t border-ink-200 mt-10" />

        {/* Two-column foot: abstract on the left, two primary links on the right. */}
        <div className="mt-10 grid grid-cols-12 gap-x-10 gap-y-6">
          <p className="col-span-12 lg:col-span-8 text-[16.5px] leading-[1.7] text-ink-800 max-w-[44rem]">
            Scholaria reviews dissertations, literature reviews, capstones, and graduate research papers with
            the precision of a senior committee member and the patience of an editorial desk that never
            closes. The platform critiques, edits, and guides scholarly writing — it does not author
            dissertations on the student's behalf, and that distinction is its first principle.
          </p>
          <div className="col-span-12 lg:col-span-4 lg:border-l lg:border-ink-200 lg:pl-8 flex flex-col gap-3 self-start">
            <Link href="/upload" className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2 text-[15px]">
              Submit a manuscript →
            </Link>
            <Link href="/how-it-works" className="text-ink-700 hover:text-ink-900 text-[15px]">
              Read the editorial process →
            </Link>
          </div>
        </div>

        {/* Frontispiece — one large daylight photograph. */}
        <figure className="mt-14">
          <div className="relative w-full aspect-[21/9] overflow-hidden ring-1 ring-ink-200">
            <Image
              src={HERO_FIGURE.src}
              alt={HERO_FIGURE.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 flex items-baseline justify-between gap-6 text-[12.5px]">
            <span className="font-serif italic text-ink-700">Doctoral work, kept under steady editorial light.</span>
            <span className="text-ink-500">Photograph · {HERO_FIGURE.credit}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
