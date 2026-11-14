import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BuildingStationIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { TrainChartTimeChecker } from "@/components/TrainChartTimeChecker";
import {
  FEATURED_SEO_BLOG_POSTS,
  RAIL_BLOG_POSTS,
} from "@/lib/blog-data";
import { buildChartTimePath, POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";
import {
  ALL_CATALOG_TRAINS,
  buildTrainLiveStatusPath,
  isReservedChartEligibleTrain,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";

export const metadata: Metadata = {
  title:
    "Train Chart Preparation Time & Charting Station Finder | 1st & 2nd IRCTC Chart Time",
  description:
    "Check exact 1st reservation chart and 2nd vacancy chart preparation time for any Indian Railways train by train number. Find your boarding station's remote charting station (chartRemoteStation) and station-by-station charting schedule on TravelAdda.",
  keywords: [
    "train chart preparation time",
    "irctc chart preparation time",
    "charting station of train",
    "first chart and second chart time",
    "remote charting station indian railways",
    "12952 mmct tejas raj chart time",
    "vacancy chart preparation time",
    "when is train chart prepared",
    "irctc 1st chart and 2nd chart time",
    "railway chart preparation time calculator",
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
  twitter: {
    card: "summary_large_image",
    title: "Train Chart Preparation Time & Charting Station Finder | TravelAdda",
    description:
      "Check exact 1st reservation chart time, 2nd vacancy chart time & remote charting station (chartRemoteStation) for any Indian Railways train.",
  },
};

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Enter 4 or 5-Digit Train Number",
    detail:
      "Type any Indian Railways train number (such as 12952 MMCT Tejas Rajdhani, 12951, 22436 Vande Bharat, or 12002 Shatabdi) in the search bar.",
  },
  {
    step: "2",
    title: "Select Your Boarding Station",
    detail:
      "Tap your boarding station pill to spotlight its exact 1st Reservation Chart Time, 2nd (Vacancy) Chart Time, and Day Offset.",
  },
  {
    step: "3",
    title: "Verify Your Remote Charting Hub",
    detail:
      "See whether your station prepares its own chart (Primary Hub) or has its chart locked earlier at an upstream Remote Charting Station (chartRemoteStation).",
  },
];

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
  {
    question:
      "Can I book confirmed Current Availability tickets between the 1st and 2nd chart?",
    answer:
      "Yes! Immediately after the 1st reservation chart is prepared for a charting station, any leftover vacant berths open under IRCTC Current Booking (CURR_AVBL) until the 2nd (vacancy) chart is locked 15–30 minutes before departure.",
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

  const featuredChartBlog = FEATURED_SEO_BLOG_POSTS.find(
    (p) =>
      p.slug ===
      "train-chart-preparation-time-remote-charting-station-indian-railways"
  );
  const relatedRailGuides = [
    ...(featuredChartBlog ? [featuredChartBlog] : []),
    ...RAIL_BLOG_POSTS,
  ].slice(0, 3);

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
        "@type": "HowTo",
        name: "How to Check Indian Railways Train Chart Preparation Time & Remote Charting Station",
        step: HOW_IT_WORKS_STEPS.map((s, idx) => ({
          "@type": "HowToStep",
          position: idx + 1,
          name: s.title,
          text: s.detail,
        })),
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

        {/* Cross-Tool Intent Loop: Pre-Chart vs Post-Chart PRS Refund Calculator */}
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 shadow-2xs dark:border-amber-500/30 dark:bg-amber-950/30">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-ink sm:text-sm">
                Cancelling Before or After 1st Reservation Chart Preparation?
              </div>
              <p className="text-xs text-ink-soft">
                Once the 1st chart locks, <strong>Confirmed (CNF) tickets get ₹0 refund</strong>, whereas{" "}
                <strong>RAC &amp; Waitlisted (WL) tickets still get full refund minus ₹60/₹65 clerkage</strong>{" "}
                up to 30 mins before departure. Check exact PRS deduction for{" "}
                <strong>48h/12h/4h Regular Trains vs 72h/8h Vande Bharat Sleeper</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/rail/refund-calculator/after-chart-preparation-train-ticket-cancellation-rules"
                className="rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#144696]"
              >
                Post-Chart Refund Rules →
              </Link>
              <Link
                href="/rail/refund-calculator"
                className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                Open PRS Refund Calculator
              </Link>
            </div>
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
              href={`/chart-times/${train.slug}`}
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

        {/* Open Crawlable Directory Across All Reserved Train Series */}
        {(() => {
          const allReserved = ALL_CATALOG_TRAINS.filter((t) =>
            isReservedChartEligibleTrain(t)
          );
          const hubDirectorySet = new Set<string>();
          const hubDirectoryTrains: typeof allReserved = [];

          // 1. Include all flagship popular reserved trains first
          for (const t of POPULAR_LIVE_TRAINS) {
            if (
              isReservedChartEligibleTrain(t) &&
              !hubDirectorySet.has(t.trainNumber)
            ) {
              hubDirectorySet.add(t.trainNumber);
              hubDirectoryTrains.push(t);
            }
          }

          // 2. Evenly sample across the entire reserved catalog (10xxx through 22xxx)
          // so every zone/number block sits within 1–2 crawl hops of this hub
          const targetTotal = 264;
          const remainingSlots = Math.max(
            0,
            targetTotal - hubDirectoryTrains.length
          );
          const step = Math.max(
            1,
            Math.floor(allReserved.length / Math.max(1, remainingSlots))
          );
          for (
            let idx = 0;
            idx < allReserved.length && hubDirectoryTrains.length < targetTotal;
            idx += step
          ) {
            const candidate = allReserved[idx];
            if (candidate && !hubDirectorySet.has(candidate.trainNumber)) {
              hubDirectorySet.add(candidate.trainNumber);
              hubDirectoryTrains.push(candidate);
            }
          }

          return (
            <div
              id="all-chart-trains"
              className="mt-6 scroll-mt-24 rounded-2xl border border-line bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-ink sm:text-base">
                  All-India Reserved Trains — Station-Wise 1st &amp; 2nd Chart
                  Time Directory ({allReserved.length.toLocaleString("en-IN")}+
                  Trains)
                </h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                  Zone-Wide Index
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Select any Rajdhani, Vande Bharat, Shatabdi, Superfast, or
                Mail/Express train below to inspect its 1st reservation chart
                time, 2nd vacancy chart time, and remote charting station (
                <code className="font-mono">chartRemoteStation</code>):
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
                {hubDirectoryTrains.map((train) => (
                  <div
                    key={`chart-dir-${train.trainNumber}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line/70 bg-subcard/40 px-3 py-2 text-xs transition hover:border-[#1956b4]"
                  >
                    <Link
                      href={buildChartTimePath(
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
                      href={buildTrainLiveStatusPath(
                        train.trainNumber,
                        train.trainName
                      )}
                      className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:underline dark:bg-emerald-500/15 dark:text-emerald-300"
                      title={`${train.trainNumber} Live Train Running Status`}
                    >
                      Live Status
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 3-Step How It Works */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          How to Check Train Chart Preparation Time &amp; Charting Station Online
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

      {/* Charting & Rail Blog Guides Section */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-400">
              <BookOpenIcon className="h-3.5 w-3.5" />
              <span>Expert Railway Guides</span>
            </span>
            <h2 className="mt-1 text-lg font-extrabold text-ink sm:text-xl">
              IRCTC Chart Preparation Rules, Remote Hubs &amp; PNR Guides
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Deep-dive articles explaining 1st &amp; 2nd reservation charts,
              remote charting hubs, and waitlist confirmation priority.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            View All Guides →
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {relatedRailGuides.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm sm:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-ink-muted">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400 sm:text-base">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#fc6203]">
                <span>Read Charting Guide</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
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

      {/* Bottom Cross-Link CTA */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <div className="ta-cta-banner rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-extrabold text-ink sm:text-xl">
                Has Your Station&apos;s Chart Been Prepared? Check Your 10-Digit PNR Now
              </h2>
              <p className="mt-1 text-xs text-ink-soft sm:text-sm">
                Verify your final CNF coach &amp; berth number or spot your
                train&apos;s live GPS running status.
              </p>
            </div>
            <div className="flex w-full flex-wrap gap-2.5 sm:w-auto">
              <Link
                href="/rail/pnr-status"
                className="ta-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold sm:flex-initial sm:text-sm"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check 10-Digit PNR</span>
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-card px-5 py-3 text-xs font-bold text-ink transition hover:border-[#1956b4] sm:flex-initial sm:text-sm"
              >
                <TrainIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Spot Train Live</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
