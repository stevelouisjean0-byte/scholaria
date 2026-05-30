import { ContactForm } from "@/components/sections/contact-form";
import { PageMasthead } from "@/components/page-masthead";
import { PAGE_HEROES } from "@/lib/media";
import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Concierge support — email, phone, calendar. Mon–Fri 9am–7pm ET, Sat 10am–4pm ET. NYC office, NY/NJ/CT service area.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <>
      <PageMasthead
        number="IX"
        eyebrow="Contact"
        title="Talk to a real concierge — not a chatbot."
        dek="Concierge support is staffed by named humans during the hours below. Email is answered the same business day. For dissertation-defense emergencies on Dissertation Intensive, response is within the hour during operating hours."
        photo={PAGE_HEROES.contact}
      />

      <section className="section">
        <div className="container grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="lg:col-span-5 space-y-6">
            <div className="card-quiet p-6">
              <div className="eyebrow">Reach us directly</div>
              <ul className="mt-4 space-y-4 text-[14px] text-ink-800">
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    <div className="text-ink-900 font-medium">Concierge support</div>
                    <a href="mailto:concierge@dissertationeditingcenter.com" className="underline underline-offset-4">
                      concierge@dissertationeditingcenter.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    <div className="text-ink-900 font-medium">Enterprise & universities</div>
                    <a href="mailto:enterprise@dissertationeditingcenter.com" className="underline underline-offset-4">
                      enterprise@dissertationeditingcenter.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    <div className="text-ink-900 font-medium">Privacy & data requests</div>
                    <a href="mailto:privacy@dissertationeditingcenter.com" className="underline underline-offset-4">
                      privacy@dissertationeditingcenter.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    <div className="text-ink-900 font-medium">Phone (US)</div>
                    <a href="tel:+19295552468" className="underline underline-offset-4">
                      (929) 555-2468
                    </a>
                    <div className="text-[12.5px] text-ink-500 mt-0.5">Dissertation Intensive & Enterprise priority line</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card-quiet p-6">
              <div className="eyebrow">Hours of operation</div>
              <ul className="mt-4 space-y-2 text-[14px] text-ink-800">
                <li className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    <div>Monday–Friday · 9:00am–7:00pm ET</div>
                    <div>Saturday · 10:00am–4:00pm ET</div>
                    <div className="text-ink-500">Sunday — concierge email only</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card-quiet p-6">
              <div className="eyebrow">Office</div>
              <ul className="mt-4 space-y-3 text-[14px] text-ink-800">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    Dissertation Editing Center<br />
                    228 Park Avenue South #57828<br />
                    New York, NY 10003-1502
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-1 text-ink-500 shrink-0" />
                  <div>
                    Service area: New York · New Jersey · Connecticut and remote nationwide
                  </div>
                </li>
              </ul>
            </div>

            <div className="card-quiet p-6">
              <div className="eyebrow">Response SLAs by plan</div>
              <dl className="mt-3 space-y-2 text-[13.5px]">
                <SLA k="Free Trial" v="Within 2 business days" />
                <SLA k="Graduate" v="Within 1 business day" />
                <SLA k="Doctoral" v="Within 4 business hours" />
                <SLA k="Dissertation Intensive" v="Within 1 business hour" />
                <SLA k="Enterprise" v="Per contract" />
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function SLA({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-100 pb-2 last:border-b-0">
      <dt className="text-ink-500">{k}</dt>
      <dd className="text-ink-900 text-right">{v}</dd>
    </div>
  );
}
