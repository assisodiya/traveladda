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
  CoachTrainIcon,
  CompassIcon,
  GaugeSpeedIcon,
  HelpCircleIcon,
  LiveTrainBeaconIcon,
  NavigationIcon,
  RadarLiveIcon,
  RouteTrackIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveTrainTracker } from "@/components/LiveTrainTracker";
import { POPULAR_LIVE_TRAINS } from "@/lib/live-train-types";

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
    step: "01",
    title: "Enter Train No. or Name",
    detail:
      "Type any 4 or 5-digit Indian Railways train number (like 12002 or 12951) or search by train name such as Rajdhani, Shatabdi, or Vande Bharat.",
  },
  {
    step: "02",
    title: "Auto-Match Active Run Date",
    detail:
      "Leave Start Date on Auto (Live) to automatically detect overnight trains currently mid-journey, or pick Yesterday, Today, or Tomorrow.",
  },
  {
    step: "03",
    title: "Follow the Blinking Train Icon",
    detail:
      "Watch the blinking live train beacon on the vertical station track, check platform numbers, expected arrival times, and your coach order from the engine.",
  },
];

const LIVE_TRACKING_FEATURES = [
  {
    title: "Blinking Live GPS Train Radar",
    description:
      "Instantly see whether your train is halted at a platform or moving between intermediate stations with real-time kilometre progress.",
    icon: <NavigationIcon className="h-5 w-5" />,
    badge: "LIVE BEACON",
  },
  {
    title: "Expected Arrival & Delay Alerts",
    description:
      "Compare scheduled timetable timings against live predicted arrivals and departures—including early arrivals and minute-level delays.",
    icon: <ClockIcon className="h-5 w-5" />,
    badge: "DELAY RADAR",
  },
  {
    title: "Platform & Halt Filter",
    description:
      "Toggle cleanly between official commercial passenger halts and all intermediate block cabins, complete with platform numbers and halt durations.",
    icon: <BuildingStationIcon className="h-5 w-5" />,
    badge: "PF NUMBERS",
  },
  {
    title: "Engine-to-Guard Coach Order",
    description:
      "Inspect the exact rake sequence (ENG, LPR, B1–B11, A1–A5, C1–C14, S1) and find how many coaches behind the engine you should stand.",
    icon: <CoachTrainIcon className="h-5 w-5" />,
    badge: "COACH RAKE",
  },
  {
    title: "Interactive Corridor Route Map",
    description:
      "Visualize the railway corridor plotted from real track geometry coordinates with a pulsing train marker and clickable halt pins.",
    icon: <CompassIcon className="h-5 w-5" />,
    badge: "TRACK MAP",
  },
  {
    title: "Live Speed & Return Train Pair",
    description:
      "Monitor live section speed in km/h, remaining distance, operating weekdays, and switch to the return train number in one tap.",
    icon: <GaugeSpeedIcon className="h-5 w-5" />,
    badge: "TELEMETRY",
  },
];

