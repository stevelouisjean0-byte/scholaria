/**
 * Early-access waitlist endpoint.
 *
 * Captures email + optional name and programme. Persists to a `waitlist`
 * table when a database is configured; otherwise logs the request so
 * Vercel logs surface every signup until the DB is provisioned.
 *
 * Returns 200 on success regardless of downstream persistence — the
 * worst case is the user thinks they are on the list when the row was
 * dropped, which is acceptable for an early-access flow.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("A valid email is required"),
  name: z.string().max(120).optional().default(""),
  program: z.string().max(240).optional().default(""),
  mode: z.enum(["signin", "signup"]).optional().default("signup")
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request" },
      { status: 400 }
    );
  }

  const entry = {
    email: body.email.trim().toLowerCase(),
    name: body.name.trim() || null,
    program: body.program.trim() || null,
    source: body.mode,
    receivedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? null,
    sourceIp: req.headers.get("x-forwarded-for") ?? null
  };

  // Attempt to persist. If DATABASE_URL is not set, the import will throw —
  // we catch and continue so the user always sees a clean success.
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      await db.query(
        `create table if not exists waitlist (
          id              bigserial primary key,
          email           text not null,
          name            text,
          program         text,
          source          text,
          received_at     timestamptz,
          user_agent      text,
          source_ip       text,
          inserted_at     timestamptz default now()
        )`
      );
      await db.query(
        `insert into waitlist (email, name, program, source, received_at, user_agent, source_ip)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          entry.email,
          entry.name,
          entry.program,
          entry.source,
          entry.receivedAt,
          entry.userAgent,
          entry.sourceIp
        ]
      );
    } catch (err) {
      console.warn("[waitlist] db persistence failed (continuing):", err);
    }
  } else {
    // Without a DB this is the only signal — surfaces in Vercel logs.
    console.log("[waitlist] new entry (no DB configured):", entry);
  }

  return NextResponse.json({ ok: true });
}
