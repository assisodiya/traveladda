import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  BuildingStationIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { TrainChartTimeChecker } from "@/components/TrainChartTimeChecker";
import { POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";

export const metadata: Metadata = {
  title:
    "Train Chart Preparation Time & Charting Station Finder | 1st & 2nd IRCTC Chart Time",
  description:
    "Check exact 1st reservation chart and 2nd vacancy chart preparation time for any Indian Railways train. Find your boarding station's remote charting station (chartRemoteStation) and station-by-station charting schedule.",
  keywords: [
    "train chart preparation time",
    "irctc chart preparation time",
    "charting station of train",
    "first chart and second chart time",
    "remote charting station indian railways",
    "12952 mmct tejas raj chart time",
    "vacancy chart preparation time",
    "when is train chart prepared",
  ],
  alternates: {
    canonical: "/rail/chart-time",
  },
  openGraph: {
    title:
      "Train Chart Preparation Time & Remote Charting Station Finder | TravelAdda",
    description:
      "Station-by-station 1st chart time, 2nd (vacancy) chart time, and remote charting hub directory for Indian Railways trains.",
    url: "/rail/chart-time",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
};

const CHART_TERMINOLOGY = [
  {
    term: "1st Reservation Chart (Primary Chart)",
    meaning:
      "Prepared approximately 4 to 8 hours before departure (or the previous evening/morning for early morning and afternoon trains). Waitlisted (WL) and RAC tickets are finalized into confirmed berths during this run.",
  },
  {
    term: "2nd Chart / Final Vacancy Chart",
    meaning:
      "Prepared 15 to 30 minutes before the train departs from the station or its remote charting hub. Any last-minute cancellations or current booking seats are updated before handed over to the onboard TTE.",
  },
  {
    term: "Primary Charting Station (Hub)",
    meaning:
      "A major railway junction or origin station where Indian Railways' PRS system generates the reservation chart for itself and several downstream intermediate boarding halts.",
  },
  {
    term: "Remote Charting Station (chartRemoteStation)",
    meaning:
      "When your boarding station does not prepare its own independent chart (for example, Borivali BVI or Mumbai Central MMCT on 12952 Tejas Rajdhani), its chart is prepared earlier at an upstream Remote Charting Hub such as Surat (ST).",
  },
];

const CHART_TIME_FAQS = [
  {
    question:
      "What is a Charting Station (chartRemoteStation) in Indian Railways?",
    answer:
      "Every boarding station on a train route is mapped to a Charting Station (also called a Remote Location Charting Station). If your boarding station is a primary charting hub (such as NDLS, KOTA, RTM, BRC, or ST on 12952 Tejas Rajdhani), the chart is prepared at that station itself. If your boarding station is a downstream halt (such as Borivali BVI or Mumbai Central MMCT), its chart is prepared remotely at the upstream charting station (Surat ST) at Surat's chart preparation time.",
  },
  {
    question:
      "Why is my boarding station's chart prepared so early before my train arrives?",
    answer:
      "Because Indian Railways groups multiple consecutive stations under a single upstream Remote Charting Station (`chartRemoteStation`), your seat confirmation is finalized when the chart is prepared at that upstream hub—often several hours before the train reaches your boarding halt.",
  },
  {
    question:
      "What is the difference between 1st Chart Time and 2nd (Vacancy) Chart Time?",
    answer:
      "The 1st Reservation Chart is the main chart prepared 4–8 hours ahead of departure (or the night before for morning trains) that clears General and Remote Location Waiting Lists (GNWL/RLWL/PQWL). The 2nd Chart (Vacancy Chart) is prepared 15–30 minutes before departure to allocate current-booking seats and last-minute cancellations.",
  },
  {
    question:
      "What do Same Day (Day 1) and Next Day (+1 Day) offsets mean in the chart table?",
    answer:
      "Chart times are always referenced relative to the train's Origin Start Date. 'Same Day (Day 1)' means the chart is prepared on the same calendar day the train departs its origin station, whereas 'Next Day (+1 Day)' means the chart is prepared on the following calendar day for overnight Day-2 stations.",
  },
];

function ChartTimeFallback() {
  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-md">
      <div className="h-14 animate-pulse rounded-xl bg-subcard" />
    </div>
  );
}

export default async function TrainChartTimePage() {
  "use cache";
  cacheLife("hours");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda Train Chart Preparation Time & Charting Station Finder",
        url: "https://traveladda.in/rail/chart-time",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description:
          "Find exact 1st reservation chart time, 2nd vacancy chart time, and remote charting station (chartRemoteStation) for every stop on an Indian Railways train route.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://traveladda.in/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "All Tools",
            item: "https://traveladda.in/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Train Chart Preparation Time",
            item: "https://traveladda.in/rail/chart-time",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: CHART_TIME_FAQS.map((faq) => ({
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
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Navy Hero Header */}
      <section className="ta-navy-hero pb-12 pt-5 sm:pb-16 sm:pt-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/tools" className="hover:text-white">
                Rail Tools
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                Train Chart Preparation Time
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
              >
                <TicketIcon className="h-3.5 w-3.5" />
                <span>Check PNR Status</span>
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
              >
                <TrainIcon className="h-3.5 w-3.5" />
                <span>Spot Train Live</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>1st Chart · 2nd Vacancy Chart · Remote Charting Hub</span>
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Train Chart Preparation Time &amp; Charting Station Finder
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Check station-by-station 1st reservation chart timings, 2nd
              vacancy chart timings, and discover which Remote Charting Station
              prepares the chart for your boarding halt.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Tool */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<ChartTimeFallback />}>
          <TrainChartTimeChecker />
        </Suspense>

        <div className="mt-4 grid gap-2.5 rounded-xl border border-line bg-card px-4 py-3 text-xs font-medium text-ink-soft sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
            <span>Exact 1st &amp; 2nd (vacancy) chart times per station</span>
          </div>
          <div className="flex items-center gap-2">
            <BuildingStationIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Highlights Primary &amp; Remote Charting Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
            <span>Day offset badges (Same Day / +1 Day / -1 Day)</span>
          </div>
        </div>
      </section>

      {/* Quick Directory of Popular Trains for Chart Times */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Popular Trains — 1-Tap Chart Time &amp; Charting Station Lookup
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
          Tap any train below to inspect its station-wise 1st chart, 2nd chart,
          and remote charting station clusters.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_CHART_TRAINS.map((train) => (
            <Link
              key={train.trainNumber}
              href={`/rail/chart-time?train=${train.trainNumber}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    #{train.trainNumber}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-ink-muted">
                    {train.route}
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-1 text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                  {train.trainName}
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                <span className="text-ink-muted">View Chart Schedule</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400">
                  <span>Check</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Charting Terminology Explained */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Understanding 1st Chart, 2nd Chart &amp; Remote Charting Stations
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {CHART_TERMINOLOGY.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-line bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-ink">{item.term}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="mx-auto mt-12 max-w-4xl scroll-mt-24 px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — Train Chart Preparation Time
        </h2>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {CHART_TIME_FAQS.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group p-4 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                <span>{faq.question}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

