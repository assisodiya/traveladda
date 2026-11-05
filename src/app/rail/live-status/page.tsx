import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  BuildingStationIcon,
  ChevronDownIcon,
  ClockIcon,
  CoachTrainIcon,
  CompassIcon,
  GaugeSpeedIcon,
  HelpCircleIcon,
  NavigationIcon,
  RadarLiveIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveTrainTracker } from "@/components/LiveTrainTracker";

export const metadata: Metadata = {
  title:
    "Live Train Running Status | Spot Your Train, Platform & Coach Position",
  description:
    "Track live Indian Railways train running status by train number and start date. View current GPS station, platform numbers, expected delays, polyline route map, and coach rake sequence on TravelAdda.",
};

const LIVE_TRACKING_FEATURES = [
  {
    title: "Exact Station & GPS Position",
    description:
      "See whether your train has not started yet, is halted at a platform, or is moving between intermediate block stations with real-time kilometre progress.",
    icon: <NavigationIcon className="h-5 w-5" />,
    badge: "REAL-TIME",
  },
  {
    title: "Expected Arrival & Delay Alerts",
    description:
      "Compare scheduled timetable timings against predicted live arrivals and departures so you never wait unnecessarily at the platform.",
    icon: <ClockIcon className="h-5 w-5" />,
    badge: "DELAY RADAR",
  },
  {
    title: "Platform & Halt Breakdown",
    description:
      "Filter cleanly between official commercial passenger halts and all intermediate passing stations, complete with platform numbers and halt durations.",
    icon: <BuildingStationIcon className="h-5 w-5" />,
    badge: "PF NUMBERS",
  },
  {
    title: "Engine-to-Guard Coach Rake Order",
    description:
      "Inspect the exact coach sequence (ENG, LPR, C1–C13, E1–E2, B1, A1, S1) and search your coach code to know your exact position from the locomotive.",
    icon: <CoachTrainIcon className="h-5 w-5" />,
    badge: "COACH POSITION",
  },
  {
    title: "Interactive Polyline Route Map",
    description:
      "Visualize the entire railway corridor plotted from track geometry coordinates with clickable commercial halt pins.",
    icon: <CompassIcon className="h-5 w-5" />,
    badge: "ROUTE GEOMETRY",
  },
  {
    title: "Section Speed & Return Pair",
    description:
      "Check average speed, maximum section speed between halts, weekly operating days, and switch to the return train number in one click.",
    icon: <GaugeSpeedIcon className="h-5 w-5" />,
    badge: "TELEMETRY",
  },
];

const LIVE_TRAIN_FAQS = [
  {
    question:
      "Which date should I select when checking Live Train Running Status?",
    answer:
      "Always select the train's Origin Start Date — the date the train departed (or is scheduled to depart) from its very first source station. If you are boarding an overnight train after midnight on Day 2, choose Yesterday as the start date.",
  },
  {
    question:
      "What is the difference between Official Halts and Pass-Through Stations?",
    answer:
      "Official Halts are commercial stops where passengers can board or alight and platform numbers are assigned. Pass-through stations are intermediate railway block cabins and junctions that track the train's live movement and section speed without a scheduled stop.",
  },
  {
    question: "How do I use the Coach Position rake diagram on the platform?",
    answer:
      "Each train rake lists units starting from ENG (Locomotive Engine) at position #0, followed by luggage/power vans (LPR/EOG/SLR) and passenger coaches (#1, #2, #3...). Type your coach code (for example C8 or B2) in the Find Coach box to see how many coaches behind the engine you should stand.",
  },
  {
    question: "What does 'Not Started Yet' mean on a valid train lookup?",
    answer:
      "When you check a train for an upcoming departure later today or on a future date, Indian Railways loads the full route, coach composition, platform predictions, and scheduled timings while marking live movement as 'Not Started Yet' until the locomotive departs the origin station.",
  },
];

function LiveTrainFallback() {
  return (
    <div className="rounded-3xl border border-line bg-card p-7 shadow-xl">
      <div className="h-6 w-64 animate-pulse rounded-lg bg-subcard" />
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

  return (
    <main className="pb-20">
      {/* Warm Sunset / Golden Hero Banner */}
      <section className="ta-hero relative overflow-hidden pb-24 pt-12 sm:pb-28 sm:pt-16">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs + Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft"
            >
              <Link
                href="/"
                className="transition hover:text-orange-600 dark:hover:text-amber-300"
              >
                Home
              </Link>
              <span className="text-ink-muted">/</span>
              <span>Rail</span>
              <span className="text-ink-muted">/</span>
              <span className="font-bold text-orange-700 dark:text-amber-300">
                Live Train Status
              </span>
            </nav>

            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-card/85 px-3.5 py-1.5 text-xs font-bold text-ink transition hover:border-orange-500"
            >
              <TicketIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>Switch to 10-Digit PNR Status</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
            </Link>
          </div>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3.5 py-1 text-xs font-bold text-orange-700 dark:text-amber-300">
              <RadarLiveIcon className="h-3.5 w-3.5" />
              <span>INDIAN RAILWAYS LIVE TRAIN TRACKER</span>
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
              Spot Your{" "}
              <span className="text-orange-600 dark:text-amber-400">
                Live Train Status
              </span>{" "}
              &amp; Coach Position
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              Track any Indian Railways train in real time using its train
              number and start date. Inspect live station location, predicted
              delays, platform numbers, route geometry map, and exact coach
              order from the engine.
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping Live Train Tracker Tool */}
      <section className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <Suspense fallback={<LiveTrainFallback />}>
          <LiveTrainTracker />
        </Suspense>

        {/* Quick Assurance Strip */}
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-card px-5 py-4 text-xs font-semibold text-ink-soft shadow-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
            <span>Secure Server-to-Server Live Rail Gateway</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CoachTrainIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
            <span>Full Engine-to-Guard Coach Rake Sequence</span>
          </div>
          <div className="flex items-center gap-2.5">
            <TrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
            <span>Covers Superfast, Vande Bharat, Double Decker &amp; Mail</span>
          </div>
        </div>
      </section>

      {/* Feature Breakdown Grid */}
      <section
        id="coach-guide"
        className="mx-auto mt-20 max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            COMPLETE RUNNING TELEMETRY
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Everything you need before stepping onto the platform.
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Designed for clear readability in bright daylight platforms and
            smooth low-glare overnight journeys.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_TRACKING_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-3xl border border-line bg-card p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-orange-500/40"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
                  {feat.icon}
                </span>
                <span className="rounded-full bg-amber-500/18 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-900 dark:text-amber-300">
                  {feat.badge}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-ink">
                {feat.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Train FAQ Section */}
      <section
        id="faq"
        className="mx-auto mt-20 max-w-4xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            <HelpCircleIcon className="h-4 w-4" />
            <span>TRAVELLER QUESTIONS</span>
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Live Train Running Status FAQs
          </h2>
        </div>

        <div className="mt-10 space-y-3.5">
          {LIVE_TRAIN_FAQS.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-line bg-card p-5 shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-ink sm:text-base">
                <span className="inline-flex items-center gap-2.5">
                  <HelpCircleIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                  <span>{faq.question}</span>
                </span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subcard text-ink-soft transition group-open:rotate-180 group-open:bg-orange-500/20 group-open:text-orange-700 dark:group-open:text-amber-300">
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

