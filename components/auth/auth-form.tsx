"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail, Lock, Github, Chrome } from "lucide-react";

interface AuthFormProps {
  mode: "signin" | "signup";
}

/**
 * Auth placeholder UI — looks and feels like a real sign-in / sign-up screen
 * so the navigation reads as a real product, while the form submits to the
 * waitlist endpoint until Clerk credentials are configured. When Clerk is
 * wired, this component is replaced by Clerk's <SignIn /> / <SignUp />
 * components and the same route paths remain valid.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name, program, mode })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setState("success");
      setMessage("You're on the early-access list. We'll be in touch the moment authentication opens.");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-7 lg:p-8">
        {/* Status banner */}
        <div className="mb-6 rounded-xl bg-amber-50 ring-1 ring-amber-700/15 p-3.5 text-[12.5px] text-amber-900 leading-snug">
          <strong className="font-semibold">Early access.</strong> Account creation opens once institutional
          identity is configured. Submit your email and we'll notify you the day it's live.
        </div>

        <h1 className="font-semibold text-[24px] text-ink-900 leading-tight">
          {isSignup ? "Create a Scholaria account" : "Sign in to Scholaria"}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-600">
          {isSignup
            ? "For doctoral candidates, graduate researchers, and institutional administrators."
            : "Welcome back. Sign in to track manuscripts, review reports, and download deliverables."}
        </p>

        {/* OAuth buttons (visually wired, functionally disabled until Clerk) */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg ring-1 ring-ink-200 text-[13px] text-ink-700 bg-white opacity-60 cursor-not-allowed"
            title="OAuth activates once Clerk is configured"
          >
            <Chrome className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 h-10 rounded-lg ring-1 ring-ink-200 text-[13px] text-ink-700 bg-white opacity-60 cursor-not-allowed"
            title="OAuth activates once Clerk is configured"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[11.5px] text-ink-400">
          <span className="flex-1 h-px bg-ink-200" />
          <span>or with email</span>
          <span className="flex-1 h-px bg-ink-200" />
        </div>

        {state === "success" ? (
          <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-700/15 p-4 text-[13.5px] text-emerald-900 flex gap-3">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">You're on the list.</div>
              <div className="mt-1">{message}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3.5">
            {isSignup && (
              <Field
                label="Name"
                name="name"
                value={name}
                onChange={setName}
                placeholder="Dr. M. Patel"
                required
              />
            )}
            <Field
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@institution.edu"
              required
              icon={<Mail className="h-3.5 w-3.5" />}
            />
            {isSignup && (
              <Field
                label="Programme"
                name="program"
                value={program}
                onChange={setProgram}
                placeholder="Ph.D. Educational Leadership · NYU Steinhardt"
              />
            )}
            <Field
              label="Password"
              name="password"
              type="password"
              value=""
              onChange={() => {}}
              placeholder="Activates with Clerk"
              disabled
              icon={<Lock className="h-3.5 w-3.5" />}
            />

            <button
              type="submit"
              disabled={state === "submitting" || !email}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-ink-900 text-white text-[14px] font-medium hover:bg-ink-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
              {state === "submitting"
                ? "Joining…"
                : isSignup
                ? "Request early access"
                : "Notify me when sign-in opens"}
            </button>

            {state === "error" && message && (
              <div className="rounded-xl bg-rose-50 ring-1 ring-rose-700/15 p-3 text-[12.5px] text-rose-900 flex gap-2">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-ink-100 text-[12.5px] text-ink-500">
          {isSignup ? (
            <>Already on the early-access list? <a className="text-ink-900 hover:underline underline-offset-[6px] decoration-1" href="/signin">Sign in</a></>
          ) : (
            <>New to Scholaria? <a className="text-ink-900 hover:underline underline-offset-[6px] decoration-1" href="/signup">Request early access</a></>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-[11.5px] text-ink-500 leading-relaxed">
        By continuing you accept our <a className="underline underline-offset-[4px]" href="/terms">Terms of Service</a> and{" "}
        <a className="underline underline-offset-[4px]" href="/privacy">Privacy Policy</a>.
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  icon
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11.5px] uppercase tracking-[0.2em] text-ink-500 font-medium mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full h-11 rounded-xl bg-white ring-1 ring-ink-200 focus:ring-ink-900 focus:outline-none text-[14px] text-ink-900 placeholder:text-ink-400 ${
            icon ? "pl-9" : "pl-3.5"
          } pr-3.5 disabled:bg-ink-50 disabled:cursor-not-allowed disabled:text-ink-400`}
        />
      </div>
    </div>
  );
}
