import { Activity, Cpu, GitBranch, Users, Wallet, AlertTriangle, Server } from "lucide-react";

export default function AdminDashboard() {
  return (
    <section className="bg-paper min-h-screen">
      <div className="container py-10">
        <div>
          <div className="eyebrow">Admin · operations</div>
          <h1 className="font-serif text-3xl text-ink-900 mt-2">Autonomous platform health</h1>
          <p className="text-[14px] text-ink-600 mt-1">Workflows, agents, and revenue — observed in real time. No human in the loop.</p>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-4">
          {[
            { k: "MRR", v: "$184,210", icon: Wallet, kind: "currency" },
            { k: "Active subs", v: "2,418", icon: Users },
            { k: "Jobs in flight", v: "317", icon: Activity },
            { k: "Agent invocations / hr", v: "12,940", icon: Cpu },
            { k: "Queue depth", v: "11", icon: GitBranch },
            { k: "QA reject rate", v: "1.4%", icon: AlertTriangle },
            { k: "API p95", v: "412 ms", icon: Server },
            { k: "Error rate (24h)", v: "0.06%", icon: AlertTriangle }
          ].map((c) => (
            <div key={c.k} className="col-span-6 md:col-span-4 lg:col-span-3 card p-5">
              <div className="flex items-center gap-2 text-[12px] text-ink-500">
                <c.icon className="h-4 w-4" /> {c.k}
              </div>
              <div className="mt-1 font-serif text-3xl text-ink-900">{c.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-8 card">
            <header className="flex items-center justify-between p-5 border-b border-ink-100">
              <h2 className="font-serif text-[18px] text-ink-900">Agent performance</h2>
              <span className="text-[11.5px] text-ink-500 font-mono">live · 60s window</span>
            </header>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="text-ink-500 text-left">
                  <tr>
                    <th className="py-2 font-medium">Agent</th>
                    <th className="py-2 font-medium">Invocations</th>
                    <th className="py-2 font-medium">Median latency</th>
                    <th className="py-2 font-medium">Cache hit</th>
                    <th className="py-2 font-medium">QA rejects</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-ink-900">
                  {[
                    ["Lead Intake", "1,210", "4.1 s", "—", "0", "healthy"],
                    ["Project Scoping & Routing", "1,202", "3.6 s", "78%", "0", "healthy"],
                    ["Orchestrator", "3,144", "1.2 s", "82%", "—", "healthy"],
                    ["Professional Editor", "2,580", "18.4 s", "44%", "12", "healthy"],
                    ["Research Support", "2,401", "21.7 s", "41%", "8", "healthy"],
                    ["QA & Final Approval", "1,184", "9.1 s", "—", "—", "healthy"],
                    ["Pricing & Payment", "417", "1.0 s", "—", "—", "healthy"],
                    ["Client Support", "812", "2.4 s", "61%", "—", "healthy"],
                    ["SEO & Growth", "12", "—", "—", "—", "running"],
                    ["Survey Completion", "183", "1.3 s", "—", "—", "healthy"]
                  ].map(([a, n, lat, hit, q, st]) => (
                    <tr key={a as string} className="border-t border-ink-100">
                      <td className="py-2.5">{a}</td>
                      <td className="py-2.5">{n}</td>
                      <td className="py-2.5">{lat}</td>
                      <td className="py-2.5">{hit}</td>
                      <td className="py-2.5">{q}</td>
                      <td className="py-2.5"><span className="pill-success">{st}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="card p-5">
              <h3 className="font-serif text-[17px] text-ink-900">Workflow funnel · last 24h</h3>
              <ul className="mt-3 space-y-2 text-[13.5px]">
                {[
                  ["Uploaded", 612],
                  ["Intake complete", 612],
                  ["Scoping complete", 611],
                  ["Reviews complete", 604],
                  ["QA passed", 596],
                  ["Delivered", 596]
                ].map(([k, v], i) => (
                  <li key={k as string} className="flex items-center justify-between">
                    <span className="text-ink-700">{k}</span>
                    <span className="font-mono text-ink-900">{(v as number).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-serif text-[17px] text-ink-900">Subscription mix</h3>
              <ul className="mt-3 space-y-2 text-[13.5px]">
                {[
                  ["Graduate", "1,217"],
                  ["Doctoral", "918"],
                  ["Dissertation Intensive", "201"],
                  ["University Enterprise", "12 institutions"]
                ].map(([k, v]) => (
                  <li key={k as string} className="flex items-center justify-between">
                    <span className="text-ink-700">{k}</span>
                    <span className="font-mono text-ink-900">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-serif text-[17px] text-ink-900">System health</h3>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li className="flex justify-between"><span>API gateway</span><span className="pill-success">operational</span></li>
                <li className="flex justify-between"><span>Queue workers</span><span className="pill-success">operational</span></li>
                <li className="flex justify-between"><span>Postgres primary</span><span className="pill-success">operational</span></li>
                <li className="flex justify-between"><span>Redis cluster</span><span className="pill-success">operational</span></li>
                <li className="flex justify-between"><span>Anthropic API</span><span className="pill-success">operational</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
