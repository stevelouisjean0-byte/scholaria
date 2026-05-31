"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, RotateCcw, Check, AlertCircle, Zap } from "lucide-react";

/**
 * Per-row admin actions, context-aware by job stage:
 *  • delivered / needs_manual_review  → "Regenerate" (re-runs report agent, sends email)
 *  • intake / scoping / reviewing / qa  → "Advance" (fires /api/cron/tick to nudge pipeline)
 *  • delivering                        → "Reset" (move back to delivered IF a report exists)
 *
 * After any successful action, calls router.refresh() so the server-rendered
 * submissions table picks up the new state without a manual reload.
 *
 * All endpoints authenticate via the Clerk admin session cookie — no
 * CRON_SECRET needed.
 */
export function JobActions({
  jobId,
  stage
}: {
  jobId: string;
  stage: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"regen" | "reset" | "advance" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const canRegen = stage === "delivered" || stage === "needs_manual_review";
  const canReset = stage === "delivering";
  // Mid-pipeline stages where the cron should be able to make progress.
  const canAdvance = stage === "uploaded" || stage === "intake" || stage === "scoping" || stage === "reviewing" || stage === "qa";

  async function regen() {
    if (!confirm("Regenerate the deliverable for this job? This re-runs the report agents (costs Anthropic credits) and sends the completion email to the student.")) {
      return;
    }
    setBusy("regen");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/rerun-delivery?id=${encodeURIComponent(jobId)}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "err", text: data.error ?? data.detail ?? data.message ?? `HTTP ${res.status}` });
      } else {
        setMsg({
          kind: "ok",
          text: data.formalReportPresent
            ? `Regenerated. Stage=${data.stage}.`
            : `Completed. Stage=${data.stage}.`
        });
        router.refresh();
      }
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!confirm(`Reset this job's stage to "delivered"? This is only allowed if a report already exists in memory (e.g. a prior delivery attempt crashed after generating the report).`)) {
      return;
    }
    setBusy("reset");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/reset-stage?id=${encodeURIComponent(jobId)}&stage=delivered`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({
          kind: "err",
          text: (data.error ?? `HTTP ${res.status}`) + (data.hint ? ` — ${data.hint}` : "")
        });
      } else {
        setMsg({ kind: "ok", text: "Stage reset to delivered. You can regenerate now." });
        router.refresh();
      }
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function advance() {
    setBusy("advance");
    setMsg(null);
    try {
      // The cron tick processes one stage transition per call and self-chains
      // for the rest. We trigger it five times in quick succession so a job
      // can typically move from intake all the way to delivered in one click,
      // bounded by Anthropic call latency (each tick takes ~10-40s).
      const triggers = 5;
      const results: Array<{ ok: boolean; stage?: string; result?: string; error?: string }> = [];
      for (let i = 0; i < triggers; i++) {
        const res = await fetch("/api/cron/tick", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          results.push({ ok: false, error: data.error ?? `HTTP ${res.status}` });
          break;
        }
        const myStep = (data.processed ?? []).find((p: any) => p.jobId === jobId);
        results.push({
          ok: true,
          stage: myStep?.stage,
          result: myStep?.result ?? myStep?.error
        });
        // Stop early if there's nothing left pending
        if (!data.pending || data.pending === 0) break;
        // Tiny pause between ticks so the prior insertion settles
        await new Promise((r) => setTimeout(r, 800));
      }
      const transitions = results.filter((r) => r.ok && r.result).map((r) => `${r.stage}→${r.result}`).join("; ");
      const firstError = results.find((r) => !r.ok);
      if (firstError) {
        setMsg({ kind: "err", text: `Advance error: ${firstError.error}` });
      } else if (transitions) {
        setMsg({ kind: "ok", text: `Advanced: ${transitions}` });
        router.refresh();
      } else {
        setMsg({ kind: "ok", text: "No transitions this round; try again in 30s." });
      }
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex gap-1.5">
        {canRegen && (
          <button
            onClick={regen}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-ink-200 text-[11px] text-ink-800 hover:bg-paper disabled:opacity-50"
            title="Regenerate the formal 18-section deliverable + send completion email"
          >
            {busy === "regen" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Regenerate
          </button>
        )}
        {canAdvance && (
          <button
            onClick={advance}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-300 text-[11px] text-blue-800 hover:bg-blue-50 disabled:opacity-50"
            title="Fire 5 cron-tick invocations to push this job forward through the pipeline"
          >
            {busy === "advance" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
            Advance
          </button>
        )}
        {canReset && (
          <button
            onClick={reset}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-300 text-[11px] text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            title="Reset stage back to delivered (only works when a report already exists)"
          >
            {busy === "reset" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
            Reset
          </button>
        )}
      </div>
      {msg && (
        <div
          className={`text-[11px] mt-1 inline-flex items-center gap-1 max-w-[300px] ${
            msg.kind === "ok" ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {msg.kind === "ok" ? <Check className="h-3 w-3 flex-shrink-0" /> : <AlertCircle className="h-3 w-3 flex-shrink-0" />}
          <span className="truncate" title={msg.text}>{msg.text}</span>
        </div>
      )}
    </div>
  );
}
