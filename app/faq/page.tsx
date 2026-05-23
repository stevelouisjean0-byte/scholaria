import { FAQ } from "@/components/sections/faq";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about Scholaria — privacy, formatting, turnaround, and academic integrity.",
  alternates: { canonical: "/faq" }
};

export default function FAQPage() {
  return (
    <>
      <PageMasthead
        number="VIII"
        eyebrow="Frequently raised at intake"
        title="Questions, answered like a registrar would answer them."
        dek="No progressive disclosure on desktop. Doctoral users have done enough hunting for the day."
        photo={PAGE_HEROES.faq}
      />
      <FAQ />
    </>
  );
}
