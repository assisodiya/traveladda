import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CoachTrainIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveTrainTracker } from "@/components/LiveTrainTracker";
import { buildChartTimePath } from "@/lib/chart-time-types";
import {
  ALL_CATALOG_TRAINS,
  buildTrainLiveStatusPath,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";

export const metadata: Metadata = {
  title:
    "Live Train Running Status | Spot Your Train, GPS Radar & Coach Position",
  description:
    "Check live Indian Railways train running status by train number or name. Track real-time blinking train position, current station, expected delays, platform numbers, corridor map, and coach order from engine on TravelAdda.",
  keywords: [
    "live train status",
    "live train running status",
    "spot your train",
    "where is my train",
    "indian railways live status",
    "ntes live train tracking",
    "train running status today",
    "coach position from engine",
    "train platform number live",
    "vande bharat live status",
    "rajdhani express live status",
  ],
  alternates: {
    canonical: "/rail/live-status",
  },
  openGraph: {
    title:
      "Live Train Running Status | Spot Your Train & Coach Position | TravelAdda",
    description:
      "Real-time Indian Railways train tracker with blinking GPS station radar, delay predictions, platform numbers, polyline route map & coach rake order.",
    url: "/rail/live-status",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Train Running Status & Coach Position | TravelAdda",
    description:
      "Spot any Indian Railways train live with real-time station timeline, platform numbers, delay alerts & coach rake sequence.",
  },
};

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Enter Train No. or Name",
    detail:
      "Type any 4 or 5-digit Indian Railways train number (like 12002 or 12951) or search by train name such as Rajdhani, Shatabdi, or Vande Bharat.",
  },
  {
    step: "2",
    title: "Auto-Match Active Run Date",
    detail:
      "Leave Start Date on Auto (Live) to automatically detect overnight trains currently mid-journey, or pick Yesterday, Today, or Tomorrow.",
  },
  {
    step: "3",
    title: "Follow Live Station Progress",
    detail:
      "See the live train beacon on the station timeline, check platform numbers, expected arrival times, and your coach order from the engine.",
  },
];

const STATUS_GLOSSARY = [
  {
    term: "Moving Live (Crossed Station)",
    meaning:
      "The locomotive has departed the last reported railway cabin or halt and is actively travelling along the section towards the next upcoming stop.",
  },
  {
    term: "At Station (PF #)",
    meaning:
      "The train is currently standing at the station platform for passenger boarding/alighting or operational signal clearance.",
  },
  {
    term: "Origin Start Date vs Boarding Date",
    meaning:
      "Indian Railways tracks trains by the date the train departed its very first source station. Overnight Day-2 passengers use Auto (Live) or Yesterday.",
  },
  {
    term: "Not Started Yet (Scheduled)",
    meaning:
      "The train has not yet departed its origin station for that start date. Full timetable, platform predictions, and coach rake order are already visible.",
  },
];

const LIVE_TRAIN_FAQS = [
  {
    question:
      "How do I check Indian Railways Live Train Running Status on mobile?",
    answer:
      "Simply enter your 5-digit train number or type the train name in the search box at the top of this page and tap 'Spot Train'. TravelAdda displays a clean vertical station timeline with a blinking live train indicator, expected station arrivals, platform numbers, and coach positions.",
  },
  {
    question:
      "Which date should I select when checking Live Train Status for an overnight train?",
    answer:
      "Always use the train's Origin Start Date—the date the train departed from its first source station. TravelAdda's 'Auto (Live)' mode automatically checks whether yesterday's overnight departure is still actively running so you immediately see the live moving train.",
  },
  {
    question:
      "What does the blinking train icon on the live status timeline represent?",
    answer:
      "The blinking train icon pinpoints your train's exact real-time position along the route. When the train is moving between two stations, the blinking icon appears directly between the last passed halt and the next upcoming halt with live kilometres covered and estimated speed.",
  },
  {
    question:
      "What is the difference between Official Stops and All Passing Stations?",
    answer:
      "Official Stops are commercial railway stations where the train halts for passengers to board or alight and platform numbers are assigned. Switching to 'All' reveals intermediate railway block cabins and junctions used to track exact section-by-section movement.",
  },
  {
    question:
      "How do I find my Coach Position from the Engine before the train arrives?",
    answer:
      "Scroll to the 'Coach Position from Engine' rake diagram and type your coach code (such as B4, A1, C8, or S5). TravelAdda highlights your coach card and shows its exact number from the front locomotive (ENG) so you can stand at the right spot on the platform.",
  },
  {
    question:
      "Does TravelAdda cover Vande Bharat, Rajdhani, Shatabdi, Superfast, and Mail/Express trains?",
    answer:
      "Yes. Our live rail gateway tracks all passenger train categories across all 17 Indian Railways zones, including Vande Bharat Express, Tejas Rajdhani, Shatabdi, Duronto, Amrit Bharat, Double Decker, Garib Rath, Superfast, and Mail/Express trains.",
  },
];

function LiveTrainFallback() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-md">
      <div className="h-14 animate-pulse rounded-xl bg-subcard" />
    </div>
  );
}

