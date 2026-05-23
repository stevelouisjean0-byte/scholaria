"use client";
import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = new FormData(e.currentTarget);
    await fetch("/api/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: `Contact form (${data.get("topic")}) from ${data.get("email")} — ${data.get("name")}:\n\n${data.get("message")}`
      })
    }).catch(() => null);
    setState("sent");
  }

  return (
    <section className="section bg-paper">
      <div className="container">
        <header className="chapter">
          <span className="roman">IX.</span>
          <span className="label">Correspondence with the desk</span>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <h2 className="font-serif text-[40px] lg:text-[52px] leading-[1.05] tracking-[-0.025em] text-ink-900 balance">
            Speak with the desk that runs the platform.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.75] text-ink-700 max-w-prose">
            The Client Support Agent triages every inbound message immediately and routes anything that
            requires program coordination to the enterprise team. Most questions receive a substantive
            answer the same hour.
          </p>
          <dl className="mt-8 space-y-3 text-[14px] border-t border-ink-200 pt-6">
            <div className="flex justify-between"><dt className="text-ink-500 italic">Concierge</dt><dd className="text-ink-900">concierge@scholaria.ai</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500 italic">Enterprise</dt><dd className="text-ink-900">enterprise@scholaria.ai</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500 italic">Press</dt><dd className="text-ink-900">press@scholaria.ai</dd></div>
          </dl>
        </div>
        <form onSubmit={submit} className="lg:col-span-7 card p-7 grid sm:grid-cols-2 gap-4">
          <Field label="Name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Institution" name="institution" />
          <Select label="Topic" name="topic" options={["Manuscript review", "Pricing", "Enterprise / university", "Other"]} />
          <div className="sm:col-span-2">
            <label className="eyebrow">Message</label>
            <textarea
              name="message"
              rows={5}
              required
              className="mt-2 w-full rounded-xl bg-white ring-1 ring-ink-200 focus:ring-ink-900 focus:outline-none px-3.5 py-3 text-[14.5px]"
              placeholder="Brief context about your program, manuscript, or timeline."
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            <span className="text-[12px] text-ink-500">By submitting, you accept our privacy and academic-integrity terms.</span>
            <button className="btn-primary" disabled={state === "sending"}>
              {state === "sent" ? "Received" : state === "sending" ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="eyebrow">{label}</label>
      <input
        name={name}
        type={type}
        required
        className="mt-2 w-full h-11 rounded-xl bg-white ring-1 ring-ink-200 focus:ring-ink-900 focus:outline-none px-3.5 text-[14.5px]"
      />
    </div>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div>
      <label className="eyebrow">{label}</label>
      <select
        name={name}
        defaultValue={options[0]}
        className="mt-2 w-full h-11 rounded-xl bg-white ring-1 ring-ink-200 focus:ring-ink-900 focus:outline-none px-3.5 text-[14.5px]"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
