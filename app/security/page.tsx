import type { Metadata } from "next";
import { PageMasthead } from "@/components/page-masthead";
import { SecurityIntegrity } from "@/components/sections/security-integrity";
import { PAGE_HEROES } from "@/lib/media";

export const metadata: Metadata = {
  title: "Security & Privacy",
  description:
    "How Scholaria handles unpublished doctoral research — encryption, FERPA-aware controls, single-tenant data isolation, SSO/SCIM, retention you control, audit trail.",
  alternates: { canonical: "/security" }
};

export default function SecurityPage() {
  return (
    <>
      <PageMasthead
        number="VI"
        eyebrow="Security & privacy"
        title="Institutional-grade controls for doctoral work."
        dek="Scholaria handles unpublished doctoral research. The platform is engineered to be safe to deploy inside a writing centre, graduate school, or research office without compromise."
        photo={PAGE_HEROES.enterprise}
      />
      <SecurityIntegrity />
    </>
  );
}
