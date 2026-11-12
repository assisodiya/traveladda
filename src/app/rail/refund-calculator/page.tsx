import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import RailRefundCalculator from "@/components/RailRefundCalculator";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildRefundScenarioPath,
  computeRailRefund,
  DEFAULT_REFUND_STATE,
  REFUND_SEO_SCENARIOS,
} from "@/lib/rail-refund-service";

export const metadata: Metadata = {
  title:
    "IRCTC Train Ticket Cancellation & Refund Calculator (2026) | CNF, RAC, WL, Tatkal & Gazette G.S.R. 41(E)",
  description:
    "100% verified Indian Railways PRS & IRCTC ticket cancellation refund calculator. Calculate exact bank refund for Confirmed (CNF), RAC, Waiting List (WL), Tatkal, Vande Bharat Chair Car (48h/12h/4h) & Vande Bharat Sleeper (72h/8h Gazette G.S.R. 41(E)) with double ₹5 rounding.",
  keywords: [
    "IRCTC ticket cancellation charges calculator",
    "train ticket refund calculator India",
    "RAC ticket cancellation charges",
    "confirmed train ticket cancellation refund",
    "waiting list WL ticket refund calculator",
    "tatkal ticket cancellation refund rules",
    "TQWL cancellation charges",
    "Vande Bharat ticket cancellation charges",
    "Vande Bharat Sleeper 72 hours cancellation rule Gazette GSR 41E",
    "3AC 2AC 1AC Sleeper ticket cancellation fee",
  ],
  alternates: {
    canonical: "https://traveladda.in/rail/refund-calculator",
  },
  openGraph: {
    title:
      "IRCTC Train Ticket Cancellation & Refund Calculator (PRS Verified) | TravelAdda",
    description:
      "Calculate exact Indian Railways refund for Confirmed, RAC, Waitlist (WL), Tatkal, Agent RSP tickets, Vande Bharat CC & Vande Bharat Sleeper (Gazette G.S.R. 41(E)).",
    url: "https://traveladda.in/rail/refund-calculator",
    type: "website",
  },
};

const REFUND_HUB_FAQS = [
  {
    question:
      "Why does Indian Railways PRS apply Double ₹5 Rounding on 25% and 50% ticket cancellations?",
    answer:
      "When you cancel an AC confirmed ticket within 48 hours (25% or 50% slab), CRIS PRS first computes the percentage deduction on the Ex-GST base (Ex-GST Train Base + Ex-GST Catering Base) and rounds that base deduction UP to the next ₹5 multiple. Next, it adds 5% Cancellation GST on that rounded base and rounds the combined total UP a second time to the next ₹5 multiple (for example, on a ₹1,395 Vande Bharat CC ticket: ₹1,329.62 × 25% = ₹332.41 → ₹335 + ₹16.75 GST = ₹351.75 → ₹355 deduction).",
  },
  {
    question:
      "Does the 72-hour and 8-hour cancellation rule apply to all trains or only Vande Bharat Sleeper?",
    answer:
      "Under the Gazette of India Notification G.S.R. 41(E) (dated 16 January 2026), the >72h (25% cut with no flat fee), 72h–8h (50% cut), and <8h (₹0 refund) slabs apply ONLY to Vande Bharat Sleeper Express and Amrit Bharat II Express. All other trains—including regular Vande Bharat Chair Car (CC/EC), Rajdhani, Shatabdi, Duronto, and Mail/Express—follow the >48h flat fee, 48h–12h (25%), 12h–4h (50% if chart not prepared), and <4h / post-chart (₹0) rules.",
  },
  {
    question:
      "How much money is deducted on cancelling an RAC or Waiting List (WL / TQWL) e-ticket?",
    answer:
      "For Waitlisted (WL / GNWL / RLWL / PQWL / TQWL) e-tickets, refund is NEVER ₹0—even if cancelled less than 30 minutes before departure or auto-cancelled after chart preparation, only flat clerkage of ₹60 (Sleeper/2S) or ₹65 (AC classes: ₹60 + ₹3 GST rounded to ₹5) per passenger is deducted. For RAC tickets, the same ₹60/₹65 clerkage applies if cancelled at least 30 minutes before scheduled departure.",
  },
  {
    question:
      "How does the calculator extract Pure Train Fare from an IRCTC Authorized Agent (RSP) Grand Total?",
    answer:
      "When you enter the Grand Total printed on an Agent (RSP/CSC) ticket, our calculator first subtracts the fixed Agent Service Charge (₹40 for AC / ₹20 for Non-AC), then reverses the Payment Gateway charge (0.75% if PG Base ≤ ₹2,000; 1.00% if PG Base > ₹2,000), and finally subtracts the IRCTC Convenience Fee (₹35.40 AC / ₹17.70 Non-AC) and Travel Insurance to isolate the exact refundable Railway Fare + Catering.",
  },
];

