"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: "graduate" | "doctoral" | "dissertation";
  cadence?: "monthly" | "annual";
  label: string;
  className?: string;
}

/**
 * Pricing CTA. Hits /api/checkout to create a Stripe Checkout session,
 * then navigates to the hosted Stripe URL. If the user is not signed in,
 * Clerk middleware will redirect to /signin first; on the way back the
 * Checkout session is created with their Clerk id attached.
 */
export function CheckoutButton({ plan, cadence = "monthly", label, className }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, cadence })
      });
      const data = await r.json();
      if (!r.ok || !data.url) {
        throw new Error(data.detail ?? data.error ?? `HTTP ${r.status}`);
      }
      // Stripe Checkout is a full-page redirect, not an embed.
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={className ?? "btn-primary w-full"}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Opening checkout…" : label}
      </button>
      {error && (
        <p className="mt-2 text-[12px] text-rose-700">{error}</p>
      )}
    </>
  );
}
