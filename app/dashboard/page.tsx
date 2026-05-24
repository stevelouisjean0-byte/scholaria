import Link from "next/link";
import { FileText, Upload, Clock, ArrowRight, Sparkles } from "lucide-react";
import { clerkEnabled } from "@/lib/clerk-config";

async function getSignedInUser() {
  if (!clerkEnabled) return null;
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    return await currentUser();
  } catch {
    return null;
  }
}

export default async function StudentDashboard() {
  const user = await getSignedInUser();
  const displayName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]
      ?? "Dr. Patel";
  const greetingSubtitle = user
    ? user.emailAddresses?.[0]?.emailAddress ?? "Signed in to Scholaria"
    : "Ed.D. · Educational Leadership · Doctoral plan";
  const manuscripts = [
    { id: "ms_pra72", title: "Dissertation Ch. 3 — Methodology", stage: "Reviewing", progress: 64, readiness: 84 },
    { id: "ms_la2k0", title: "Literature Review v4", stage: "Delivered", progress: 100, readiness: 92 },
    { id: "ms_kb9zx", title: "Capstone proposal — sec. 1–4", stage: "QA", progress: 88, readiness: 79 }
  ];

  return (
    <section className="bg-paper min-h-screen">
      <div className="container py-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Student dashboard</div>
            <h1 className="font-serif text-3xl text-ink-900 mt-2">Welcome back, {displayName}.</h1>
            <p className="text-[14px] text-ink-600 mt-1">{greetingSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/billing" className="btn-secondary">Billing</Link>
            <Link href="/upload" className="btn-primary">
              <Upload className="h-4 w-4" />
              Upload manuscript
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-4">
          {[
            ["Active manuscripts", "3"],
            ["Reviews this month", "11"],
            ["Median readiness lift", "+18"],
            ["Submission window", "23 days"]
          ].map(([k, v]) => (
            <div key={k as string} className="col-span-6 lg:col-span-3 card p-5">
              <div className="text-[12px] text-ink-500">{k}</div>
              <div className="mt-1 font-serif text-3xl text-ink-900">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-8 card">
            <header className="flex items-center justify-between p-5 border-b border-ink-100">
              <h2 className="font-serif text-[18px] text-ink-900">Manuscripts</h2>
              <Link href="/upload" className="text-[13px] text-ink-700">Upload new →</Link>
            </header>
            <ul className="divide-y divide-ink-100">
              {manuscripts.map((m) => (
                <li key={m.id} className="p-5 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6 flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="text-[14px] text-ink-900">{m.title}</div>
                      <div className="text-[12px] text-ink-500 font-mono">{m.id}</div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2 text-[12px] text-ink-600">
                      <Clock className="h-3.5 w-3.5" /> {m.stage}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div className="h-full bg-ink-900" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-[12px] text-ink-500">Readiness</div>
                    <div className="font-serif text-2xl text-ink-900">{m.readiness}<span className="text-ink-400 text-base">/100</span></div>
                  </div>
                  <Link href={`/dashboard/manuscripts/${m.id}`} className="col-span-1 justify-self-end text-ink-700">
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 eyebrow">
                <Sparkles className="h-3.5 w-3.5" /> Concierge
              </div>
              <p className="mt-3 text-[14px] leading-6 text-ink-700">
                Hello, Dr. Patel. Chapter 3 is on track. The Research Support Agent flagged a synthesis gap
                on page 12 that the QA agent will ask you to address before delivery.
              </p>
              <Link href="/dashboard/concierge" className="mt-4 inline-flex items-center text-[13px] text-ink-900">
                Open concierge →
              </Link>
            </div>
            <div className="card p-5">
              <div className="eyebrow">Recent agent activity</div>
              <ul className="mt-3 space-y-2 text-[13px]">
                {[
                  ["Professional Editor", "Posted 4 findings · Ch. 3"],
                  ["Research Support", "Citation cross-check complete"],
                  ["QA & Final Approval", "Awaiting last review"],
                  ["Client Support", "Reminder set for Friday"]
                ].map(([a, s]) => (
                  <li key={a as string} className="flex items-center justify-between rounded-lg bg-paper ring-1 ring-ink-100 px-3 py-2">
                    <span className="text-ink-900">{a}</span>
                    <span className="text-ink-500">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
