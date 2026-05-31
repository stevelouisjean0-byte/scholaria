"use client";

import { useState } from "react";
import { Loader2, RefreshCw, RotateCcw, Check, AlertCircle } from "lucide-react";

/**
 * Per-row admin actions:
 *  • Regenerate the deliverable for a delivered (or needs_manual_review) job
 *  • Reset a stuck job back to delivered so it becomes re-runnable
 *
 * Both call admin API routes that auth via the live Clerk admin session
 * (cookie), so no CRON_SECRET is needed for these clicks.
 */
export function JobActions({
  jobId,
  stage
}: {
  jobId: string;
  stage: string;
}) {
  const [busy, setBusy] = useState<"regen" | "reset" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const canRegen = stage === "delivered" || stage === "needs_manual_review";
  const isStuck = stage === "delivering" || stage === "intake" || stage === "scoping" || stage === "reviewing" || stage === "qa";

  async function regen() {
    if (!confirm("Regenerate the deliverable for this job? This re-runs the report agent (costs Anthropic credits) and sends the completion email to the student.")) {
      return;
    }
    setBusy("regen");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/rerun-delivery?id=${encodeURIComponent(jobId)}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "err", text: data.error ?? data.message ?? `HTTP ${res.status}` });
      } else {
        setMsg({
          kind: "ok",
          text: data.formalReportPresent
            ? `Regenerated. Stage=${data.stage}. Refresh to see new output.`
            : `Completed. Stage=${data.stage}.`
        });
      }
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!confirm(`Reset this job's stage to "delivered" so it can be regenerated? (Use this when a prior delivery attempt left it stuck in "delivering".)`)) {
      return;
    }
    setBusy("reset");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/reset-stage?id=${encodeURIComponent(jobId)}&stage=delivered`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ kind: "err", text: data.error ?? `HTTP ${res.status}` });
      } else {
        setMsg({ kind: "ok", text: "Stage reset to delivered. You can regenerate now." });
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
            title="Regenerate the formal 12-section deliverable + send completion email"
          >
            {busy === "regen" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Regenerate
          </button>
        )}
        {isStuck && (
          <button
            onClick={reset}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-300 text-[11px] text-amber-800 hover:bg-amber-50 disabled:opacity-50"
            title="Reset stage back to delivered (unstick a job that crashed mid-delivery)"
          >
            {busy === "reset" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
            Reset
          </button>
        )}
      </div>
      {msg && (
        <div
          className={`text-[11px] mt-1 inline-flex items-center gap-1 max-w-[260px] ${
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
