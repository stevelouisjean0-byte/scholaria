import {
  requireAdmin,
  listAdmins,
  listAdminLogins,
  ADMIN_ROLE_LABEL,
  ADMIN_ROLES,
  AdminRow
} from "@/lib/admin";
import { AdminManagementForm } from "@/components/admin/admin-management-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default async function AdminsPage() {
  const current = await requireAdmin();
  if (!current) return null;

  const [admins, logins] = await Promise.all([listAdmins(), listAdminLogins(50)]);
  const canManage = current.role === "super_admin";

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px]">
      <div className="eyebrow">Admin team</div>
      <h1 className="mt-3 h-display-serif text-[28px] lg:text-[34px] leading-tight">
        {admins.length} admin account{admins.length === 1 ? "" : "s"}
      </h1>
      <p className="mt-2 text-[14px] text-ink-600">
        {canManage
          ? "As Super Admin, you can create new admin accounts, change roles, or disable access."
          : `You are signed in as ${ADMIN_ROLE_LABEL[current.role]}. Only Super Admins can manage the admin team.`}
      </p>

      {/* Create form */}
      {canManage && (
        <div className="mt-8 card p-6">
          <div className="eyebrow">Invite a new admin</div>
          <p className="mt-2 text-[13px] text-ink-600">
            The invitee must already have a Clerk account (or create one when they first sign in
            at <code className="font-mono text-[12px]">/signin</code>). On their first visit to
            <code className="font-mono text-[12px]">/admin</code> they'll have the role you assign.
          </p>
          <div className="mt-5">
            <AdminManagementForm mode="create" roles={ADMIN_ROLES} />
          </div>
        </div>
      )}

      {/* Admins table */}
      <div className="mt-8 card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <div className="eyebrow">Team roster</div>
        </div>
        {admins.length === 0 ? (
          <div className="p-10 text-center text-ink-500">No admins yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">Person</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Created</th>
                  <th className="py-3 pr-4 font-medium">Last login</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  {canManage && <th className="py-3 pr-5 font-medium">Manage</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {admins.map((a) => (
                  <AdminRowView key={a.clerk_user_id} admin={a} currentUserId={current.userId} canManage={canManage} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Login history */}
      <div className="mt-8 card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100">
          <div className="eyebrow">Recent admin logins</div>
          <div className="font-serif text-[16px] text-ink-900 mt-0.5">Last {logins.length} visits</div>
        </div>
        {logins.length === 0 ? (
          <div className="p-8 text-center text-ink-500 text-[13.5px]">No login activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[700px]">
              <thead className="bg-paper border-b border-ink-100">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.16em] text-ink-500">
                  <th className="py-3 pl-5 pr-4 font-medium">When</th>
                  <th className="py-3 pr-4 font-medium">Admin</th>
                  <th className="py-3 pr-4 font-medium">Route</th>
                  <th className="py-3 pr-4 font-medium">IP</th>
                  <th className="py-3 pr-5 font-medium">User agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {logins.map((l, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pl-5 pr-4 text-ink-600 whitespace-nowrap">{fmtTime(l.created_at)}</td>
                    <td className="py-2.5 pr-4 text-ink-900">{l.email}</td>
                    <td className="py-2.5 pr-4 font-mono text-[11.5px] text-ink-700">{l.route}</td>
                    <td className="py-2.5 pr-4 font-mono text-[11.5px] text-ink-500">{l.ip ?? "—"}</td>
                    <td className="py-2.5 pr-5 text-[11.5px] text-ink-500 truncate max-w-[280px]" title={l.user_agent ?? ""}>
                      {l.user_agent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminRowView({
  admin,
  currentUserId,
  canManage
}: {
  admin: AdminRow;
  currentUserId: string;
  canManage: boolean;
}) {
  const isMe = admin.clerk_user_id === currentUserId;
  const isDisabled = !!admin.disabled_at;
  return (
    <tr className={isDisabled ? "opacity-60" : ""}>
      <td className="py-3.5 pl-5 pr-4 align-top">
        <div className="text-ink-900">{admin.name ?? admin.email}</div>
        <div className="text-[11.5px] text-ink-500">{admin.email}</div>
        {isMe && <div className="text-[10.5px] text-emerald-700 mt-0.5">you</div>}
      </td>
      <td className="py-3.5 pr-4 align-top">
        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-ink-100 text-ink-800">
          {ADMIN_ROLE_LABEL[admin.role]}
        </span>
      </td>
      <td className="py-3.5 pr-4 align-top text-ink-600 whitespace-nowrap">{fmtTime(admin.created_at)}</td>
      <td className="py-3.5 pr-4 align-top text-ink-600 whitespace-nowrap">{fmtTime(admin.last_login_at)}</td>
      <td className="py-3.5 pr-4 align-top">
        {isDisabled ? (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800">
            disabled
          </span>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
            active
          </span>
        )}
      </td>
      {canManage && (
        <td className="py-3.5 pr-5 align-top">
          {isMe ? (
            <span className="text-[11.5px] text-ink-400 italic">cannot modify yourself</span>
          ) : (
            <AdminManagementForm
              mode="manage"
              clerkUserId={admin.clerk_user_id}
              currentRole={admin.role}
              disabled={isDisabled}
              roles={ADMIN_ROLES}
            />
          )}
        </td>
      )}
    </tr>
  );
}
