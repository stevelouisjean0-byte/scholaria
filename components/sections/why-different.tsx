import { Check, X } from "lucide-react";

interface Row {
  label: string;
  scholaria: boolean | string;
  others: { name: string; v: boolean | string }[];
}

const ROWS: Row[] = [
  {
    label: "Built specifically for doctoral & graduate-level writing",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: false },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: "partial" },
      { name: "SciSpace", v: "partial" }
    ]
  },
  {
    label: "Multi-agent ecosystem with shared memory",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: false },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: false },
      { name: "SciSpace", v: false }
    ]
  },
  {
    label: "Methodology alignment review",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: "partial" },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: "partial" },
      { name: "SciSpace", v: "partial" }
    ]
  },
  {
    label: "Citation cross-check against reference list",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: "partial" },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: true },
      { name: "SciSpace", v: "partial" }
    ]
  },
  {
    label: "Submission readiness score with decomposition",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: false },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: false },
      { name: "SciSpace", v: false }
    ]
  },
  {
    label: "Refuses to author the manuscript on the student's behalf",
    scholaria: true,
    others: [
      { name: "Grammarly", v: "partial" },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: false },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: "partial" },
      { name: "SciSpace", v: false }
    ]
  },
  {
    label: "QA agent rejects generic / AI-pattern output",
    scholaria: true,
    others: [
      { name: "Grammarly", v: false },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: false },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: false },
      { name: "SciSpace", v: false }
    ]
  },
  {
    label: "Autonomous revenue operations & enterprise SSO",
    scholaria: true,
    others: [
      { name: "Grammarly", v: "partial" },
      { name: "QuillBot", v: false },
      { name: "ChatGPT", v: "partial" },
      { name: "Jenni AI", v: false },
      { name: "Paperpal", v: false },
      { name: "SciSpace", v: false }
    ]
  }
];

const COMPETITORS = ROWS[0].others.map((c) => c.name);

export function WhyDifferent() {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-3xl">
          <span className="eyebrow">Why Scholaria is different</span>
          <h2 className="mt-4 h-display text-display-xl">
            An autonomous dissertation intelligence ecosystem — not a generic AI writing assistant.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-ink-600">
            Scholaria was engineered specifically for the editorial work doctoral and graduate students
            actually have to do. The platform reviews scholarly writing; it never writes the dissertation
            on the student's behalf. That distinction is the first principle.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-[13.5px] min-w-[840px]">
            <thead>
              <tr className="text-left">
                <th className="py-4 pr-4 text-[11px] uppercase tracking-[0.22em] text-ink-500 font-medium">
                  Capability
                </th>
                <th className="py-4 pr-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-ink-900 font-semibold text-[13.5px]">
                    Scholaria
                    <span className="pill-accent">recommended</span>
                  </div>
                </th>
                {COMPETITORS.map((c) => (
                  <th key={c} className="py-4 pr-4 text-center text-ink-600 font-medium text-[13px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="border-t border-ink-200">
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-ink-100">
                  <td className="py-4 pr-4 align-top text-ink-900 max-w-[260px]">{row.label}</td>
                  <td className="py-4 pr-4 text-center align-top bg-accent-50/30">
                    <Cell v={row.scholaria} />
                  </td>
                  {row.others.map((o) => (
                    <td key={o.name} className="py-4 pr-4 text-center align-top">
                      <Cell v={o.v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-[12.5px] text-ink-500 italic">
          Capability ratings reflect each platform's primary positioning at the time of publication. Vendors
          may add features over time; verify with each platform directly before institutional purchase.
        </p>
      </div>
    </section>
  );
}

function Cell({ v }: { v: boolean | string }) {
  if (v === true) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-700/15 text-emerald-700">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (v === false) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 ring-1 ring-ink-200 text-ink-400">
        <X className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="text-[11.5px] uppercase tracking-[0.18em] text-amber-700 font-medium">
      partial
    </span>
  );
}
