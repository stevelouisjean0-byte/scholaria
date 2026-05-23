"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, RefreshCw } from "lucide-react";

interface AgentHealth {
  key: string;
  name: string;
  tier: string;
  status: "healthy" | "degraded" | "missing" | "error";
  latencyMs?: number;
  error?: string;
  agentIdMasked?: string;
  hasPrimary: boolean;
  hasBackup: boolean;
}

interface Health {
  ok: boolean;
  summary: { healthy: number; degraded: number; missing: number; error: number };
  agents: AgentHealth[];
  checkedAt?: string;
  model?: string;
  message?: string;
}

export default function AgentsHealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/agents/health", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Health check failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="bg-canvas min-h-screen">
      <div className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Admin · agent health</span>
            <h1 className="mt-3 h-display text-display-lg">Managed Agent connectivity</h1>
            <p className="mt-2 text-[14.5px] text-ink-600 max-w-2xl">
              Live ping of every agent in the registry. Surface any missing IDs, expired credentials,
              429s, or model-side errors before they reach a student.
            </p>
          </div>
          <button onClick={refresh} className="btn-primary" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Pinging…" : "Re-run health check"}
          </button>
        </div>

        {data?.message && (
          <div className="mt-6 rounded-2xl bg-amber-50 ring-1 ring-amber-700/15 p-4 text-[14px] text-amber-900">
            <strong className="font-semibold">Heads up:</strong> {data.message}
          </div>
        )}
        {err && (
          <div className="mt-6 rounded-2xl bg-rose-50 ring-1 ring-rose-700/15 p-4 text-[14px] text-rose-900">
            <strong className="font-semibold">Health check error:</strong> {err}
          </div>
        )}

        {data && (
          <>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Healthy" value={data.summary.healthy} kind="success" />
              <Stat label="Degraded" value={data.summary.degraded} kind="warn" />
              <Stat label="Missing ID" value={data.summary.missing} kind="neutral" />
              <Stat label="Errors" value={data.summary.error} kind="danger" />
            </div>

            <div className="mt-8 card overflow-hidden">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="text-left bg-ink-50/60 border-b border-ink-100">
                    <th className="py-3 px-4 font-medium text-ink-600">Agent</th>
                    <th className="py-3 px-4 font-medium text-ink-600">Tier</th>
                    <th className="py-3 px-4 font-medium text-ink-600">Status</th>
                    <th className="py-3 px-4 font-medium text-ink-600">Latency</th>
                    <th className="py-3 px-4 font-medium text-ink-600">Agent ID</th>
                    <th className="py-3 px-4 font-medium text-ink-600">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.agents.map((a) => (
                    <tr key={a.key}>
                      <td className="py-3 px-4">
                        <div className="text-ink-900 font-medium">{a.name}</div>
                        <div className="text-[11.5px] text-ink-500 font-mono">{a.key}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-ink-700">{a.tier}</td>
                      <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                      <td className="py-3 px-4 tabular text-ink-700">
                        {a.latencyMs != null ? `${a.latencyMs} ms` : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-ink-700">
                        {a.agentIdMasked ?? <span className="text-ink-400 italic">not set</span>}
                      </td>
                      <td className="py-3 px-4 text-[12.5px] text-ink-600 max-w-md">
                        {a.error ?? (a.hasBackup ? "primary + backup configured" : a.hasPrimary ? "primary configured" : "no ID configured")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-[12px] text-ink-500 italic">
              Last checked {data.checkedAt ? new Date(data.checkedAt).toLocaleString() : "—"}
              {data.model && <> · Ping model · {data.model}</>}
            </div>
          </>
        )}

        {!data && !err && (
          <div className="mt-10 text-[14px] text-ink-600">Running first health check…</div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: AgentHealth["status"] }) {
  if (status === "healthy")
    return (
      <span className="pill-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        healthy
      </span>
    );
  if (status === "degraded")
    return (
      <span className="pill-warn">
        <AlertTriangle className="h-3.5 w-3.5" />
        degraded
      </span>
    );
  if (status === "missing")
    return (
      <span className="pill-neutral">
        <MinusCircle className="h-3.5 w-3.5" />
        missing
      </span>
    );
  return (
    <span className="pill-danger">
      <XCircle className="h-3.5 w-3.5" />
      error
    </span>
  );
}

function Stat({
  label,
  value,
  kind
}: {
  label: string;
  value: number;
  kind: "success" | "warn" | "neutral" | "danger";
}) {
  const tone =
    kind === "success" ? "ring-emerald-700/20 bg-emerald-50/40 text-emerald-700" :
    kind === "warn"    ? "ring-amber-700/20 bg-amber-50/40 text-amber-700" :
    kind === "danger"  ? "ring-rose-700/20 bg-rose-50/40 text-rose-700" :
                          "ring-ink-200 bg-white text-ink-700";
  return (
    <div className={`rounded-2xl ring-1 p-5 ${tone}`}>
      <div className="text-[11px] uppercase tracking-[0.24em]">{label}</div>
      <div className="mt-1 font-semibold tabular text-4xl text-ink-900">{value}</div>
    </div>
  );
}
