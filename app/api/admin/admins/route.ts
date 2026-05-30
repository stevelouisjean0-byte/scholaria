import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, recordAdminEvent, ADMIN_ROLES, AdminRole } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-team management endpoint. Only super_admins may write.
 *
 * Body shape:
 *   { action: "create", email: string, role: AdminRole }
 *   { action: "role",   clerkUserId: string, role: AdminRole }
 *   { action: "disable", clerkUserId: string }
 *   { action: "enable",  clerkUserId: string }
 */
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (ctx.role !== "super_admin") {
    return NextResponse.json({ error: "Only Super Admins can manage admins." }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = String(body?.action ?? "");

  if (action === "create") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = String(body.role ?? "") as AdminRole;
    if (!/.+@.+\..+/.test(email)) return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    if (!ADMIN_ROLES.includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });

    // Try to resolve the Clerk user_id for this email so we can link
    // immediately. If the person hasn't signed up yet, store a pending row
    // by email; they'll get matched on first sign-in.
    let clerkUserId: string | null = null;
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const { data: users } = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 1 });
      if (users[0]) clerkUserId = users[0].id;
    } catch (err) {
      console.warn("[admin/admins] clerk lookup failed:", err);
    }

    if (!clerkUserId) {
      // Pending invite — store keyed by email; the requireAdmin() seed path
      // also covers this case so the user just needs to sign in once with
      // this email and they get auto-linked.
      try {
        await db.query(
          `insert into admins (clerk_user_id, email, name, role, created_at, created_by)
           values ($1, $2, $3, $4, now(), $5)
           on conflict (clerk_user_id) do update
             set role = excluded.role, disabled_at = null, email = excluded.email`,
          [`pending:${email}`, email, email, role, ctx.userId]
        );
      } catch (err) {
        return NextResponse.json({ error: "Database write failed.", detail: String(err) }, { status: 500 });
      }
      await recordAdminEvent(ctx, "admin.invite_pending", { email, role });
      return NextResponse.json({
        ok: true,
        message: `Invite recorded for ${email}. They get ${role} role on first sign-in.`
      });
    }

    try {
      await db.query(
        `insert into admins (clerk_user_id, email, name, role, created_at, created_by)
         values ($1, $2, $3, $4, now(), $5)
         on conflict (clerk_user_id) do update
           set role = excluded.role, disabled_at = null, email = excluded.email`,
        [clerkUserId, email, email, role, ctx.userId]
      );
    } catch (err) {
      return NextResponse.json({ error: "Database write failed.", detail: String(err) }, { status: 500 });
    }
    await recordAdminEvent(ctx, "admin.create", { email, role, clerkUserId });
    return NextResponse.json({ ok: true, message: `Admin ${email} created with role ${role}.` });
  }

  if (action === "role") {
    const clerkUserId = String(body.clerkUserId ?? "");
    const role = String(body.role ?? "") as AdminRole;
    if (!clerkUserId) return NextResponse.json({ error: "clerkUserId required." }, { status: 400 });
    if (!ADMIN_ROLES.includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    if (clerkUserId === ctx.userId) return NextResponse.json({ error: "Cannot change your own role." }, { status: 400 });
    try {
      await db.query("update admins set role = $2 where clerk_user_id = $1", [clerkUserId, role]);
    } catch (err) {
      return NextResponse.json({ error: "Database write failed.", detail: String(err) }, { status: 500 });
    }
    await recordAdminEvent(ctx, "admin.role_change", { clerkUserId, role });
    return NextResponse.json({ ok: true, message: `Role updated to ${role}.` });
  }

  if (action === "disable") {
    const clerkUserId = String(body.clerkUserId ?? "");
    if (!clerkUserId) return NextResponse.json({ error: "clerkUserId required." }, { status: 400 });
    if (clerkUserId === ctx.userId) return NextResponse.json({ error: "Cannot disable yourself." }, { status: 400 });
    try {
      await db.query("update admins set disabled_at = now() where clerk_user_id = $1", [clerkUserId]);
    } catch (err) {
      return NextResponse.json({ error: "Database write failed.", detail: String(err) }, { status: 500 });
    }
    await recordAdminEvent(ctx, "admin.disable", { clerkUserId });
    return NextResponse.json({ ok: true, message: "Admin disabled." });
  }

  if (action === "enable") {
    const clerkUserId = String(body.clerkUserId ?? "");
    if (!clerkUserId) return NextResponse.json({ error: "clerkUserId required." }, { status: 400 });
    try {
      await db.query("update admins set disabled_at = null where clerk_user_id = $1", [clerkUserId]);
    } catch (err) {
      return NextResponse.json({ error: "Database write failed.", detail: String(err) }, { status: 500 });
    }
    await recordAdminEvent(ctx, "admin.enable", { clerkUserId });
    return NextResponse.json({ ok: true, message: "Admin re-enabled." });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
