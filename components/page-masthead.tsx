import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/media";

interface PageMastheadProps {
  /** Roman numeral or page number on the imprint line (e.g. "II", "III"). */
  number?: string;
  /** Eyebrow label, set in small caps. */
  eyebrow: string;
  /** Page title, set in display serif. */
  title: string;
  /** Optional italic dek (subtitle) under the title. */
  dek?: string;
  /** Optional intro paragraph, set as an editorial abstract. */
  intro?: string;
  /** Photographic plate above or below the title. */
  photo: Photo;
  /** Photo position relative to the title block. */
  photoPosition?: "below" | "above";
  /** Optional CTAs rendered at the foot of the masthead. */
  ctas?: { label: string; href: string; primary?: boolean }[];
}

/**
 * The visual contract shared by every page on the site. A masthead with:
 *   - imprint line (Vol I · No N · page eyebrow)
 *   - large serif title (display)
 *   - optional dek + intro
 *   - photographic plate with caption + credit
 *
 * Every route consumes this so the multi-page site reads as issues of the
 * same publication rather than independent SaaS pages.
 */
export function PageMasthead({
  number,
  eyebrow,
  title,
  dek,
  intro,
  photo,
  photoPosition = "below",
  ctas
}: PageMastheadProps) {
  const Plate = (
    <figure className="mt-10 lg:mt-12">
      <div className="relative w-full aspect-[21/9] overflow-hidden ring-1 ring-ink-200">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={photoPosition === "above"}
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>
      <figcaption className="container py-4 flex items-baseline justify-between gap-6 text-[12.5px]">
        <span className="font-serif italic text-ink-700">{photo.alt}</span>
        <span className="text-ink-500">Photograph · {photo.credit}</span>
      </figcaption>
    </figure>
  );

  return (
    <header className="bg-white border-b border-ink-900/90">
      {photoPosition === "above" && Plate}

      <div className="container pt-10 pb-12">
        <div className="grid grid-cols-12 items-baseline gap-6 text-[11.5px] uppercase tracking-[0.28em] text-ink-500">
          <span className="col-span-6">Vol. I · No. {number ?? "—"}</span>
          <span className="col-span-6 text-right">{eyebrow}</span>
        </div>

        <hr className="journal-rule mt-3" />

        <h1 className="mt-8 font-serif text-ink-900 leading-[0.96] tracking-[-0.035em] balance text-[clamp(2.5rem,6vw,5.5rem)] max-w-5xl">
          {title}
        </h1>

        {dek && (
          <p className="mt-4 font-serif italic text-[19px] leading-[1.5] text-ink-600 max-w-3xl">
            {dek}
          </p>
        )}

        {intro && (
          <p className="mt-6 text-[15.5px] leading-[1.7] text-ink-700 max-w-3xl">
            {intro}
          </p>
        )}

        {ctas && ctas.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {ctas.map((c) =>
              c.primary ? (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2 text-[15px]"
                >
                  {c.label} →
                </Link>
              ) : (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  className="text-ink-700 hover:text-ink-900 text-[15px]"
                >
                  {c.label} →
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {photoPosition === "below" && Plate}
    </header>
  );
}
