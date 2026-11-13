import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CoachTrainIcon,
  EngineTrainIcon,
  ShieldCheckIcon,
  SwapArrowsIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveTrainTracker } from "@/components/LiveTrainTracker";
import { buildChartTimePath } from "@/lib/chart-time-types";
import { fetchSeoTrainPageData } from "@/lib/live-train-service";
import {
  ALL_WEEK_DAYS,
  buildTrainLiveStatusPath,
  buildTrainSeoSlug,
  deriveTrainClasses,
  extractTrainNumberFromParam,
  findCatalogTrain,
  format24HourTime,
  formatIstTime,
  getRelatedCatalogTrains,
  isReservedChartEligibleTrain,
  isSuburbanLocalEmuTrain,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";

interface TrainPageProps {
  params: Promise<{ trainNumber: string }>;
}

export function generateStaticParams() {
  return POPULAR_LIVE_TRAINS.slice(0, 8).map((train) => ({
    trainNumber: buildTrainSeoSlug(train.trainNumber, train.trainName),
  }));
}

export async function generateMetadata({
  params,
}: TrainPageProps): Promise<Metadata> {
  "use cache";
  cacheLife("hours");

  const { trainNumber: rawParam } = await params;
  const data = await fetchSeoTrainPageData(rawParam);
  if (!data) {
    const fallbackDigits = extractTrainNumberFromParam(rawParam || "");
    if (!/^\d{3,5}$/.test(fallbackDigits)) {
      return {
        title: "Train Not Found | TravelAdda Live Train Running Status",
        robots: { index: false, follow: false },
      };
    }
    const fallbackCatalog = findCatalogTrain(fallbackDigits);
    const isSuburbanFallback = fallbackCatalog
      ? isSuburbanLocalEmuTrain(fallbackCatalog)
      : fallbackDigits.startsWith("0");
    return {
      title: `${fallbackDigits} Live Train Running Status & Time Table`,
      alternates: { canonical: buildTrainLiveStatusPath(fallbackDigits) },
      robots: isSuburbanFallback ? { index: false, follow: true } : undefined,
    };
  }

  const catalogTrain = findCatalogTrain(data.trainNumber);
  const shouldNoindexLiveStatus = catalogTrain
    ? isSuburbanLocalEmuTrain(catalogTrain)
    : data.trainNumber.startsWith("0");

  const canonicalPath = buildTrainLiveStatusPath(
    data.trainNumber,
    data.trainName
  );
  const haltStops = data.route.filter((s) => s.isHalt);
  const originStop = haltStops[0] ?? data.route[0];
  const destStop =
    haltStops[haltStops.length - 1] ?? data.route[data.route.length - 1];
  const dep24 = format24HourTime(
    originStop?.scheduledDeparture ?? originStop?.actualDeparture
  );
  const arr24 = format24HourTime(
    destStop?.scheduledArrival ?? destStop?.actualArrival
  );
  const classes = deriveTrainClasses(data.train.coaches, data.train.type);
  const distStr =
    data.train.distanceKm > 0 ? `${data.train.distanceKm} km` : "full route";
  const durStr =
    data.train.durationFormatted !== "--"
      ? data.train.durationFormatted
      : "scheduled duration";

  const title = `${data.trainNumber} ${data.trainName} Live Running Status, Time Table & Coach Position`;
  const description = `${data.trainNumber} ${data.trainName} runs from ${data.train.source.name} (${data.train.source.code}) to ${data.train.destination.name} (${data.train.destination.code}). Departs @ ${dep24}, arrives @ ${arr24}, covering ${distStr} in ${durStr} with ${data.train.totalHalts} halts. Spot ${data.trainNumber} live train running status, platform numbers, station time table & coach position (${classes.slice(0, 3).join(", ")}).`;

  return {
    title,
    description,
    keywords: [
      data.trainNumber,
      data.trainName,
      `${data.trainNumber} ${data.trainName}`,
      `${data.trainNumber} train running status`,
      `${data.trainNumber} live status`,
      `${data.trainNumber} time table`,
      `${data.trainNumber} route`,
      `${data.trainNumber} coach position`,
      `${data.trainName} live running status`,
      `${data.trainName} ${data.trainNumber} schedule`,
      `${data.train.source.name} to ${data.train.destination.name} ${data.trainNumber} train`,
      `spot train ${data.trainNumber}`,
      `where is train ${data.trainNumber}`,
    ],
    robots: shouldNoindexLiveStatus
      ? { index: false, follow: true }
      : undefined,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${data.trainNumber} ${data.trainName} Live Running Status & Time Table | TravelAdda`,
      description,
      url: canonicalPath,
      siteName: "TravelAdda",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.trainNumber} ${data.trainName} Live Status & Schedule`,
      description,
    },
  };
}

