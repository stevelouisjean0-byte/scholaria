"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ProductSlug } from "@/lib/products";

interface Props {
  product: ProductSlug;
  label: string;
  className?: string;
}

export function OrderButton({ product, label, className = "btn-primary" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.detail ?? data.error ?? "Could not start checkout");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={onClick} disabled={busy} className={`${className} inline-flex items-center justify-center gap-2 disabled:opacity-60`}>
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting…</> : label}
      </button>
      {error && <p className="mt-2 text-[11.5px] text-rose-700 text-center">{error}</p>}
    </div>
  );
}
