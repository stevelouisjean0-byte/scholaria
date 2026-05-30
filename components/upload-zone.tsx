"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "idle" | "uploading" | "received" | "error";

interface UploadDocument {
  kind: string;
  wordCount: number;
  pageCount: number;
  excerpt: string;
  sizeBytes: number;
}

interface UploadResult {
  jobId: string;
  stage: string;
  demoMode?: boolean;
  persisted?: boolean;
  pipelineActive?: boolean;
  document?: UploadDocument;
  message?: string;
}

export function UploadZone() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const onDrop = useCallback(async (selected: File) => {
    setFile(selected);
    setError(null);
    setErrorHint(null);
    setResult(null);

    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setError("Only .pdf and .docx are accepted.");
      setStage("error");
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError("Files larger than 50 MB are accepted only on Dissertation Intensive and Enterprise.");
      setStage("error");
      return;
    }

    setStage("uploading");
    const form = new FormData();
    form.set("file", selected);
    if (email && /.+@.+\..+/.test(email)) form.set("email", email);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStage("error");
        setError(data.detail ?? data.error ?? "Upload failed. Please try again or contact concierge.");
        setErrorHint(data.hint ?? null);
        return;
      }

      setResult(data);
      setStage("received");
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Network error.");
    }
  }, []);

  return (
    <div className="card p-7">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onDrop(f);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          stage === "error"
            ? "border-amber-300 bg-amber-50/40"
            : stage === "received"
            ? "border-emerald-300 bg-emerald-50/40"
            : "border-ink-200 hover:border-ink-300 bg-paper"
        )}
      >
        <UploadCloud className="h-8 w-8 mx-auto text-ink-700" />
        <h3 className="mt-3 font-serif text-[20px] text-ink-900">Drop your manuscript here</h3>
        <p className="mt-1 text-[13.5px] text-ink-600">PDF or DOCX, up to 50 MB. Encrypted in transit and at rest.</p>
        <label className="mt-5 inline-block btn-primary cursor-pointer">
          Choose a file
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])}
          />
        </label>
      </div>

      {/* Email field — only shown until the user uploads. Optional but the
          only way an anonymous user receives the confirmation receipt. */}
      {stage === "idle" && (
        <div className="mt-4">
          <label htmlFor="upload-email" className="block text-[12.5px] text-ink-700">
            Email for your confirmation and review
          </label>
          <input
            id="upload-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="mt-1.5 w-full h-10 px-3 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[14px]"
          />
          <p className="mt-1 text-[11.5px] text-ink-500">
            Optional but recommended. We email your confirmation ID and the finished review here.
          </p>
        </div>
      )}

      {file && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-paper ring-1 ring-ink-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4.5 w-4.5 text-ink-700" />
            <div>
              <div className="text-[13.5px] text-ink-900">{file.name}</div>
              <div className="text-[11.5px] text-ink-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          {stage === "uploading" && <span className="pill-accent">Parsing…</span>}
          {stage === "received" && <span className="pill-success"><CheckCircle2 className="h-3.5 w-3.5" />Received</span>}
          {stage === "error" && <span className="pill-warn"><AlertTriangle className="h-3.5 w-3.5" />Failed</span>}
        </div>
      )}

      {/* Success block with document stats */}
      {stage === "received" && result && (
        <div className="mt-5 space-y-4">
          {result.document && (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Words" value={result.document.wordCount.toLocaleString()} />
              <Stat label="Pages" value={String(result.document.pageCount)} />
              <Stat label="Format" value={result.document.kind.toUpperCase()} />
            </div>
          )}

          {result.demoMode ? (
            <div className="rounded-xl bg-amber-50 ring-1 ring-amber-700/15 p-5 flex gap-3">
              <Info className="h-4.5 w-4.5 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-[13.5px] text-amber-900 leading-relaxed">
                <strong className="font-semibold">Demo mode.</strong> Manuscript parsed
                successfully, but the platform's database is not yet provisioned, so the job is
                held only in session memory.
                <div className="mt-2 text-[12.5px] text-amber-800/80 font-mono">
                  Session job id: {result.jobId}
                </div>
              </div>
            </div>
          ) : result.persisted && !result.pipelineActive ? (
            <>
              <div className="rounded-xl bg-ink-900 text-white px-5 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">Job persisted</div>
                <div className="font-mono text-[13.5px]">{result.jobId}</div>
                <p className="mt-2 text-[13px] text-ink-200">
                  Your manuscript is now in the platform's job ledger.
                </p>
                <a href="/dashboard" className="mt-3 inline-block text-[13px] underline underline-offset-4">
                  Open dashboard →
                </a>
              </div>
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-700/15 p-4 flex gap-3 text-[13px] text-amber-900">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold">Queue worker pending.</strong>{" "}
                  The autonomous review pipeline activates automatically once the queue worker (Redis) is provisioned. This job will then run.
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-ink-900 text-white px-5 py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">
                    Review received · confirmation
                  </div>
                  <span className="text-[10.5px] uppercase tracking-[0.18em] text-emerald-300">
                    pipeline active
                  </span>
                </div>
                <div className="mt-2 font-mono text-[13.5px] text-white/95">
                  Confirmation ID: <span className="text-white">{result.jobId}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.6] text-ink-100">
                  Your manuscript is now being reviewed by the editor and methodology agents.
                  We'll email you the moment your annotated PDF, APA report, and revision plan
                  are ready — typically within 24 hours (6–12 hours on Dissertation Intensive).
                </p>
                <p className="mt-3 text-[12.5px] text-ink-300">
                  📧 If you supplied an email, a confirmation is on the way. If you don't see it
                  within 5 minutes (check spam), use the "Email this to me" button below or write
                  to <span className="underline underline-offset-4">concierge@dissertationeditingcenter.com</span> with your confirmation ID.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <a
                    href={`/status/${result.jobId}`}
                    className="inline-flex items-center gap-1.5 text-[13px] text-white underline underline-offset-4"
                  >
                    Track your review →
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `Dissertation Editing Center — Confirmation ${result.jobId}`
                    )}&body=${encodeURIComponent(
                      [
                        `Confirmation ID: ${result.jobId}`,
                        file ? `Manuscript:        ${file.name}` : "",
                        result.document ? `Word count:        ${result.document.wordCount.toLocaleString()}` : "",
                        `Estimated time:    within 24 hours`,
                        ``,
                        `Track your review: https://dissertationeditingcenter.com/status/${result.jobId}`,
                        ``,
                        `We will email the annotated PDF, APA report, and revision plan when ready.`,
                        `Questions: concierge@dissertationeditingcenter.com`
                      ].filter(Boolean).join("\n")
                    )}`}
                    className="inline-flex items-center gap-1.5 text-[13px] text-white underline underline-offset-4"
                  >
                    Email this receipt to me →
                  </a>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-[13px] text-ink-200 hover:text-white underline underline-offset-4"
                  >
                    Open dashboard
                  </a>
                </div>
              </div>

              {/* Three-pill reassurance row — answers "what now?" anxiety. */}
              <div className="grid grid-cols-3 gap-2 text-[11.5px] text-ink-700">
                <div className="rounded-lg bg-paper ring-1 ring-ink-100 px-3 py-2.5">
                  <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Next email</div>
                  <div className="mt-0.5 text-ink-900 font-medium">When review is ready</div>
                </div>
                <div className="rounded-lg bg-paper ring-1 ring-ink-100 px-3 py-2.5">
                  <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Retention</div>
                  <div className="mt-0.5 text-ink-900 font-medium">Per your plan</div>
                </div>
                <div className="rounded-lg bg-paper ring-1 ring-ink-100 px-3 py-2.5">
                  <div className="uppercase tracking-[0.16em] text-ink-500 text-[10px]">Refund</div>
                  <div className="mt-0.5 text-ink-900 font-medium">14-day money back</div>
                </div>
              </div>
            </>
          )}

          {result.document?.excerpt && (
            <div className="rounded-xl ring-1 ring-ink-200 p-4 bg-paper">
              <div className="text-[11px] uppercase tracking-[0.2em] text-ink-500 mb-2">First 280 characters</div>
              <p className="font-serif italic text-[14px] leading-[1.55] text-ink-800">
                “{result.document.excerpt}…”
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error block */}
      {stage === "error" && error && (
        <div className="mt-4 rounded-xl bg-rose-50 ring-1 ring-rose-700/15 p-4">
          <div className="flex items-start gap-2 text-[13.5px] text-rose-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Upload failed.</div>
              <p className="mt-1">{error}</p>
              {errorHint && <p className="mt-1 text-[12.5px] text-rose-800/80">{errorHint}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-quiet p-3 text-center">
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">{label}</div>
      <div className="mt-1 font-serif text-[20px] text-ink-900 tabular">{value}</div>
    </div>
  );
}
