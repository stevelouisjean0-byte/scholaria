import Link from "next/link";

export function ClosingCTA() {
  return (
    <section className="section">
      <div className="container max-w-4xl">
        <hr className="journal-rule" />
        <div className="mt-12 grid grid-cols-12 gap-x-10 gap-y-6 items-end">
          <h2 className="col-span-12 lg:col-span-8 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Bring us your chapter. We will tell you, precisely, what to revise.
          </h2>
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 text-[15.5px]">
            <Link href="/upload" className="text-ink-900 underline underline-offset-[6px] decoration-1 hover:decoration-2">
              Submit a manuscript →
            </Link>
            <Link href="/pricing" className="text-ink-700 hover:text-ink-900">
              See rates &amp; access →
            </Link>
            <Link href="/how-it-works" className="text-ink-700 hover:text-ink-900">
              Read the editorial process →
            </Link>
            <Link href="/contact" className="text-ink-700 hover:text-ink-900">
              Speak with the desk →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
