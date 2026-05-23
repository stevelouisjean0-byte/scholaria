import { ContactForm } from "@/components/sections/contact-form";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Scholaria concierge, enterprise team, or press desk.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <>
      <PageMasthead
        number="IX"
        eyebrow="Correspondence with the desk"
        title="The desk that runs the platform is open to you."
        dek="The Client Support Agent triages every inbound message immediately and routes anything that requires programme coordination to the enterprise team."
        photo={PAGE_HEROES.contact}
      />
      <ContactForm />
    </>
  );
}
