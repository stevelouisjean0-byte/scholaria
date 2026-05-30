/**
 * Client-safe admin role constants. Never import server-only modules
 * (Clerk SDK, pg, etc.) from here — this module is imported by client
 * components.
 */
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