export default async function LiveTrainStatusPage() {
  "use cache";
  cacheLife("hours");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda Live Train Running Status Tracker",
        url: "https://traveladda.in/rail/live-status",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        browserRequirements: "Requires JavaScript",
        image: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
        provider: {
          "@type": "Organization",
          name: "TravelAdda",
          url: "https://traveladda.in",
          logo: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description:
          "Track live Indian Railways train running status, real-time GPS station location, expected delays, platform numbers, route geometry map, and coach position from engine.",
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
            name: "Rail Tools",
            item: "https://traveladda.in/rail/pnr-status",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Live Train Running Status",
            item: "https://traveladda.in/rail/live-status",
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to Check Live Train Running Status & Coach Position Online",
        step: HOW_IT_WORKS_STEPS.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.detail,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: LIVE_TRAIN_FAQS.map((faq) => ({
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

      {/* Clean Compact Navy Banner */}
      <section className="ta-navy-hero pb-12 pt-5 sm:pb-16 sm:pt-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                Live Train Running Status
              </span>
            </nav>

            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
            >
              <TicketIcon className="h-3.5 w-3.5" />
              <span>Check PNR Status</span>
            </Link>
          </div>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Live Train Running Status — Spot Your Train
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Check real-time station position, delay alerts, platform numbers,
              and coach order from the engine across Indian Railways.
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping Search & Live Train Dashboard */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<LiveTrainFallback />}>
          <LiveTrainTracker />
        </Suspense>

        <div className="mt-4 grid gap-2.5 rounded-xl border border-line bg-card px-4 py-3 text-xs font-medium text-ink-soft sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Auto-detects overnight active train runs</span>
          </div>
          <div className="flex items-center gap-2">
            <CoachTrainIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
            <span>Engine-to-guard coach rake sequence</span>
          </div>
          <div className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4 shrink-0 text-[#0d9458] dark:text-emerald-400" />
            <span>All 17 zones · Vande Bharat, Rajdhani &amp; Express</span>
          </div>
        </div>
      </section>

      {/* Popular Live Trains Quick Directory */}
      <section
        aria-labelledby="popular-trains-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="popular-trains-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              Popular Trains — 1-Tap Running Status
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Select a popular Rajdhani, Shatabdi, Vande Bharat, or Express
              train to view live station timings.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_LIVE_TRAINS.map((train) => (
            <Link
              key={train.trainNumber}
              href={buildTrainLiveStatusPath(
                train.trainNumber,
                train.trainName
              )}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    #{train.trainNumber}
                  </span>
                  <span className="text-[11px] font-medium text-ink-muted">
                    {train.type}
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-1 text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                  {train.trainName}
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                <span className="font-mono font-semibold text-ink-soft">
                  {train.sourceCode} → {train.destinationCode}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400">
                  <span>Spot</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Complete Indian Railways Train Directory (All Catalog Trains) */}
        <details className="group mt-6 rounded-2xl border border-line bg-card p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink sm:text-base">
            <span>
              Browse All {ALL_CATALOG_TRAINS.length} Indian Railways Trains —
              Vande Bharat, Rajdhani, Shatabdi &amp; Superfast Directory
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
          </summary>
          <p className="mt-1.5 text-xs text-ink-soft">
            Select any train number below for live GPS running status, station
            time table, platform numbers, and 1st/2nd reservation chart timings:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_CATALOG_TRAINS.map((train) => (
              <div
                key={`dir-${train.trainNumber}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-line/70 bg-subcard/40 px-3 py-2 text-xs transition hover:border-[#1956b4]"
              >
                <Link
                  href={buildTrainLiveStatusPath(
                    train.trainNumber,
                    train.trainName
                  )}
                  className="min-w-0 flex-1 truncate font-semibold text-ink hover:text-[#1956b4] dark:hover:text-blue-400"
                >
                  <span className="mr-1.5 font-mono font-bold text-[#1956b4] dark:text-blue-400">
                    {train.trainNumber}
                  </span>
                  <span>{train.trainName}</span>
                </Link>
                <Link
                  href={buildChartTimePath(train.trainNumber, train.trainName)}
                  className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4] hover:underline dark:bg-blue-500/15 dark:text-blue-300"
                  title={`${train.trainNumber} Chart Preparation Time`}
                >
                  Chart Time
                </Link>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Simple 3-Step How It Works */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          How to Check Live Train Status Online
        </h2>
        <div className="mt-4 grid gap-3.5 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-line bg-card p-4 sm:p-5"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                {item.step}
              </span>
              <h3 className="mt-2.5 text-sm font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Railway Terminology */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Indian Railways Live Status Terms Explained
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {STATUS_GLOSSARY.map((item) => (
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

      {/* Clean Divider FAQ Accordion */}
      <section
        id="faq"
        className="mx-auto mt-12 max-w-4xl scroll-mt-24 px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — Live Train Running Status
        </h2>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {LIVE_TRAIN_FAQS.map((faq, idx) => (
            <details key={faq.question} open={idx === 0} className="group p-4 sm:p-5">
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

      {/* Clean Cross-Link CTA */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="ta-cta-banner rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-ink sm:text-xl">
                Need to Check Your 10-Digit IRCTC PNR Confirmation?
              </h2>
              <p className="mt-1 text-xs text-ink-soft sm:text-sm">
                Verify CNF, RAC, or Waitlist berth allocation and chart
                preparation status before boarding.
              </p>
            </div>
            <Link
              href="/rail/pnr-status"
              className="ta-btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold sm:w-auto"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Check PNR Status</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