function LiveTrainFallback() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-md">
      <div className="h-14 animate-pulse rounded-xl bg-subcard" />
    </div>
  );
}

const SUNDAY_FIRST_DAYS = [
  { key: "sun", short: "S", label: "Sunday" },
  { key: "mon", short: "M", label: "Monday" },
  { key: "tue", short: "T", label: "Tuesday" },
  { key: "wed", short: "W", label: "Wednesday" },
  { key: "thu", short: "T", label: "Thursday" },
  { key: "fri", short: "F", label: "Friday" },
  { key: "sat", short: "S", label: "Saturday" },
] as const;

export default async function TrainLiveStatusByNumberPage({
  params,
}: TrainPageProps) {
  "use cache";
  cacheLife("hours");

  const { trainNumber: rawParam } = await params;
  const trainData = await fetchSeoTrainPageData(rawParam);
  if (!trainData) {
    notFound();
  }
  const cleanTrain = trainData.trainNumber;
  const canonicalPath = buildTrainLiveStatusPath(
    trainData.trainNumber,
    trainData.trainName
  );
  const incomingPath = `/rail/live-status/${decodeURIComponent(rawParam || "")
    .trim()
    .toLowerCase()}`;
  if (
    canonicalPath.startsWith("/rail/live-status/") &&
    incomingPath !== canonicalPath
  ) {
    permanentRedirect(canonicalPath);
  }
  const currentCatalogTrain = findCatalogTrain(cleanTrain);
  const showChartTimeLink = isReservedChartEligibleTrain({
    trainNumber: cleanTrain,
    type: currentCatalogTrain?.type || trainData.train.type,
  });

  const haltStops = trainData.route.filter((s) => s.isHalt);
  const scheduleStops = haltStops.length >= 2 ? haltStops : trainData.route;
  const originStop = scheduleStops[0];
  const destStop = scheduleStops[scheduleStops.length - 1];

  const dep24 = format24HourTime(
    originStop?.scheduledDeparture ?? originStop?.actualDeparture
  );
  const arr24 = format24HourTime(
    destStop?.scheduledArrival ?? destStop?.actualArrival
  );
  const dep12 = formatIstTime(
    originStop?.scheduledDeparture ?? originStop?.actualDeparture
  );
  const arr12 = formatIstTime(
    destStop?.scheduledArrival ?? destStop?.actualArrival
  );

  const classesAvailable = deriveTrainClasses(
    trainData.train.coaches,
    trainData.train.type
  );

  const runDaysReadable = trainData.train.isDaily
    ? "Daily (Monday to Sunday)"
    : ALL_WEEK_DAYS.filter((d) => trainData.train.runDays.includes(d.key))
        .map((d) => d.label)
        .join(", ") || "As per railway schedule";

  const intermediateHalts = scheduleStops.slice(1, -1);
  const majorHaltNames = intermediateHalts
    .slice(0, 8)
    .map((s) => `${s.stationName} (${s.stationCode})`)
    .join(", ");

  const trainFaqs = [
    {
      question: `Where is train ${trainData.trainNumber} ${trainData.trainName} right now?`,
      answer: `You can track ${trainData.trainNumber} ${trainData.trainName} live at the top of this page. Currently, its status is "${trainData.livePosition.headline}" (${trainData.livePosition.delayStatus}). The interactive tracker shows real-time GPS station progress, next halt ETA, and platform numbers between ${trainData.train.source.name} (${trainData.train.source.code}) and ${trainData.train.destination.name} (${trainData.train.destination.code}).`,
    },
    {
      question: `What is the route, distance, and journey duration of train ${trainData.trainNumber}?`,
      answer: `Train ${trainData.trainNumber} (${trainData.trainName}) operates from ${trainData.train.source.name} (${trainData.train.source.code}) to ${trainData.train.destination.name} (${trainData.train.destination.code}). It covers a total railway distance of ${trainData.train.distanceKm > 0 ? `${trainData.train.distanceKm} km` : "its scheduled corridor"} in ${trainData.train.durationFormatted !== "--" ? trainData.train.durationFormatted : "its scheduled time"} with ${trainData.train.totalHalts} commercial halts.`,
    },
    {
      question: `What are the departure and arrival timings of ${trainData.trainNumber} ${trainData.trainName}?`,
      answer: `Train ${trainData.trainNumber} is scheduled to depart from ${trainData.train.source.name} (${trainData.train.source.code}) at ${dep24} (${dep12})${originStop?.platform ? ` from Platform #${originStop.platform}` : ""} and arrives at ${trainData.train.destination.name} (${trainData.train.destination.code}) at ${arr24} (${arr12}) on Day ${destStop?.arrivalDay ?? 1}${destStop?.platform ? ` at Platform #${destStop.platform}` : ""}.`,
    },
    {
      question: `Which days of the week does train ${trainData.trainNumber} run?`,
      answer: `Train ${trainData.trainNumber} ${trainData.trainName} runs ${runDaysReadable}. Always select the train's origin start date from ${trainData.train.source.name} (${trainData.train.source.code}) or use TravelAdda's Auto (Live) mode when checking overnight running status.`,
    },
    {
      question: `What are the major intermediate halts of ${trainData.trainNumber} ${trainData.trainName}?`,
      answer: majorHaltNames
        ? `Along its route from ${trainData.train.source.code} to ${trainData.train.destination.code}, train ${trainData.trainNumber} halts at ${trainData.train.totalHalts} stations including ${majorHaltNames}. Full arrival, departure, halt duration, and platform details for every stop are listed in the schedule table above.`
        : `Train ${trainData.trainNumber} operates between ${trainData.train.source.name} (${trainData.train.source.code}) and ${trainData.train.destination.name} (${trainData.train.destination.code}). Check the full station schedule table on this page for exact arrival and departure times.`,
    },
    {
      question: `What classes and coach positions are available on train ${trainData.trainNumber}?`,
      answer: `Train ${trainData.trainNumber} (${trainData.trainName}) offers ${classesAvailable.join(", ")}.${trainData.train.coaches.length > 0 ? ` Its standard rake consists of ${trainData.train.coaches.length} units ordered from the locomotive engine (${trainData.train.coaches.slice(0, 8).map((c) => c.code).join("-")}).` : ""}${trainData.train.returnTrain ? ` The return service in the opposite direction is Train #${trainData.train.returnTrain}.` : ""}`,
    },
  ];

  const canonicalUrl = `https://traveladda.in${canonicalPath}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TrainTrip",
        trainNumber: trainData.trainNumber,
        trainName: trainData.trainName,
        name: `${trainData.trainNumber} ${trainData.trainName}`,
        description: `Live train running status, time table, route map, platform numbers, and coach position for ${trainData.trainNumber} ${trainData.trainName} from ${trainData.train.source.name} (${trainData.train.source.code}) to ${trainData.train.destination.name} (${trainData.train.destination.code}).`,
        url: canonicalUrl,
        departureStation: {
          "@type": "TrainStation",
          name: `${trainData.train.source.name} (${trainData.train.source.code})`,
          identifier: trainData.train.source.code,
        },
        arrivalStation: {
          "@type": "TrainStation",
          name: `${trainData.train.destination.name} (${trainData.train.destination.code})`,
          identifier: trainData.train.destination.code,
        },
        ...(originStop?.scheduledDeparture
          ? { departureTime: originStop.scheduledDeparture }
          : {}),
        ...(destStop?.scheduledArrival
          ? { arrivalTime: destStop.scheduledArrival }
          : {}),
        provider: {
          "@type": "Organization",
          name: "Indian Railways",
        },
      },
      {
        "@type": "WebApplication",
        name: `${trainData.trainNumber} ${trainData.trainName} Live Running Status Tracker`,
        url: canonicalUrl,
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        image: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
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
            item: "https://traveladda.in/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Live Train Status",
            item: "https://traveladda.in/rail/live-status",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${trainData.trainNumber} ${trainData.trainName}`,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: trainFaqs.map((faq) => ({
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

      {/* Clean Compact Navy Hero Header with Breadcrumbs & Key SEO Summary */}
      <section className="ta-navy-hero pb-12 pt-5 sm:pb-16 sm:pt-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/rail/live-status" className="hover:text-white">
                Trains
              </Link>
              <span>/</span>
              <Link href="/rail/live-status" className="hover:text-white">
                Train Time Table &amp; Live Status
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {trainData.trainNumber} {trainData.trainName}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              {trainData.train.returnTrain && (
                <Link
                  href={buildTrainLiveStatusPath(trainData.train.returnTrain)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
                >
                  <SwapArrowsIcon className="h-3.5 w-3.5" />
                  <span>Return #{trainData.train.returnTrain}</span>
                </Link>
              )}
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
              >
                <TicketIcon className="h-3.5 w-3.5" />
                <span>Check PNR Status</span>
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#ff5a1f] px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                TRAIN #{trainData.trainNumber}
              </span>
              <span className="rounded border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-200">
                {trainData.train.type}
              </span>
              <span className="rounded border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                {trainData.train.source.code} → {trainData.train.destination.code}
              </span>
            </div>

            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {trainData.trainNumber} {trainData.trainName} Live Running Status
              &amp; Time Table
            </h1>

            <p className="mt-2 max-w-4xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              Track <strong>Train {trainData.trainNumber}</strong> (
              <strong>{trainData.trainName}</strong>) live running status today.
              Operates from{" "}
              <strong>
                {trainData.train.source.name} ({trainData.train.source.code})
              </strong>{" "}
              to{" "}
              <strong>
                {trainData.train.destination.name} (
                {trainData.train.destination.code})
              </strong>
              {trainData.train.distanceKm > 0
                ? `, covering ${trainData.train.distanceKm.toLocaleString("en-IN")} km`
                : ""}
              {trainData.train.durationFormatted !== "--"
                ? ` in ${trainData.train.durationFormatted}`
                : ""}{" "}
              with <strong>{trainData.train.totalHalts} halts</strong>. Departs{" "}
              {trainData.train.source.code} @ <strong>{dep24}</strong> &amp;
              arrives {trainData.train.destination.code} @{" "}
              <strong>{arr24}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Live Train Tracker Widget (Pre-Populated with SSR Train Data) */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<LiveTrainFallback />}>
          <LiveTrainTracker
            initialTrainNumber={cleanTrain}
            initialData={trainData}
          />
        </Suspense>

        {/* Quick Anchor Jump Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3 text-xs font-semibold text-ink-soft">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <a
              href="#about-train"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              About {trainData.trainNumber}
            </a>
            <span className="text-line-strong">·</span>
            <a
              href="#train-schedule"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              {trainData.trainNumber} Time Table ({scheduleStops.length} Stops)
            </a>
            <span className="text-line-strong">·</span>
            <a
              href="#coach-position"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              Coach Position ({trainData.train.coaches.length || "Standard"}{" "}
              Coaches)
            </a>
            <span className="text-line-strong">·</span>
            <a
              href="#train-faq"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              FAQs
            </a>
            {showChartTimeLink && (
              <>
                <span className="text-line-strong">·</span>
                <Link
                  href={buildChartTimePath(
                    trainData.trainNumber,
                    trainData.trainName
                  )}
                  className="font-bold text-[#fc6203] hover:underline"
                >
                  {trainData.trainNumber} Chart Preparation Time →
                </Link>
              </>
            )}
            <span className="text-line-strong">·</span>
            <Link
              href="/rail/refund-calculator"
              className="font-bold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Calculate {trainData.trainNumber} Refund →
            </Link>
          </div>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Live NTES / GPS Synchronized</span>
          </span>
        </div>

        {/* Cross-Tool Intent Loop: Train Delayed >3h TDR 100% Refund & PRS Refund Calculator */}
        <div className="mt-4 rounded-2xl border border-[#1956b4]/25 bg-blue-50/70 p-4 shadow-2xs dark:border-blue-500/30 dark:bg-blue-950/30">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-ink sm:text-sm">
                Is {trainData.trainNumber} {trainData.trainName} Delayed &gt;3 Hours or Need to Cancel Your Ticket?
              </div>
              <p className="text-xs text-ink-soft">
                If Train {trainData.trainNumber} is running more than <strong>3 hours late</strong> at your boarding station and you do not travel, file an online TDR before departure for a{" "}
                <strong>100% Full Fare Refund (₹0 deduction)</strong>, or calculate your exact CRIS PRS cancellation refund.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/rail/refund-calculator/train-cancelled-delayed-3-hours-tdr-refund-calculator"
                className="rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#144696]"
              >
                3+ Hr Delay 100% TDR Refund →
              </Link>
              <Link
                href="/rail/refund-calculator"
                className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                Calculate PRS Refund
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: About Train {trainName} ({trainNumber}) — Overview Table + Google AI Overview Key Details */}
      <section
        id="about-train"
        aria-labelledby="about-train-heading"
        className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="border-b border-line bg-subcard px-4 py-4 sm:px-6">
            <h2
              id="about-train-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              About {trainData.trainName} ({trainData.trainNumber})
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Official route summary, running days, travel classes, distance,
              and average duration for Train {trainData.trainNumber}.
            </p>
          </div>

          {/* Horizontal Summary Table (EaseMyTrip / ConfirmTkt Style) */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-subcard/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 sm:px-5">Train Name &amp; No.</th>
                  <th className="px-4 py-3">Runs On</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Classes</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3 sm:px-5">Average Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line bg-card align-middle">
                  <td className="px-4 py-4 sm:px-5">
                    <div className="font-extrabold text-ink">
                      {trainData.trainName}
                    </div>
                    <div className="mt-0.5 font-mono text-xs font-bold text-[#1956b4] dark:text-blue-400">
                      #{trainData.trainNumber} · {trainData.train.type}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {SUNDAY_FIRST_DAYS.map((d) => {
                        const active = trainData.train.runDays.includes(d.key);
                        return (
                          <span
                            key={d.key}
                            title={d.label}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded font-mono text-xs font-extrabold ${
                              active
                                ? "bg-blue-50 text-[#1956b4] ring-1 ring-[#1956b4]/30 dark:bg-blue-500/20 dark:text-blue-300"
                                : "bg-subcard text-ink-muted opacity-40"
                            }`}
                          >
                            {d.short}
                          </span>
                        );
                      })}
                    </div>
                    <div className="mt-1 text-[11px] font-medium text-ink-muted">
                      {trainData.train.isDaily ? "Runs Daily" : runDaysReadable}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-ink">
                      {trainData.train.source.name}
                    </div>
                    <div className="font-mono text-xs font-semibold text-ink-muted">
                      ({trainData.train.source.code}) · Dep {dep24}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-ink">
                      {trainData.train.destination.name}
                    </div>
                    <div className="font-mono text-xs font-semibold text-ink-muted">
                      ({trainData.train.destination.code}) · Arr {arr24}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {classesAvailable.map((cls) => (
                        <span
                          key={cls}
                          className="rounded border border-line bg-subcard px-2 py-0.5 text-[11px] font-bold text-ink-soft"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-ink">
                    {trainData.train.distanceKm > 0
                      ? `${trainData.train.distanceKm} KM`
                      : "--"}
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-ink sm:px-5">
                    <div>{trainData.train.durationFormatted}</div>
                    <div className="mt-0.5 font-sans text-[11px] font-normal text-ink-muted">
                      {trainData.train.totalHalts} Halts
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Details Bullet Summary (Structured for Google AI Overview & Featured Snippets) */}
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                Key Details — {trainData.trainNumber} {trainData.trainName}
              </h3>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">Route:</strong>{" "}
                    {trainData.train.source.name} ({trainData.train.source.code})
                    to {trainData.train.destination.name} (
                    {trainData.train.destination.code})
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">
                      Distance &amp; Duration:
                    </strong>{" "}
                    Covers{" "}
                    <strong className="text-ink">
                      {trainData.train.distanceKm > 0
                        ? `${trainData.train.distanceKm.toLocaleString("en-IN")} km`
                        : "scheduled route"}
                    </strong>{" "}
                    in{" "}
                    <strong className="text-ink">
                      {trainData.train.durationFormatted}
                    </strong>{" "}
                    ({trainData.train.totalHalts} commercial stops)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">Classes Available:</strong>{" "}
                    {classesAvailable.join(", ")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">Schedule:</strong> Departs{" "}
                    {trainData.train.source.name} at{" "}
                    <strong className="text-ink">
                      {dep24} ({dep12})
                    </strong>{" "}
                    and arrives at {trainData.train.destination.name} at{" "}
                    <strong className="text-ink">
                      {arr24} ({arr12})
                    </strong>{" "}
                    (Day {destStop?.arrivalDay ?? 1})
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-subcard/70 p-4 text-xs leading-relaxed text-ink-soft sm:text-sm">
              <p>
                <strong className="text-ink">
                  Train {trainData.trainNumber}
                </strong>{" "}
                is the{" "}
                <strong className="text-ink">{trainData.trainName}</strong>, a{" "}
                {trainData.train.isDaily ? "daily" : "scheduled"}{" "}
                {trainData.train.type.toLowerCase()} service connecting{" "}
                <strong className="text-ink">
                  {trainData.train.source.name} ({trainData.train.source.code})
                </strong>{" "}
                and{" "}
                <strong className="text-ink">
                  {trainData.train.destination.name} (
                  {trainData.train.destination.code})
                </strong>
                .
                {majorHaltNames
                  ? ` Key intermediate stations along the route include ${majorHaltNames}.`
                  : ""}
              </p>
              {trainData.train.returnTrain && (
                <p className="mt-2.5">
                  Looking for the return direction? Check{" "}
                  <Link
                    href={buildTrainLiveStatusPath(trainData.train.returnTrain)}
                    className="font-bold text-[#1956b4] underline decoration-[#1956b4]/40 underline-offset-2 hover:decoration-[#1956b4] dark:text-blue-400"
                  >
                    Train #{trainData.train.returnTrain} Live Running Status
                    &amp; Time Table
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: {trainName} ({trainNumber}) Timings & Schedule Table (SSR Semantic Table for Google Indexing) */}
      <section
        id="train-schedule"
        aria-labelledby="schedule-heading"
        className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subcard px-4 py-4 sm:px-6">
            <div>
              <h2
                id="schedule-heading"
                className="text-lg font-extrabold text-ink sm:text-xl"
              >
                {trainData.trainName} ({trainData.trainNumber}) Timings &amp;
                Schedule
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                Complete station-by-station time table from{" "}
                {trainData.train.source.name} ({trainData.train.source.code}) to{" "}
                {trainData.train.destination.name} (
                {trainData.train.destination.code}) with arrival, departure,
                halt time, platform number, and distance.
              </p>
            </div>
            <span className="rounded-lg border border-line bg-card px-3 py-1 font-mono text-xs font-bold text-ink-soft">
              {scheduleStops.length} Commercial Stops
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-subcard/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 sm:px-5">#</th>
                  <th className="px-4 py-3">Starting From / Station</th>
                  <th className="px-4 py-3 text-center">Day</th>
                  <th className="px-4 py-3">Arrival</th>
                  <th className="px-4 py-3">Departure</th>
                  <th className="px-4 py-3">Halt</th>
                  <th className="px-4 py-3 text-center">Platform No.</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3 text-right sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {scheduleStops.map((stop, idx) => {
                  const isOrigin = idx === 0;
                  const isDest = idx === scheduleStops.length - 1;
                  const arrTime = isOrigin
                    ? "--"
                    : format24HourTime(
                        stop.scheduledArrival ?? stop.actualArrival
                      );
                  const depTime = isDest
                    ? "--"
                    : format24HourTime(
                        stop.scheduledDeparture ?? stop.actualDeparture
                      );
                  const haltFormatted =
                    isOrigin || isDest
                      ? "--"
                      : stop.haltMinutes && stop.haltMinutes > 0
                        ? `${String(stop.haltMinutes).padStart(2, "0")}:00 min`
                        : "02:00 min";

                  return (
                    <tr
                      key={`${stop.stationCode}-${stop.sequence}`}
                      className={`transition hover:bg-subcard/50 ${
                        stop.stopState === "current"
                          ? "bg-emerald-50/70 dark:bg-emerald-500/10"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-ink-muted sm:px-5">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold uppercase text-ink">
                            {stop.stationName}
                          </span>
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                            {stop.stationCode}
                          </span>
                          {isOrigin && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              Origin
                            </span>
                          )}
                          {isDest && (
                            <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#e04812] dark:bg-orange-500/15 dark:text-orange-300">
                              Destination
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-ink">
                        {stop.departureDay || stop.arrivalDay || 1}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-ink">
                        {arrTime}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-ink">
                        {depTime}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-soft">
                        {haltFormatted}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-xs font-bold text-ink-soft">
                        {stop.platform ? `PF #${stop.platform}` : "-"}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-ink">
                        {Math.round(stop.distanceKm)} KM
                      </td>
                      <td className="px-4 py-3.5 text-right sm:px-5">
                        <Link
                          href="/rail/pnr-status"
                          className="ta-btn-primary inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-bold"
                        >
                          Check PNR
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: Coach Position & Rake Composition */}
      {trainData.train.coaches.length > 0 && (
        <section
          id="coach-position"
          aria-labelledby="coach-heading"
          className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                  <CoachTrainIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2
                    id="coach-heading"
                    className="text-lg font-extrabold text-ink sm:text-xl"
                  >
                    {trainData.trainNumber} {trainData.trainName} Coach Position
                    from Engine
                  </h2>
                  <p className="text-xs text-ink-soft">
                    Standard rake sequence of {trainData.train.coaches.length}{" "}
                    units ordered from the front locomotive (ENG).
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-subcard px-3 py-1 font-mono text-xs font-bold text-ink-soft">
                Classes: {classesAvailable.join(" · ")}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {trainData.train.coaches.map((coach) => {
                const isEngine = coach.role === "locomotive";
                return (
                  <div
                    key={`${coach.code}-${coach.index}`}
                    className={`flex min-w-[68px] flex-col items-center rounded-xl border px-2.5 py-2 text-center ${
                      isEngine
                        ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200"
                        : "border-line bg-subcard/70 text-ink"
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold text-ink-muted">
                      {isEngine ? "LOCO" : `#${coach.coachOrderFromEngine}`}
                    </span>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-xs font-extrabold">
                      {isEngine && <EngineTrainIcon className="h-3.5 w-3.5" />}
                      <span>{coach.code}</span>
                    </div>
                    <span className="mt-0.5 line-clamp-1 text-[10px] text-ink-soft">
                      {coach.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Train-Specific Frequently Asked Questions */}
      <section
        id="train-faq"
        aria-labelledby="train-faq-heading"
        className="mx-auto mt-10 max-w-4xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <h2
          id="train-faq-heading"
          className="text-lg font-extrabold text-ink sm:text-xl"
        >
          Frequently Asked Questions — Train {trainData.trainNumber}{" "}
          {trainData.trainName}
        </h2>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {trainFaqs.map((faq, idx) => (
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

      {/* SECTION 5: Directory of Other Popular Indian Railways Trains (Internal Linking for Crawlability) */}
      <section
        aria-labelledby="other-trains-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="other-trains-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              Other Popular Trains — Live Running Status &amp; Time Table
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Explore live station schedules, platform numbers, and coach
              positions for major Indian Railways trains.
            </p>
          </div>
          <Link
            href="/rail/live-status"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <TrainIcon className="h-3.5 w-3.5" />
            <span>Search Any Train Number</span>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {getRelatedCatalogTrains(cleanTrain, 16, {
            excludeSuburban: true,
          }).map((train) => (
            <div
              key={train.trainNumber}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <Link
                href={buildTrainLiveStatusPath(
                  train.trainNumber,
                  train.trainName
                )}
                className="block"
              >
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
              </Link>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                <span className="font-mono font-semibold text-ink-soft">
                  {train.sourceCode} → {train.destinationCode}
                </span>
                <div className="flex items-center gap-2">
                  {isReservedChartEligibleTrain(train) && (
                    <Link
                      href={buildChartTimePath(
                        train.trainNumber,
                        train.trainName
                      )}
                      className="rounded bg-subcard px-1.5 py-0.5 text-[10px] font-bold text-ink-soft hover:text-[#1956b4] dark:hover:text-blue-300"
                      title={`${train.trainNumber} Chart Preparation Time`}
                    >
                      Chart
                    </Link>
                  )}
                  <Link
                    href={buildTrainLiveStatusPath(
                      train.trainNumber,
                      train.trainName
                    )}
                    className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
                  >
                    <span>Spot</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

