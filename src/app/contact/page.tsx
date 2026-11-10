import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  PhoneCallIcon,
  PlaneIcon,
  ShieldCheckIcon,
  TrainIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title:
    "Contact Us | TravelAdda Support, Editorial, API & Commercial Partnerships",
  description:
    "Contact TravelAdda for general support, editorial corrections, advertising & commercial partnerships, or privacy inquiries—plus quick links to official airline & Indian Railways helplines.",
  keywords: [
    "contact traveladda",
    "traveladda customer support email",
    "traveladda advertising partnerships",
    "railway and airline helpline directory",
  ],
  alternates: {
    canonical: "/contact",
  },
};

const CONTACT_DESKS = [
  {
    title: "General User Support & Tool Feedback",
    email: "support@traveladda.in",
    sla: "Response within 24 hours",
    desc: "Report a bug on our Live Flight Status, Live Train Radar, 10-Digit PNR Checker, or Hotel GST Calculator, or suggest a new travel utility.",
  },
  {
    title: "Editorial, Fact-Checking & Press Desk",
    email: "editorial@traveladda.in",
    sla: "Response within 24–48 hours",
    desc: "Request an update to airport terminal maps, airline baggage policies, railway quota rules, or destination travel guides.",
  },
  {
    title: "Commercial, Advertising & Partnerships",
    email: "partnerships@traveladda.in",
    sla: "Response within 24 hours",
    desc: "Inquire about brand sponsorships, OTA/airline/hotel affiliate integrations, custom travel widgets, or media kit requests.",
  },
  {
    title: "Privacy, Legal & Grievance Redressal Officer",
    email: "privacy@traveladda.in",
    sla: "Priority 48-hour SLA",
    desc: "Data protection queries under the Indian DPDP Act 2023, copyright/trademark notices, and formal regulatory correspondence.",
  },
];

export default async function ContactPage() {
  "use cache";
  cacheLife("days");

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact TravelAdda",
    url: "https://traveladda.in/contact",
    mainEntity: {
      "@type": "Organization",
      name: "TravelAdda",
      url: "https://traveladda.in",
      email: "support@traveladda.in",
      contactPoint: CONTACT_DESKS.map((d) => ({
        "@type": "ContactPoint",
        contactType: d.title,
        email: d.email,
        availableLanguage: ["English", "Hindi"],
      })),
    },
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">Contact Us</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Contact TravelAdda Support, Editorial &amp; Commercial Desks
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Have feedback on a live flight or train tool, an editorial update,
              or a commercial partnership inquiry? Reach the right team directly
              below.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-5xl space-y-8 px-4 sm:mt-10 sm:px-6 lg:px-8">
        {/* 4 Dedicated Contact Cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          {CONTACT_DESKS.map((desk) => (
            <div
              key={desk.email}
              className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-2xs sm:p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {desk.sla}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-extrabold text-ink sm:text-lg">
                  {desk.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {desk.desc}
                </p>
              </div>

              <div className="mt-5 border-t border-line pt-3.5">
                <a
                  href={`mailto:${desk.email}`}
                  className="inline-flex items-center gap-2 font-mono text-sm font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  <span>{desk.email}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </section>

        {/* Urgent Passenger Assistance Notice (RailMadad / Airline Helplines) */}
        <section className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <PhoneCallIcon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Need Urgent Ticket Refund, Baggage Claim, or Onboard Railway Assistance?
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
                Please note that TravelAdda is a live status and travel utility
                platform and does not issue airline or IRCTC tickets. For
                onboard emergencies, ticket cancellations, or delayed baggage
                claims, contact the official operator directly:
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-line bg-subcard p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <TrainIcon className="h-4 w-4 text-emerald-600" />
                    <span>Indian Railways (RailMadad)</span>
                  </p>
                  <p className="mt-1 font-mono text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                    Dial 139 (24x7 Toll-Free)
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    Coach cleanliness, medical help &amp; security
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-subcard p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <PlaneIcon className="h-4 w-4 text-[#1956b4]" />
                    <span>24x7 Airline Helplines</span>
                  </p>
                  <Link
                    href="/air/flight-status#airlines-directory"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
                  >
                    <span>Open Airline Directory</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    Direct numbers for IndiGo, Air India, Akasa &amp; more
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-subcard p-3.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <ShieldCheckIcon className="h-4 w-4 text-[#fc6203]" />
                    <span>DGCA AirSewa Portal</span>
                  </p>
                  <p className="mt-1 text-xs font-bold text-ink">
                    airsewa.gov.in
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    Official aviation grievance &amp; delay compensation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

