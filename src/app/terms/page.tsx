import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AlertCircleIcon, CheckCircleIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title:
    "Terms of Service & Official Disclaimer | TravelAdda Flight, Train & PNR Portal",
  description:
    "Review TravelAdda's Terms of Use, Non-Affiliation Disclaimer regarding Indian Railways (IRCTC/CRIS/NTES) and Airlines, accuracy guidelines, and commercial terms.",
  keywords: [
    "traveladda terms of service",
    "traveladda disclaimer",
    "indian railways pnr status disclaimer",
    "live flight status terms of use",
  ],
  alternates: {
    canonical: "/terms",
  },
};

const TERMS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using TravelAdda (https://traveladda.in), including our Live Flight Status Tracker, Live Train Running Status Radar, 10-Digit PNR Status Checker, Airline Baggage Allowance Calculator, Hotel Room GST Calculator, and editorial travel guides, you agree to be bound by these Terms of Service and our Privacy Policy.",
  },
  {
    title:
      "2. Official Non-Affiliation Disclaimer (Railways, Airlines & Government Bodies)",
    body: "TravelAdda is an independent, privately operated travel utility and information portal. We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Indian Railways, IRCTC (Indian Railway Catering and Tourism Corporation), CRIS (Centre for Railway Information Systems), NTES (National Train Enquiry System), the Ministry of Civil Aviation, DGCA, Airports Authority of India (AAI), or any individual domestic or international airline. All product, airline, and company names, logos, and IATA/ICAO codes are trademarks or registered trademarks of their respective holders and are used strictly for informational identification under nominative fair use.",
  },
  {
    title:
      "3. Informational Purpose & Airport / Railway Reporting Buffer Advisory",
    body: "While TravelAdda uses real-time API-to-API telemetry to display flight schedules, terminal and gate assignments, train running status, coach positions, and 10-digit PNR confirmations, live transport operations can change rapidly due to ATC directives, weather, fog, or railway signalling. Users must always verify final boarding gates on airport FIDS screens, confirm train platform numbers at the station, and arrive at airports (2–3 hours prior) and railway stations (30 minutes prior) based on original scheduled departure times.",
  },
  {
    title: "4. Hotel GST & Fare Calculations",
    body: "Our Indian Hotel Room GST Calculator (0%, 12%, and 18% slabs) and airfare/train comparisons are provided as estimation tools based on prevailing GST Council notifications and published carrier tariffs. Actual invoices issued by hotels, OTAs, or airlines may include state/municipal fees, convenience fees, or ancillary add-ons.",
  },
  {
    title: "5. Acceptable Use & API Protection",
    body: "You may use TravelAdda's tools for personal, non-commercial travel planning. Automated scraping, high-frequency bot querying, reverse engineering, or unauthorized redistribution of our `/api/pnr`, `/api/trains`, or `/api/flights` endpoints is strictly prohibited and protected by automated rate-limiting.",
  },
  {
    title: "6. Limitation of Liability & Governing Law",
    body: "TravelAdda and its contributors provide all tools and content on an 'as-is' and 'as-available' basis without warranties of any kind. Under no circumstances shall TravelAdda be liable for missed flights, missed trains, unconfirmed waitlisted tickets, or financial losses arising from reliance on live status estimates. These terms are governed by the laws of India.",
  },
];

export default async function TermsPage() {
  "use cache";
  cacheLife("days");

  return (
    <main className="pb-16 sm:pb-24">
      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">
              Terms &amp; Disclaimer
            </span>
          </nav>

          <div className="mt-4">
            <span className="inline-block rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Legal &amp; Commercial Compliance
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Terms of Service &amp; Official Disclaimer
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Important usage terms, non-affiliation disclosures, and passenger
              reporting advisories for TravelAdda users.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-4 sm:mt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/70 p-5 dark:bg-amber-500/10 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Passenger Reporting Reminder
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink sm:text-sm">
                Even if a flight or train shows delayed on live radar, airlines
                and railways can swap aircraft rakes or make up time en route.
                Always report to the airport terminal or railway station
                according to your <strong>original scheduled departure</strong>.
              </p>
            </div>
          </div>
        </div>

        <article className="space-y-6 rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          {TERMS_SECTIONS.map((sec) => (
            <section key={sec.title} className="space-y-2">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                <span>{sec.title}</span>
              </h2>
              <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">
                {sec.body}
              </p>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs">
            <span className="text-ink-muted">Last updated: November 2026</span>
            <div className="flex flex-wrap gap-4 font-bold">
              <Link
                href="/privacy-policy"
                className="text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Privacy Policy →
              </Link>
              <Link
                href="/about"
                className="text-[#1956b4] hover:underline dark:text-blue-400"
              >
                About TravelAdda →
              </Link>
              <Link
                href="/contact"
                className="text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

