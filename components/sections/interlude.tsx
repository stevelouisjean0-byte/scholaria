import Image from "next/image";
import type { Photo } from "@/lib/media";

interface InterludeProps {
  photo: Photo;
  caption: string;
  attribution?: string;
  bleed?: boolean;
}

/**
 * A printed-journal interlude — a single full-bleed photograph between
 * chapters, with a one-line italic caption underneath. Used sparingly to give
 * the reader a moment to breathe between dense editorial sections.
 */
export function Interlude({ photo, caption, attribution, bleed = true }: InterludeProps) {
  return (
    <section className="bg-white">
      <figure className={bleed ? "w-full" : "container"}>
        <div className="relative aspect-[21/9] sm:aspect-[21/8] overflow-hidden">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="container py-5 flex items-baseline justify-between gap-6 text-[12.5px]">
          <span className="font-serif italic text-ink-700">{caption}</span>
          <span className="text-ink-500 tabular">{attribution ?? `Photograph · ${photo.credit}`}</span>
        </figcaption>
      </figure>
    </section>
  );
}
