import Link from "next/link";
import Image from "next/image";
import { PORTRAITS } from "@/lib/media";

const LETTER = {
  portrait: PORTRAITS.patel,
  body:
    "The feedback read like notes from a methodologist who actually sat with the chapter. The synthesis gap they flagged on page 12 was the same one my chair found three weeks later.",
  name: "M. Patel",
  role: "Doctoral candidate · Ed.D. · R1 Education program",
  place: "Atlanta"
};

export function CorrespondenceTeaser() {
  return (
    <section className="section bg-paper">
      <div className="container">
        <header className="chapter">
          <span className="roman">V.</span>
          <span className="label">From the correspondence</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-8 items-start">
          <div className="col-span-12 lg:col-span-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-[18px] ring-1 ring-ink-200">
              <Image
                src={LETTER.portrait.src}
                alt={LETTER.portrait.alt}
                fill
                sizes="112px"
                className="object-cover grayscale-[35%]"
              />
            </div>
            <p className="mt-5 text-[13.5px] text-ink-900">{LETTER.name}</p>
            <p className="text-[12.5px] italic text-ink-500">{LETTER.role}</p>
            <p className="text-[12.5px] text-ink-500">{LETTER.place}</p>
          </div>

          <blockquote className="col-span-12 lg:col-span-9 font-serif text-[22px] lg:text-[28px] leading-[1.4] text-ink-900 balance lg:border-l lg:border-ink-200 lg:pl-10">
            “{LETTER.body}”
          </blockquote>
        </div>

        <p className="mt-10 text-[13.5px]">
          <Link href="/about" className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2">
            Read more letters →
          </Link>
        </p>
      </div>
    </section>
  );
}