const STATUS_GLOSSARY = [
  {
    term: "Train Moving Live (Crossed Station)",
    meaning:
      "The locomotive has departed the last reported railway cabin or halt and is actively travelling along the section towards the next upcoming stop.",
  },
  {
    term: "Halted at Station (PF #)",
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
      "Simply enter your 5-digit train number or type the train name in the search box at the top of this page and tap 'Track Live Status'. TravelAdda displays a mobile-friendly vertical railway track with a blinking live train icon, expected station arrivals, platform numbers, and coach positions.",
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
      "What is the difference between Official Halts and All Passing Stations?",
    answer:
      "Official Halts are commercial railway stations where the train stops for passengers to board or alight and platform numbers are assigned. Switching to 'All' reveals intermediate railway block cabins and junctions used to track exact section-by-section movement.",
  },
  {
    question: "How do I find my Coach Position from the Engine before the train arrives?",
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
    <div className="rounded-3xl border border-line bg-card p-5 shadow-xl sm:p-7">
      <div className="h-6 w-56 animate-pulse rounded-lg bg-subcard" />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="h-14 animate-pulse rounded-2xl bg-subcard" />
        <div className="h-14 animate-pulse rounded-2xl bg-subcard" />
        <div className="h-14 animate-pulse rounded-2xl bg-subcard" />
      </div>
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

      {/* Mobile-First Warm Sunset Hero Banner */}
      <section className="ta-hero relative overflow-hidden pb-16 pt-6 sm:pb-24 sm:pt-12">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs + Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft"
            >
              <Link
                href="/"
                className="transition hover:text-orange-600 dark:hover:text-amber-300"
              >
                Home
              </Link>
              <span className="text-ink-muted">/</span>
              <Link
                href="/rail/pnr-status"
                className="transition hover:text-orange-600 dark:hover:text-amber-300"
              >
                Rail
              </Link>
              <span className="text-ink-muted">/</span>
              <span className="font-bold text-orange-700 dark:text-amber-300">
                Live Train Status
              </span>
            </nav>

            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-card/90 px-3 py-1.5 text-[11px] font-bold text-ink shadow-2xs transition hover:border-orange-500 sm:text-xs"
            >
              <TicketIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>10-Digit PNR Status</span>
              <ArrowRightIcon className="h-3 w-3 text-ink-muted" />
            </Link>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:mt-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3 py-1 text-[11px] font-extrabold text-orange-700 dark:text-amber-300 sm:text-xs">
                <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
                <span>INDIAN RAILWAYS LIVE GPS TRACKER</span>
              </div>

              <h1 className="mt-3 text-[1.75rem] font-black leading-[1.15] tracking-tight text-ink sm:mt-4 sm:text-5xl">
                Live Train{" "}
                <span className="text-orange-600 dark:text-amber-400">
                  Running Status
                </span>{" "}
                &amp; Spot Your Train
              </h1>

              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
                Track any Indian Railways train in real time with a blinking GPS
                station timeline, live delay predictions, platform numbers,
                route geometry map, and exact coach position from the engine.
              </p>
            </div>

            {/* Compact Live Signal Indicator Card on Desktop */}
            <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-line bg-card/85 px-4 py-3 shadow-xs lg:flex">
              <LiveTrainBeaconIcon size="md" active />
              <div>
                <p className="text-xs font-extrabold text-ink">
                  Real-Time Rail Radar
                </p>
                <p className="text-[11px] font-medium text-ink-muted">
                  All 17 Zones · Vande Bharat, Rajdhani &amp; Express
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Live Train Tracker Tool */}
      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-3.5 sm:-mt-16 sm:px-6 lg:px-8">
        <Suspense fallback={<LiveTrainFallback />}>
          <LiveTrainTracker />
        </Suspense>

        {/* Quick Assurance Strip */}
        <div className="mt-4 grid gap-2.5 rounded-2xl border border-line bg-card px-4 py-3.5 text-xs font-semibold text-ink-soft shadow-xs sm:mt-5 sm:grid-cols-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Auto-Detects Overnight Running Trains</span>
          </div>
          <div className="flex items-center gap-2">
            <CoachTrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
            <span>Engine-to-Guard Coach Rake Sequence</span>
          </div>
          <div className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
            <span>Vande Bharat, Rajdhani, Shatabdi &amp; Mail</span>
          </div>
        </div>
      </section>

      {/* Popular Indian Railways Live Trains Quick-Track Directory (SEO + 1-Tap Mobile) */}
      <section
        aria-labelledby="popular-trains-heading"
        className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <RadarLiveIcon className="h-3.5 w-3.5" />
              <span>POPULAR LIVE ROUTES</span>
            </p>
            <h2
              id="popular-trains-heading"
              className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-3xl"
            >
              Track Top Indian Railways Trains in One Tap
            </h2>
          </div>
          <p className="text-xs text-ink-soft sm:text-sm">
            Select any popular Express, Rajdhani, Shatabdi, or Vande Bharat
            corridor to view live station status.
          </p>
        </div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_LIVE_TRAINS.map((train) => (
            <Link
              key={train.trainNumber}
              href={`/rail/live-status?train=${train.trainNumber}`}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs transition hover:-translate-y-0.5 hover:border-orange-500/50 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/16 px-2.5 py-1 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                    <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>#{train.trainNumber}</span>
                  </span>
                  <span className="rounded-full bg-subcard px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-muted">
                    {train.type}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-snug text-ink group-hover:text-orange-600 dark:group-hover:text-amber-300">
                  {train.trainName}
                </h3>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-line pt-2.5 text-xs">
                <span className="inline-flex items-center gap-1 font-mono font-bold text-ink-soft">
                  <RouteTrackIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>
                    {train.sourceCode} → {train.destinationCode}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 font-extrabold text-orange-600 dark:text-amber-300">
                  <span>Track</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How to Spot Your Train Step-by-Step Section */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-line bg-band p-5 shadow-xs sm:p-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>QUICK STEP-BY-STEP GUIDE</span>
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              How to Spot Your Train Live in Under 5 Seconds
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-line bg-subcard/70 p-4 sm:p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/18 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-ink sm:text-base">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Breakdown Grid */}
      <section
        id="coach-guide"
        className="mx-auto mt-14 max-w-6xl scroll-mt-24 px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            COMPLETE RUNNING TELEMETRY
          </p>
          <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Everything You Need Before Stepping Onto the Platform
          </h2>
          <p className="mt-2 text-xs text-ink-soft sm:text-sm">
            Engineered for fast one-handed mobile checks on busy railway
            platforms and low-glare overnight journeys.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {LIVE_TRACKING_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-3xl border border-line bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-orange-500/40 sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-700 dark:text-amber-300 sm:h-11 sm:w-11">
                  {feat.icon}
                </span>
                <span className="rounded-full bg-amber-500/18 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-900 dark:text-amber-300">
                  {feat.badge}
                </span>
              </div>
              <h3 className="mt-3.5 text-sm font-extrabold text-ink sm:mt-4 sm:text-base">
                {feat.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Train Status Glossary for Travellers (SEO Semantic Block) */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            RAILWAY TERMINOLOGY DECODED
          </p>
          <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Understanding Indian Railways Live Running Terms
          </h2>
        </div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {STATUS_GLOSSARY.map((item) => (
            <div
              key={item.term}
              className="rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-extrabold text-ink">{item.term}</h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Train FAQ Section */}
      <section
        id="faq"
        className="mx-auto mt-14 max-w-4xl scroll-mt-24 px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            <HelpCircleIcon className="h-4 w-4" />
            <span>TRAVELLER QUESTIONS</span>
          </span>
          <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Live Train Running Status FAQs
          </h2>
        </div>

        <div className="mt-7 space-y-3 sm:mt-10 sm:space-y-3.5">
          {LIVE_TRAIN_FAQS.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink sm:text-base">
                <span className="inline-flex items-start gap-2.5 sm:items-center">
                  <HelpCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-amber-400 sm:mt-0" />
                  <span>{faq.question}</span>
                </span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subcard text-ink-soft transition group-open:rotate-180 group-open:bg-orange-500/20 group-open:text-orange-700 dark:group-open:text-amber-300">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom Cross-Link CTA Banner */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="ta-cta-banner rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-800 dark:text-amber-200">
                <TicketIcon className="h-3.5 w-3.5" />
                <span>BOOKED AN IRCTC TICKET?</span>
              </span>
              <h2 className="mt-3 text-xl font-black tracking-tight text-ink sm:text-2xl">
                Verify Your 10-Digit PNR Confirmation &amp; Berth Number
              </h2>
              <p className="mt-1.5 text-xs text-ink-soft sm:text-sm">
                Check real-time CNF / RAC / WL seat confirmation, chart
                preparation status, and exact coach &amp; berth numbers before
                boarding.
              </p>
            </div>
            <Link
              href="/rail/pnr-status"
              className="ta-btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold sm:w-auto"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Check Live PNR Status</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
