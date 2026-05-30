import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin, recordAdminVisit, ADMIN_ROLE_LABEL } from "@/lib/admin";
import { clerkEnabled } from "@/lib/clerk-config";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Activity,
  ShieldCheck,
  ServerCog,
  LogOut,
  ArrowLeftRight
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
  { href: "/admin/purchases", label: "Orders", icon: CreditCard },
  { href: "/admin/users", label: "Customers", icon: Users },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { href: "/admin/system", label: "System", icon: ServerCog }
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Block access entirely when Clerk isn't configured — otherwise the admin
  // surfaces would be wide open in any environment missing the auth keys.
  if (!clerkEnabled) {
    return (
      <section className="bg-canvas min-h-screen">
        <div className="container py-20 max-w-2xl">
          <div className="card p-8">
            <h1 className="font-serif text-2xl text-ink-900">Admin portal unavailable</h1>
            <p className="mt-3 text-[14px] text-ink-700">
              Clerk authentication is not configured on this deployment. The admin portal cannot
              be served without an auth layer. Set <code className="font-mono text-[12.5px]">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>{" "}
              and <code className="font-mono text-[12.5px]">CLERK_SECRET_KEY</code> on Vercel,
              then redeploy.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const admin = await requireAdmin();
  if (!admin) {
    // Pass-through redirect to sign-in with admin destination so Clerk returns
    // the user here after login.
    redirect("/signin?redirect_url=/admin");
  }

  // Best-effort audit log of this visit. Non-blocking.
  const h = headers();
  await recordAdminVisit(admin, "/admin", {
    ip: h.get("x-forwarded-for"),
    userAgent: h.get("user-agent")
  });

  return (
    <section className="bg-canvas min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-ink-900 text-white flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="font-serif text-[18px] leading-tight">Admin Portal</div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-white/50 mt-1">
            Dissertation Editing Center
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] text-white/80 hover:text-white hover:bg-white/5 transition"
            >
              <item.icon className="h-4 w-4 shrink-0 text-white/60" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[12.5px] text-white/60 hover:text-white transition"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Back to public site
          </Link>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9 ring-1 ring-white/20" } }} />
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] text-white truncate">{admin.name}</div>
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-white/50">
                {ADMIN_ROLE_LABEL[admin.role]}
              </div>
            </div>
          </div>
          {admin.isSeeded && (
            <div className="text-[11px] text-amber-300 leading-tight">
              Seeded via SUPER_ADMIN_EMAILS — first login. Future logins use the admins table.
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ink-900 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-serif text-[15px]">Admin Portal</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">
            {ADMIN_ROLE_LABEL[admin.role]}
          </div>
        </div>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-900 text-white border-t border-white/10 grid grid-cols-7">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center py-2 text-white/70 hover:text-white">
            <item.icon className="h-4 w-4" />
            <span className="text-[9px] mt-0.5">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      <main className="flex-1 min-w-0 lg:pt-0 pt-14 pb-20 lg:pb-0">{children}</main>
    </section>
  );
}
