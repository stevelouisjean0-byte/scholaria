"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { VideoSlot } from "@/lib/media";

interface FeatureVideoProps {
  number?: string;
  eyebrow: string;
  title: string;
  caption?: string;
  slot: VideoSlot;
  align?: "center" | "left";
}

/**
 * Engagement-grade feature video. Renders as a poster image until clicked,
 * then loads a YouTube embed in-place. Zero third-party requests on initial
 * page load — Lighthouse-friendly. If no `youtubeId` is configured, the
 * component remains a still figure (still beautiful, just not interactive).
 */
export function FeatureVideo({ number, eyebrow, title, caption, slot, align = "center" }: FeatureVideoProps) {
  const [active, setActive] = useState(false);
  const canPlay = Boolean(slot.youtubeId);

  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">{number ?? "★"}</span>
          <span className="label">{eyebrow}</span>
        </header>

        <div className={align === "center" ? "max-w-4xl mx-auto text-center" : "max-w-3xl"}>
          <h2 className="font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            {title}
          </h2>
          {caption && (
            <p className="mt-4 font-serif italic text-[17px] leading-[1.6] text-ink-600">{caption}</p>
          )}
        </div>

        <figure className="mt-12">
          <div className="relative w-full aspect-video overflow-hidden ring-1 ring-ink-200 bg-ink-900">
            {!active && (
              <>
                <Image
                  src={slot.poster}
                  alt={slot.posterAlt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/45" />
                <button
                  type="button"
                  onClick={() => canPlay && setActive(true)}
                  disabled={!canPlay}
                  className={`absolute inset-0 flex items-center justify-center group ${
                    canPlay ? "cursor-pointer" : "cursor-default"
                  }`}
                  aria-label={canPlay ? "Play video" : "Video coming soon"}
                >
                  <span className="relative inline-flex h-20 w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-elev3 transition-transform group-hover:scale-105">
                    <Play className="h-7 w-7 lg:h-8 lg:w-8 fill-current ml-1" />
                  </span>
                </button>

                {/* Bottom caption inside the poster. */}
                <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7 flex items-end justify-between gap-6 text-white">
                  <span className="font-serif italic text-[16px] lg:text-[18px] leading-[1.5] max-w-2xl balance">
                    {slot.caption}
                  </span>
                  <span className="hidden sm:inline text-[11px] uppercase tracking-[0.28em] text-white/75">
                    {slot.duration ?? ""}
                  </span>
                </div>
              </>
            )}

            {active && slot.youtubeId && (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${slot.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <figcaption className="mt-3 flex items-baseline justify-between gap-6 text-[12.5px] text-ink-500">
            <span className="italic">{slot.attribution}</span>
            <span>{slot.credit}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
