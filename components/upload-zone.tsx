"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "idle" | "uploading" | "received" | "error";

export function UploadZone() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (selected: File) => {
    setFile(selected);
    setError(null);
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
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      setStage("error");
      setError("Upload failed. Please try again or contact concierge.");
      return;
    }
    const data = await res.json();
    setJobId(data.jobId);
    setStage("received");
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
          {stage === "uploading" && <span className="pill-accent">Uploading…</span>}
          {stage === "received" && <span className="pill-success"><CheckCircle2 className="h-3.5 w-3.5" />Received</span>}
          {stage === "error" && <span className="pill-warn"><AlertTriangle className="h-3.5 w-3.5" />Failed</span>}
        </div>
      )}

      {jobId && (
        <div className="mt-5 rounded-xl bg-ink-900 text-white px-5 py-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">Job created</div>
          <div className="font-mono text-[13.5px]">{jobId}</div>
          <p className="mt-2 text-[13px] text-ink-200">
            The Lead Intake Agent has been engaged. You can track every agent in real time from your
            dashboard.
          </p>
          <a href="/dashboard" className="mt-3 inline-block text-[13px] underline underline-offset-4">
            Open dashboard →
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 text-[13px] text-amber-700">{error}</div>
      )}
    </div>
  );
}
