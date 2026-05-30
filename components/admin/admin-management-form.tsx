"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AdminRole } from "@/lib/admin-roles";
import { ADMIN_ROLE_LABEL } from "@/lib/admin-roles";

type Mode = "create" | "manage";

interface Props {
  mode: Mode;
  roles: AdminRole[];
  clerkUserId?: string;
  currentRole?: AdminRole;
  disabled?: boolean;
}

export function AdminManagementForm({ mode, roles, clerkUserId, currentRole, disabled }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setOk(data.message ?? "Done.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "create") {
    async function onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      await call({
        action: "create",
        email: String(fd.get("email") ?? "").trim().toLowerCase(),
        role: String(fd.get("role") ?? "customer_support")
      });
      (e.currentTarget as HTMLFormElement).reset();
    }

    return (
      <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="new-admin-email" className="block text-[12px] text-ink-700 mb-1.5">
            Work email
          </label>
          <input
            id="new-admin-email"
            name="email"
            type="email"
            required
            placeholder="someone@dissertationeditingcenter.com"
            className="w-full h-10 px-3 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[13.5px]"
          />
        </div>
        <div>
          <label htmlFor="new-admin-role" className="block text-[12px] text-ink-700 mb-1.5">
            Role
          </label>
          <select
            id="new-admin-role"
            name="role"
            defaultValue="customer_support"
            className="h-10 px-3 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[13.5px]"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {ADMIN_ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 h-10 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create admin
        </button>
        {error && <div className="w-full text-[12.5px] text-rose-700">{error}</div>}
        {ok && <div className="w-full text-[12.5px] text-emerald-700">{ok}</div>}
      </form>
    );
  }

  // Mode: manage
  async function onRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await call({ action: "role", clerkUserId, role: e.target.value });
  }
  async function onDisable() {
    if (!confirm("Disable this admin? They lose access immediately. You can re-enable later.")) return;
    await call({ action: "disable", clerkUserId });
  }
  async function onEnable() {
    await call({ action: "enable", clerkUserId });
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        defaultValue={currentRole}
        disabled={busy || disabled}
        onChange={onRoleChange}
        className="h-8 px-2 rounded-md bg-paper ring-1 ring-ink-200 focus:ring-ink-400 focus:outline-none text-[12px]"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {ADMIN_ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      {disabled ? (
        <button onClick={onEnable} disabled={busy} className="text-[11.5px] text-emerald-700 hover:underline underline-offset-4 disabled:opacity-60">
          Re-enable
        </button>
      ) : (
        <button onClick={onDisable} disabled={busy} className="text-[11.5px] text-rose-700 hover:underline underline-offset-4 disabled:opacity-60">
          Disable
        </button>
      )}
      {busy && <Loader2 className="h-3 w-3 animate-spin text-ink-500" />}
      {error && <span className="text-[10.5px] text-rose-700 w-full">{error}</span>}
      {ok && <span className="text-[10.5px] text-emerald-700 w-full">{ok}</span>}
    </div>
  );
}
