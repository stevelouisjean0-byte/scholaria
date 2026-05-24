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
  document?: UploadDocument;
  message?: string;
}

export function UploadZone() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
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
        <p className="mt-1 text-[13.5px] text-ink-600">PDF or DOCX, up to 50 MB. Uploads are encrypted in transit and at rest.</p>
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
                <strong className="font-semibold">Demo mode.</strong> Your manuscript was parsed
                successfully, but the autonomous review pipeline requires a database and queue
                worker to persist jobs. Once the platform's Postgres + Redis infrastructure is
                provisioned, uploads run through the full 11-agent pipeline automatically.
                <div className="mt-2 text-[12.5px] text-amber-800/80 font-mono">
                  Session job id: {result.jobId}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-ink-900 text-white px-5 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">Job created</div>
              <div className="font-mono text-[13.5px]">{result.jobId}</div>
              <p className="mt-2 text-[13px] text-ink-200">
                {result.message ??
                  "The Lead Intake Agent has been engaged. You can track every agent in real time from your dashboard."}
              </p>
              <a href="/dashboard" className="mt-3 inline-block text-[13px] underline underline-offset-4">
                Open dashboard →
              </a>
            </div>
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
