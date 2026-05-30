/**
 * Admin authorization — role checks + audit logging.
 *
 * Role storage:
 * - Primary: Clerk publicMetadata.adminRole on the user object.
 * - Auto-seed: any user whose primary email matches SUPER_ADMIN_EMAILS env var
 *   (comma-separated) is treated as super_admin even before Clerk metadata is
 *   set. First time they hit /admin, we set their publicMetadata so subsequent
 *   checks don't depend on the env var.
 *
 * Audit log:
 * - admins table tracks role + disabled state per Clerk user_id.
 * - admin_logins table appends one row per /admin visit (route, IP, UA).
 * - admin_events table appends one row per admin write action (create admin,
 *   change role, disable admin, etc.).
 */
import { db } from "./db";
import { clerkEnabled } from "./clerk-config";

export type AdminRole =
  | "super_admin"
  | "business_owner"
  | "ops_manager"
  | "editor"
  | "customer_support";

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  business_owner: "Business Owner",
  ops_manager: "Operations Manager",
  editor: "Editor",
  customer_support: "Customer Support"
};

export const ADMIN_ROLES: AdminRole[] = [
  "super_admin",
  "business_owner",
  "ops_manager",
  "editor",
  "customer_support"
];

export interface AdminContext {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  isSeeded: boolean; // matched SUPER_ADMIN_EMAILS env, not yet in admins table
}

function superAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolve the current request's admin context. Returns null when:
 * - Clerk not configured
 * - User not signed in
 * - User signed in but not an admin
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  if (!clerkEnabled) return null;

  let userId: string | null = null;
  let email: string | null = null;
  let name = "";

  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return null;
    userId = user.id;
    email = (user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "").toLowerCase();
    name = [user.firstName, user.lastName].filter(Boolean).join(" ") || email || user.id;
  } catch {
    return null;
  }
  if (!userId || !email) return null;

  // 1. Check the admins table (canonical).
  try {
    await ensureAdminTables();
    const { rows } = await db.query(
      "select role, disabled_at from admins where clerk_user_id = $1 limit 1",
      [userId]
    );
    if (rows[0]) {
      if (rows[0].disabled_at) return null;
      return {
        userId,
        email,
        name,
        role: rows[0].role as AdminRole,
        isSeeded: false
      };
    }
  } catch (err) {
    console.warn("[admin] lookup failed:", err);
  }

  // 2. Auto-seed if email matches SUPER_ADMIN_EMAILS.
  const seedSet = superAdminEmails();
  if (seedSet.includes(email)) {
    try {
      await ensureAdminTables();
      await db.query(
        `insert into admins (clerk_user_id, email, name, role, created_at)
         values ($1, $2, $3, 'super_admin', now())
         on conflict (clerk_user_id) do update set email = excluded.email, name = excluded.name`,
        [userId, email, name]
      );
      return { userId, email, name, role: "super_admin", isSeeded: true };
    } catch (err) {
      console.warn("[admin] seed failed:", err);
      // Even if DB seed fails, allow access — env var match is authoritative for super admins.
      return { userId, email, name, role: "super_admin", isSeeded: true };
    }
  }

  return null;
}

/**
 * Record an admin page visit. Best-effort; never blocks the request.
 */
export async function recordAdminVisit(
  ctx: AdminContext,
  route: string,
  meta: { ip?: string | null; userAgent?: string | null } = {}
): Promise<void> {
  try {
    await ensureAdminTables();
    await db.query(
      `insert into admin_logins (clerk_user_id, email, route, ip, user_agent, created_at)
       values ($1, $2, $3, $4, $5, now())`,
      [ctx.userId, ctx.email, route, meta.ip ?? null, meta.userAgent ?? null]
    );
    await db.query(
      "update admins set last_login_at = now() where clerk_user_id = $1",
      [ctx.userId]
    );
  } catch (err) {
    console.warn("[admin] recordVisit failed:", err);
  }
}

/**
 * Record an admin write action (create admin, change role, disable admin).
 */
export async function recordAdminEvent(
  ctx: AdminContext,
  event: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    await ensureAdminTables();
    await db.query(
      `insert into admin_events (clerk_user_id, email, event, payload, created_at)
       values ($1, $2, $3, $4::jsonb, now())`,
      [ctx.userId, ctx.email, event, JSON.stringify(payload)]
    );
  } catch (err) {
    console.warn("[admin] recordEvent failed:", err);
  }
}

/**
 * List all admins.
 */
export interface AdminRow {
  clerk_user_id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  created_at: Date;
  last_login_at: Date | null;
  disabled_at: Date | null;
  created_by: string | null;
}

export async function listAdmins(): Promise<AdminRow[]> {
  try {
    await ensureAdminTables();
    const { rows } = await db.query(
      `select clerk_user_id, email, name, role, created_at, last_login_at, disabled_at, created_by
         from admins
         order by created_at asc`
    );
    return rows as AdminRow[];
  } catch (err) {
    console.warn("[admin] list failed:", err);
    return [];
  }
}

export async function listAdminLogins(limit = 100): Promise<
  Array<{ email: string; route: string; ip: string | null; user_agent: string | null; created_at: Date }>
> {
  try {
    await ensureAdminTables();
    const { rows } = await db.query(
      `select email, route, ip, user_agent, created_at
         from admin_logins
         order by created_at desc
         limit $1`,
      [limit]
    );
    return rows as any;
  } catch {
    return [];
  }
}

let tablesReady = false;
async function ensureAdminTables(): Promise<void> {
  if (tablesReady) return;
  await db.query(`
    create table if not exists admins (
      clerk_user_id text primary key,
      email text not null,
      name text,
      role text not null default 'customer_support',
      created_at timestamptz not null default now(),
      created_by text,
      last_login_at timestamptz,
      disabled_at timestamptz
    )
  `);
  await db.query(`create index if not exists admins_email_idx on admins(lower(email))`);
  await db.query(`
    create table if not exists admin_logins (
      id bigserial primary key,
      clerk_user_id text not null,
      email text not null,
      route text not null,
      ip text,
      user_agent text,
      created_at timestamptz not null default now()
    )
  `);
  await db.query(`create index if not exists admin_logins_user_idx on admin_logins(clerk_user_id, created_at desc)`);
  await db.query(`
    create table if not exists admin_events (
      id bigserial primary key,
      clerk_user_id text not null,
      email text not null,
      event text not null,
      payload jsonb,
      created_at timestamptz not null default now()
    )
  `);
  tablesReady = true;
}
