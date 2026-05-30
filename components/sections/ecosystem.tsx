import { publicAgents } from "@/lib/agents";

export function Ecosystem() {
  const agents = publicAgents();

  return (
    <section className="section">
      <div className="container">
        <header className="chapter">
          <span className="roman">I.</span>
          <span className="label">The reviewing system</span>
        </header>

        <div className="grid grid-cols-12 gap-x-10 gap-y-8">
          <h2 className="col-span-12 lg:col-span-7 font-serif text-[40px] lg:text-[56px] leading-[1.04] tracking-[-0.025em] text-ink-900 balance">
            Ten specialised review agents. One coordinated pass.
          </h2>
          <div className="col-span-12 lg:col-span-5 lg:border-l lg:border-ink-200 lg:pl-8 text-[15px] leading-[1.75] text-ink-700">
            We're not a single prompt or a chain of disconnected tools. Every agent reads from and
            writes to a shared workflow memory, communicates through the orchestration layer, and
            operates from intake through final delivery — with the rules audited by a board of
            Ph.D. advisors.
          </div>
        </div>

        {/* Editorial register: each agent rendered as a numbered entry in a
            reference list, not a card. */}
        <ol className="mt-16 grid grid-cols-12 gap-x-10">
          {agents.map((a, i) => (
            <li
              key={a.key}
              className="col-span-12 lg:col-span-6 grid grid-cols-12 gap-4 py-7 border-t border-ink-200"
            >
              <span className="col-span-2 lg:col-span-1 font-mono tabular text-[12px] text-ink-500 pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-10 lg:col-span-11">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-[20px] text-ink-900">{a.name}</h3>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-ink-500 whitespace-nowrap">
                    {a.tier}
                  </span>
                </div>
                <p className="mt-1 text-[14px] leading-[1.65] text-ink-700 max-w-prose">
                  {a.publicSummary}
                </p>
                <p className="mt-2 text-[12.5px] text-ink-500">
                  {a.responsibilities.slice(0, 3).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
