"use client";

import { useState, useCallback, FormEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Info, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "idle" | "file-ready" | "submitting" | "received" | "error";

interface UploadDocument {
  kind: string;
  wordCount: number;
  pageCount: number;
  excerpt: string;
  sizeBytes: number;
}

interface UploadResult {
  jobId: string;
  displayId?: string;
  stage: string;
  demoMode?: boolean;
  persisted?: boolean;
  pipelineActive?: boolean;
  intakeCaptured?: boolean;
  document?: UploadDocument;
  message?: string;
}

const SERVICE_OPTIONS = [
  "Chapter review (single chapter)",
  "Full manuscript review",
  "APA 7 verification only",
  "Methodology alignment only",
  "Citation cross-check only",
  "Defense readiness package",
  "Other (specify in notes)"
];

const STAGE_OPTIONS = [
  "Proposal in progress",
  "Proposal defense scheduled",
  "Chapters 1–3 drafted",
  "Chapters 1–5 drafted",
  "Full manuscript drafted",
  "Final defense scheduled",
  "Post-defense revisions"
];

const CHAPTER_OPTIONS = [
  "Chapter 1 — Introduction",
  "Chapter 2 — Literature Review",
  "Chapter 3 — Methodology",
  "Chapter 4 — Results / Findings",
  "Chapter 5 — Discussion / Conclusions",
  "Full manuscript",
  "Other (specify in notes)"
];

export function UploadZone() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const onDrop = useCallback((selected: File) => {
    setError(null);
    setErrorHint(null);
    setResult(null);

    if (!/\.(pdf|docx)$/i.test(selected.name)) {
      setError("Only .pdf and .docx are accepted.");
      setErrorHint("Convert your document to PDF or DOCX and try again.");
      setStage("error");
      setFile(null);
      return;
    }
    if (selected.size === 0) {
      setError("That file appears to be empty (0 bytes).");
      setErrorHint("Re-export the document and try again.");
      setStage("error");
      setFile(null);
      return;
    }
    if (selected.size > 50 * 1024 * 1024) {
      setError("Files larger than 50 MB require Dissertation Intensive or Enterprise.");
      setErrorHint("Email concierge@dissertationeditingcenter.com for a custom upload link.");
      setStage("error");
      setFile(null);
      return;
    }

    setFile(selected);
    setStage("file-ready");
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setStage("submitting");
    setError(null);
    setErrorHint(null);

    const fd = new FormData(e.currentTarget);
    fd.set("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
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
      setErrorHint("Check your connection and try again.");
    }
  }

  // SUCCESS — confirmation card
  if (stage === "received" && result) {
    return <SuccessCard result={result} file={file} onReset={() => { setStage("idle"); setFile(null); setResult(null); }} />;
  }

  return (
    <div className="card p-7">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onDrop(f);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          stage === "error"
            ? "border-amber-300 bg-amber-50/40"
            : stage === "file-ready" || stage === "submitting"
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-ink-200 hover:border-ink-300 bg-paper"
        )}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3 text-left">
            <FileText className="h-5 w-5 text-ink-700 shrink-0" />
            <div>
              <div className="text-[14px] text-ink-900">{file.name}</div>
              <div className="text-[12px] text-ink-500">{(file.size / 1024 / 1024).toFixed(2)} MB · ready</div>
            </div>
            <button
              type="button"
              onClick={() => { setFile(null); setStage("idle"); }}
              className="ml-3 text-[12px] text-ink-500 hover:text-ink-900 underline underline-offset-4"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="h-7 w-7 mx-auto text-ink-700" />
            <h3 className="mt-3 font-serif text-[19px] text-ink-900">Drop your manuscript here</h3>
            <p className="mt-1 text-[13px] text-ink-600">PDF or DOCX, up to 50 MB. Encrypted in transit and at rest.</p>
            <label className="mt-4 inline-block btn-primary cursor-pointer">
              Choose a file
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={(e) => e.target.files?.[0] && onDrop(e.target.files[0])}
              />
            </label>
          </>
        )}
      </div>

      {/* Intake form — appears once a valid file is held */}
      {(stage === "file-ready" || stage === "submitting") && file && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="eyebrow">Tell us about your submission</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field name="firstName" label="First name" required />
            <Field name="lastName" label="Last name" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone (optional)" type="tel" />
            <Field name="university" label="University" required placeholder="e.g. Columbia, NYU, Rutgers" />
            <Field name="degreeProgram" label="Degree program" required placeholder="e.g. Ed.D. Educational Leadership" />
            <Select name="dissertationStage" label="Dissertation stage" required options={STAGE_OPTIONS} />
            <Select name="chapterUploaded" label="What did you upload?" required options={CHAPTER_OPTIONS} />
          </div>
          <Select name="serviceRequested" label="Service requested" required options={SERVICE_OPTIONS} />
          <div>
            <label htmlFor="notes" className="block text-[12.5px] text-ink-700 mb-1.5">
              Anything specific your chair or committee flagged? <span className="text-ink-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="e.g. Chair wants stronger framework-to-literature transitions in §2.3 before next meeting."
              className="w-full px-3 py-2 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[14px]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-100">
            <p className="text-[12px] text-ink-500">
              Encrypted in transit and at rest · We never train AI models on your manuscript ·{" "}
              <a href="/security" className="underline underline-offset-4">Read our security posture</a>
            </p>
            <button
              type="submit"
              disabled={stage === "submitting"}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {stage === "submitting" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <>Submit for review <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error block */}
      {stage === "error" && error && (
        <div className="mt-4 rounded-xl bg-rose-50 ring-1 ring-rose-700/15 p-4">
          <div className="flex items-start gap-2 text-[13.5px] text-rose-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Upload could not complete.</div>
              <p className="mt-1">{error}</p>
              {errorHint && <p className="mt-1 text-[12.5px] text-rose-800/80">{errorHint}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
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
      <label htmlFor={name} className="block text-[12.5px] text-ink-700 mb-1.5">
        {label}{required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[14px]"
      />
    </div>
  );
}

function Select({
  name,
  label,
  required,
  options
}: {
  name: string;
  label: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[12.5px] text-ink-700 mb-1.5">
        {label}{required && <span className="text-rose-600 ml-0.5">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className="w-full h-10 px-3 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[14px]"
      >
        <option value="" disabled>Choose one…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SuccessCard({
  result,
  file,
  onReset
}: {
  result: UploadResult;
  file: File | null;
  onReset: () => void;
}) {
  const id = result.displayId ?? result.jobId;
  return (
    <div className="card p-7 space-y-5">
      {file && (
        <div className="flex items-center justify-between rounded-xl bg-paper ring-1 ring-ink-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4.5 w-4.5 text-ink-700" />
            <div>
              <div className="text-[13.5px] text-ink-900">{file.name}</div>
              <div className="text-[11.5px] text-ink-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          <span className="pill-success"><CheckCircle2 className="h-3.5 w-3.5" />Received</span>
        </div>
      )}

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
            <strong className="font-semibold">Preview mode.</strong> Manuscript parsed successfully, but the database is not yet provisioned, so this submission is not stored.
            <div className="mt-2 text-[12.5px] text-amber-800/80 font-mono">{id}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-ink-900 text-white px-5 py-5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">Submission confirmed</div>
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-emerald-300">pipeline active</span>
            </div>
            <div className="mt-2 font-mono text-[16px] text-white font-semibold">{id}</div>
            <p className="mt-3 text-[13.5px] leading-[1.6] text-ink-100">
              Your dissertation has been successfully submitted. The Lead Intake Agent is reviewing
              your file now. We'll email you the annotated PDF, APA report, and revision plan
              when ready — typically within 24 hours.
            </p>
            <p className="mt-3 text-[12.5px] text-ink-300">
              📧 A confirmation email has been sent. If you don't see it within 5 minutes, check
              spam or write to{" "}
              <span className="underline underline-offset-4">concierge@dissertationeditingcenter.com</span>{" "}
              with your submission ID.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href={`/status/${result.jobId}`}
                className="inline-flex items-center gap-1.5 text-[13px] text-white underline underline-offset-4"
              >
                Open live status →
              </a>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-[13px] text-ink-200 hover:text-white underline underline-offset-4"
              >
                Submit another
              </button>
            </div>
          </div>

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
          <div className="text-[11px] uppercase tracking-[0.2em] text-ink-500 mb-2">First 280 characters of your manuscript</div>
          <p className="font-serif italic text-[14px] leading-[1.55] text-ink-800">
            "{result.document.excerpt}…"
          </p>
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
