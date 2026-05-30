"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Self-contained demo-booking form for /enterprise. Submits to the
 * /api/enterprise-demo route which dispatches an email to the enterprise
 * mailbox (no external scheduler dependency). When the user supplies three
 * time windows, the message lands as a structured request the team can
 * confirm by reply within the published response SLA.
 */
type Stage = "idle" | "sending" | "sent" | "error";

export function EnterpriseDemoForm() {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStage("sending");
    setError(null);
    try {
      const res = await fetch("/api/enterprise-demo", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Could not submit. Please email enterprise@dissertationeditingcenter.com directly.");
        setStage("error");
        return;
      }
      setStage("sent");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setStage("error");
    }
  }

  if (stage === "sent") {
    return (
      <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-700/15 p-6 flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
        <div className="text-[14px] text-emerald-900 leading-relaxed">
          <strong className="font-semibold">Thanks — your demo request is in.</strong>{" "}
          A program lead will confirm one of your suggested time windows by email within one
          business hour during operating hours (Mon–Fri 9am–7pm ET).
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="name" label="Your name" required />
        <Field name="email" label="Work email" type="email" required />
        <Field name="institution" label="Institution / program" required />
        <Field name="role" label="Your role" placeholder="e.g. Program Director, IT Lead" />
      </div>

      <div>
        <label htmlFor="windows" className="block text-[12.5px] text-white/80 mb-1.5">
          Three time windows that work for you
        </label>
        <textarea
          id="windows"
          name="windows"
          required
          rows={3}
          placeholder="e.g. Tue Jun 3, 11am–12pm ET · Wed Jun 4, 2pm–3pm ET · Thu Jun 5, 9am–10am ET"
          className="w-full px-3 py-2 rounded-md bg-white/[0.04] ring-1 ring-white/15 text-white text-[14px] placeholder:text-white/30 focus:ring-white/40 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-[12.5px] text-white/80 mb-1.5">
          Anything specific you want covered? <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Cohort size, current writing-center workflow, FERPA constraints, procurement timeline…"
          className="w-full px-3 py-2 rounded-md bg-white/[0.04] ring-1 ring-white/15 text-white text-[14px] placeholder:text-white/30 focus:ring-white/40 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={stage === "sending"}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-white text-ink-900 text-[14px] font-medium hover:bg-ink-100 disabled:opacity-60 transition"
      >
        {stage === "sending" ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : "Request demo"}
      </button>

      {stage === "error" && error && (
        <div className="rounded-md bg-rose-900/30 ring-1 ring-rose-500/30 p-3 text-[13px] text-rose-200 flex gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[12.5px] text-white/80 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-md bg-white/[0.04] ring-1 ring-white/15 text-white text-[14px] placeholder:text-white/30 focus:ring-white/40 focus:outline-none"
      />
    </div>
  );
}
