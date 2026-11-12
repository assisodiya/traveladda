import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { DgcaCompensationChecker } from "@/components/DgcaCompensationChecker";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  PlaneIcon,
  ShieldCheckIcon,
} from "@/components/Icons";
import {
  buildAirlineCompensationPath,
  DGCA_AIRLINE_PROFILES,
  DGCA_COMPENSATION_DATASET,
} from "@/lib/dgca-compensation-types";

export const metadata: Metadata = {
  title:
    "DGCA Flight Delay, Cancellation & Denied Boarding Compensation Calculator (₹5,000–₹20,000) | TravelAdda",
  description:
    "Calculate your exact DGCA flight delay, cancellation, denied boarding & baggage compensation in India (₹5,000 to ₹20,000 + 100% zero-fee refund). Check IndiGo, Air India, Akasa Air & SpiceJet Plan B rules, Nodal Officer emails, and generate an official AirSewa legal claim.",
  keywords: [
    "dgca flight delay compensation calculator",
    "dgca flight cancellation refund rules",
    "indigo flight cancelled compensation",
    "air india delay compensation rules",
    "denied boarding compensation india",
    "flight delayed by 6 hours refund rules",
    "dgca passenger charter compensation",
    "airsewa complaint email format",
    "airline nodal officer email india",
  ],
  alternates: {
    canonical: "/air/flight-compensation",
  },
  openGraph: {
    title:
      "DGCA Flight Delay, Cancellation & Denied Boarding Compensation Checker | TravelAdda",
    description:
      "Check ₹5,000–₹20,000 statutory DGCA compensation, 6h+ full refund eligibility, free hotel stay rules & Nodal Officer emails for all Indian airlines.",
    url: "https://traveladda.in/air/flight-compensation",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
};

const DGCA_FAQS = [
  {
    q: "How much compensation can I claim if my flight is cancelled in India under DGCA rules?",
    a: "Under DGCA CAR Section 3, Series M, Part IV, if an airline cancels your domestic flight less than 24 hours before departure (or fails to notify you at least 2 weeks in advance) due to operational reasons, you are entitled to a 100% full ticket refund (or free alternate flight) PLUS statutory cash compensation of up to ₹5,000 (block time ≤ 1 hr), ₹7,500 (block time 1–2 hrs), or ₹10,000 (block time > 2 hrs), capped at 100% of your one-way basic fare plus airline fuel charge.",
  },
  {
    q: "What are my rights if my flight is delayed by more than 6 hours due to dense fog or bad weather?",
    a: "Even when a flight is delayed by 6+ hours due to dense fog or ATC weather restrictions (Force Majeure), DGCA rules strictly mandate that the airline MUST offer you the choice of a 100% full refund with zero cancellation fee OR a free rebooking onto an alternate flight (Plan B), along with free airport meals and refreshments.",
  },
  {
    q: "When is an airline required to provide a free hotel stay for a delayed flight in India?",
    a: "Under DGCA CAR Section 3, Series M, Part IV (Para 3.4.3), airlines must provide free hotel accommodation (including airport transfers) whenever a flight is delayed by 24 hours or more, OR when a night flight scheduled to depart between 8:00 PM (20:00) and 3:00 AM (03:00) is delayed by more than 6 hours.",
  },
  {
    q: "What is the DGCA compensation for Denied Boarding due to an overbooked flight?",
    a: "If you hold a confirmed ticket and report at the gate on time but are denied boarding due to overbooking: (1) ₹0 if an alternate flight departs within 1 hour; (2) 200% of one-way basic fare + fuel charge (maximum ₹10,000) if the alternate flight departs within 24 hours; (3) 400% of one-way basic fare + fuel charge (maximum ₹20,000) plus 100% full ticket refund if the alternate flight is after 24 hours or you decline rebooking.",
  },
  {
    q: "How much can I claim for lost, delayed, or damaged baggage on domestic and international flights?",
    a: "Under the MoCA Passenger Charter, domestic airline liability for lost, delayed, or damaged checked baggage is up to ₹20,000 per passenger (typically calculated at ₹350 per kg). For international flights covered by the Montreal Convention, liability is up to 1,288 SDR (approximately ₹1,45,000 per passenger). Always obtain a Property Irregularity Report (PIR) before leaving the arrival hall.",
  },
];

export default async function DgcaFlightCompensationPage() {
  "use cache";
  cacheLife("hours");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda DGCA Flight Delay, Cancellation & Denied Boarding Compensation Calculator",
        url: "https://traveladda.in/air/flight-compensation",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description:
          "Calculate statutory DGCA cash compensation (₹5,000–₹20,000), 100% refund eligibility, and generate formal nodal officer legal claims for Indian and international flights.",
      },
      {
        "@type": "FAQPage",
        mainEntity: DGCA_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Navy Hero Section */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/tools" className="hover:text-white">
                Air Tools
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                DGCA Flight Compensation Calculator
              </span>
            </nav>

            <Link
              href="/air/flight-status"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
            >
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>Track Live Flight Status</span>
            </Link>
          </div>

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>
                DGCA CAR Sec 3, Series M, Part IV · EU261 · Montreal Convention
              </span>
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              DGCA Flight Delay, Cancellation &amp; Denied Boarding Compensation
              Checker
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
              Check your exact statutory cash compensation (₹5,000 to ₹20,000),
              6h+ zero-fee full refund rights, free airport meals/hotel stay
              eligibility, and auto-generate a formal legal claim email for your
              airline&apos;s Nodal Officer.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-2xl border border-line bg-card p-6" />
          }
        >
          <DgcaCompensationChecker />
        </Suspense>
      </section>

      {/* Official DGCA Statutory Slabs Reference Table */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Official DGCA Flight Cancellation &amp; Denied Boarding Compensation
            Slabs (2026)
          </h2>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Reference chart from{" "}
            <strong>{DGCA_COMPENSATION_DATASET.authority}</strong>:
          </p>

          <div className="-mx-5 mt-4 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[620px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-subcard text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                  <th className="px-3.5 py-3">Disruption / Block Time Slab</th>
                  <th className="px-3.5 py-3">Example Corridors</th>
                  <th className="px-3.5 py-3">Max Statutory Cash</th>
                  <th className="px-3.5 py-3">Official DGCA Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {DGCA_COMPENSATION_DATASET.cancellationSlabs.map((slab) => (
                  <tr key={slab.id} className="hover:bg-subcard/50">
                    <td className="px-3.5 py-3 font-extrabold text-ink">
                      Cancellation: {slab.label}
                    </td>
                    <td className="px-3.5 py-3 text-xs text-ink-soft">
                      {slab.exampleRoutes}
                    </td>
                    <td className="px-3.5 py-3 font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                      ₹{slab.maxStatutoryCashInr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3.5 py-3 text-xs text-ink-soft">
                      {slab.formulaDescription}
                    </td>
                  </tr>
                ))}
                {DGCA_COMPENSATION_DATASET.deniedBoardingSlabs.map((db) => (
                  <tr key={db.id} className="hover:bg-subcard/50">
                    <td className="px-3.5 py-3 font-extrabold text-ink">
                      Denied Boarding: {db.label}
                    </td>
                    <td className="px-3.5 py-3 text-xs text-ink-soft">
                      All Domestic &amp; Outbound Flights
                    </td>
                    <td className="px-3.5 py-3 font-mono font-extrabold text-[#1956b4] dark:text-blue-300">
                      ₹{db.maxStatutoryCashInr.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3.5 py-3 text-xs text-ink-soft">
                      {db.formulaDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Airline-by-Airline Programmatic SEO Directory */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Airline-Wise Delay, Cancellation, Plan B &amp; Nodal Officer Guides
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
            Select your airline below for dedicated Plan B rebooking rules,
            Nodal Officer email addresses, Appellate Authority contacts, and
            refund timelines:
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {DGCA_AIRLINE_PROFILES.map((airline) => (
            <Link
              key={airline.code}
              href={buildAirlineCompensationPath(airline.slug)}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {airline.code}
                  </span>
                  <span className="text-[11px] font-medium text-ink-muted">
                    {airline.type}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold text-ink group-hover:text-[#1956b4] sm:text-base dark:group-hover:text-blue-300">
                  {airline.name} Delay &amp; Cancellation Compensation
                </h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Nodal Officer:{" "}
                  <span className="font-mono font-semibold">
                    {airline.nodalOfficer.email}
                  </span>
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs font-bold text-[#1956b4] dark:text-blue-300">
                <span>Check {airline.name} Rules</span>
                <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — DGCA Passenger Rights &amp; Refunds
        </h2>
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {DGCA_FAQS.map((faq, idx) => (
            <details
              key={faq.q}
              open={idx === 0}
              className="group p-4 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                <span>{faq.q}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