export default async function RailRefundCalculatorHubPage() {
  "use cache";
  cacheLife("days");

  const initialResult = computeRailRefund(DEFAULT_REFUND_STATE);

  const scenariosByCategory = {
    status: REFUND_SEO_SCENARIOS.filter(
      (s) => s.category === "Ticket Status Rules"
    ),
    class: REFUND_SEO_SCENARIOS.filter(
      (s) => s.category === "Coach Class Charges"
    ),
    special: REFUND_SEO_SCENARIOS.filter(
      (s) =>
        s.category === "Vande Bharat & Gazette Rules" ||
        s.category === "Time Window & Chart Rules" ||
        s.category === "Agent & Booking Mode"
    ),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda IRCTC Train Ticket Cancellation & Refund Calculator (PRS Verified)",
        url: "https://traveladda.in/rail/refund-calculator",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        description:
          "Verified Indian Railways PRS & Gazette G.S.R. 41(E) ticket cancellation and refund calculator for Confirmed (CNF), RAC, Waitlist (WL/TQWL), Tatkal, Vande Bharat CC & Vande Bharat Sleeper.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://traveladda.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Train Tools",
            item: "https://traveladda.in/rail/live-status",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "IRCTC Refund Calculator",
            item: "https://traveladda.in/rail/refund-calculator",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: REFUND_HUB_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Deep Navy Hero Header */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link href="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/rail/live-status"
                className="hover:text-white hover:underline"
              >
                Trains
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                IRCTC Ticket Cancellation &amp; Refund Calculator
              </span>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              100% Verified PRS Double ₹5 Rounding + Gazette G.S.R. 41(E)
            </span>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs sm:text-xs">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                <span>
                  Regular Trains (48h / 12h / 4h) &amp; Vande Bharat Sleeper (72h / 8h)
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                IRCTC Ticket Cancellation &amp; Refund Calculator (PRS Verified)
              </h1>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                Calculate exact Indian Railways refund for{" "}
                <strong className="text-white">
                  Confirmed (CNF), RAC, Waiting List (WL), Tatkal &amp; TQWL
                </strong>{" "}
                tickets—including{" "}
                <strong className="text-emerald-300">
                  CRIS PRS two-stage ₹5 rounding
                </strong>
                ,{" "}
                <strong className="text-white">
                  Gazette G.S.R. 41(E) (16 Jan 2026) rules
                </strong>
                , Ex-GST catering breakdown, and{" "}
                <strong className="text-white">
                  Authorized Agent (RSP) 0.75% / 1% PG reverse extraction
                </strong>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href="#gazette-comparison-table"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                48h vs 72h Gazette Table
              </a>
              <a
                href="#refund-scenarios-directory"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                RAC / WL / CNF Calculators
              </a>
              <a
                href="#irctc-refund-faqs"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                PRS Refund Rules
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-8 px-3.5 sm:-mt-10 sm:space-y-10 sm:px-6 lg:px-8">
        <RailRefundCalculator initialResult={initialResult} />

        {/* Official Gazette G.S.R. 41(E) Comparison Table */}
        <section
          id="gazette-comparison-table"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Ministry of Railways Official Gazette Notification G.S.R. 41(E) (16 January 2026)
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <TrainIcon className="h-5 w-5 text-[#fc6203]" />
              Regular Trains (48h / 12h / 4h) vs Vande Bharat Sleeper &amp; Amrit Bharat II (72h / 8h)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-subcard text-ink">
                  <th className="p-3 font-extrabold">Cancellation Stage</th>
                  <th className="p-3 font-extrabold text-[#1956b4] dark:text-blue-300">
                    Regular Trains (Vande Bharat Chair Car CC/EC, Rajdhani, Shatabdi, Express)
                  </th>
                  <th className="p-3 font-extrabold text-rose-700 dark:text-rose-300">
                    Vande Bharat Sleeper &amp; Amrit Bharat II Express (Gazette G.S.R. 41(E))
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-soft">
                <tr>
                  <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                    Early Cancellation Window
                  </td>
                  <td className="p-3">
                    <strong>&gt; 48 Hours Before Departure:</strong> Flat Fee per passenger — 1AC/EC: <strong>₹255</strong> | 2AC/FC: <strong>₹210</strong> | 3AC/CC/3E: <strong>₹190</strong> | SL: <strong>₹120</strong> | 2S: <strong>₹60</strong>
                  </td>
                  <td className="bg-rose-50/40 p-3 dark:bg-rose-950/20">
                    <strong>&gt; 72 Hours Before Departure:</strong> No Flat Fee! Direct <strong>25% Deduction</strong> (with Double ₹5 Rounding + 5% GST)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-700 dark:text-amber-400">
                    Medium Cancellation Window
                  </td>
                  <td className="p-3">
                    <strong>Between 48 Hours &amp; 12 Hours:</strong> <strong>25% Deduction</strong> on (Ex-GST Train Base + Ex-GST Catering Base) with Double ₹5 Rounding + 5% GST
                  </td>
                  <td className="bg-rose-50/40 p-3 dark:bg-rose-950/20">
                    <strong>Between 72 Hours &amp; 8 Hours:</strong> Direct <strong>50% Deduction</strong> (with Double ₹5 Rounding + 5% GST)
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-orange-700 dark:text-orange-400">
                    Late Pre-Chart Window
                  </td>
                  <td className="p-3">
                    <strong>&lt; 12 Hours to ≥ 4 Hours (If Chart Not Prepared):</strong> <strong>50% Deduction</strong> (with Double ₹5 Rounding + 5% GST)
                  </td>
                  <td className="bg-rose-50/40 p-3 dark:bg-rose-950/20">
                    <em>(Covered under the 72h to 8h 50% deduction slab if chart is not prepared)</em>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-rose-700 dark:text-rose-400">
                    Post-Chart / Zero-Refund Zone
                  </td>
                  <td className="p-3">
                    <strong>After Chart Preparation OR &lt; 4 Hours:</strong> <strong>₹0 Refund</strong> on Confirmed (CNF) tickets
                  </td>
                  <td className="bg-rose-50/40 p-3 dark:bg-rose-950/20">
                    <strong>After Chart Preparation OR &lt; 8 Hours:</strong> <strong>₹0 Refund</strong> on Confirmed (CNF) tickets (TDR also closes at 8 hours)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Dedicated Refund Scenario Calculators Directory (29 Programmatic URLs) */}
        <section
          id="refund-scenarios-directory"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Dedicated Status, Class &amp; Quota Calculators
              </span>
              <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
                <TicketIcon className="h-5 w-5 text-[#fc6203]" />
                All {REFUND_SEO_SCENARIOS.length} Indian Railways Ticket Refund Calculators (RAC, CNF, WL, Tatkal &amp; Classes)
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {REFUND_SEO_SCENARIOS.length} Specialized Calculators
            </span>
          </div>

          <div className="space-y-6">
            {/* Group 1: By Ticket Status (CNF, RAC, WL, Tatkal, TQWL) */}
            <div>
              <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                1. Refund Calculators by Ticket Status (Confirmed, RAC, Waitlist WL &amp; Tatkal)
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {scenariosByCategory.status.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={buildRefundScenarioPath(sc.slug)}
                    className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-3.5 transition hover:border-[#1956b4] hover:bg-card hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:bg-blue-950/60 dark:text-blue-300">
                          {sc.category}
                        </span>
                        <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted group-hover:translate-x-0.5 group-hover:text-[#1956b4]" />
                      </div>
                      <h4 className="mt-2 text-xs font-extrabold text-ink group-hover:text-[#1956b4] sm:text-sm dark:group-hover:text-blue-300">
                        {sc.shortTitle}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[11px] text-ink-muted">
                        {sc.summaryHighlight}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Group 2: By Coach Class (1AC, 2AC, 3AC/3E/CC, SL, 2S) */}
            <div className="border-t border-line pt-5">
              <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                2. Refund Calculators by Coach Class (1AC, 2AC, 3AC, 3E, Chair Car, Sleeper &amp; 2S)
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {scenariosByCategory.class.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={buildRefundScenarioPath(sc.slug)}
                    className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-3.5 transition hover:border-[#1956b4] hover:bg-card hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {sc.category}
                        </span>
                        <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted group-hover:translate-x-0.5 group-hover:text-[#1956b4]" />
                      </div>
                      <h4 className="mt-2 text-xs font-extrabold text-ink group-hover:text-[#1956b4] sm:text-sm dark:group-hover:text-blue-300">
                        {sc.shortTitle}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[11px] text-ink-muted">
                        {sc.summaryHighlight}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Group 3: Vande Bharat, Gazette G.S.R. 41(E), Chart & Agent RSP Rules */}
            <div className="border-t border-line pt-5">
              <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                3. Vande Bharat Sleeper (72h/8h Gazette), Train Cancelled TDR, Post-Chart &amp; Agent RSP Calculators
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {scenariosByCategory.special.map((sc) => (
                  <Link
                    key={sc.slug}
                    href={buildRefundScenarioPath(sc.slug)}
                    className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-3.5 transition hover:border-[#1956b4] hover:bg-card hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {sc.category}
                        </span>
                        <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted group-hover:translate-x-0.5 group-hover:text-[#1956b4]" />
                      </div>
                      <h4 className="mt-2 text-xs font-extrabold text-ink group-hover:text-[#1956b4] sm:text-sm dark:group-hover:text-blue-300">
                        {sc.shortTitle}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-[11px] text-ink-muted">
                        {sc.summaryHighlight}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Indian Railways Editorial Blog Guides */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Indian Railways PNR, Charting &amp; Refund Masterclass
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-ink sm:text-xl">
                Related Indian Railways &amp; IRCTC Travel Guides
              </h2>
            </div>
            <Link
              href="/blog#rail-guides"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              <span>All Rail Guides</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {RAIL_BLOG_POSTS.slice(0, 4).map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-4 transition hover:border-[#1956b4] hover:bg-card hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <ClockIcon className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-extrabold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
                  <span className="text-[11px] text-ink-muted">
                    {post.publishedDate}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-extrabold text-[#1956b4] dark:text-blue-300"
                  >
                    <span>Read</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section
          id="irctc-refund-faqs"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              CRIS PRS &amp; Gazette G.S.R. 41(E) Rules
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <AlertCircleIcon className="h-5 w-5 text-[#fc6203]" />
              Frequently Asked Questions — IRCTC Ticket Cancellation &amp; Refund Rules
            </h2>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2">
            {REFUND_HUB_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-line bg-subcard/40 p-4"
              >
                <h3 className="text-sm font-extrabold text-ink">
                  {faq.question}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom SEO Combination Keywords & Search Intent Footer */}
        <section
          aria-label="Popular IRCTC Ticket Cancellation & Refund Search Keywords"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-3 border-b border-line pb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
              Complete Indian Railways Refund &amp; Clerkage Keyword Index
            </span>
            <h2 className="mt-0.5 text-sm font-extrabold text-ink sm:text-base">
              All Ticket Status, Coach Class &amp; Time-Slab Refund Searches (2026)
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {REFUND_SEO_SCENARIOS.map((sc) => (
              <Link
                key={`kw-${sc.slug}`}
                href={buildRefundScenarioPath(sc.slug)}
                className="rounded-md border border-line bg-subcard/60 px-2.5 py-1 text-[11px] font-medium text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
              >
                {sc.primaryKeyword}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

