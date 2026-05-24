"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ManageBillingButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/billing/portal", { method: "POST" });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data.detail ?? data.error ?? `HTTP ${r.status}`);
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't open portal");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className={className ?? "btn-secondary"}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Opening portal…" : "Manage subscription"}
      </button>
      {error && <p className="mt-2 text-[12px] text-rose-700">{error}</p>}
    </>
  );
}
