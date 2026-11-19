import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
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
import { fetchSeoChartTimePageData } from "@/lib/chart-time-service";
import {
  buildChartTimePath,
  extractTrainNumberFromChartSlug,
} from "@/lib/chart-time-types";
import {
  buildTrainLiveStatusPath,
  findCatalogTrain,
  getRelatedCatalogTrains,
  isReservedChartEligibleTrain,
} from "@/lib/live-train-types";

interface ChartTimeSlugPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ChartTimeSlugPageProps): Promise<Metadata> {

  const { slug: rawSlug } = await params;
  const data = await fetchSeoChartTimePageData(rawSlug);
  if (!data) {
    const fallbackDigits = extractTrainNumberFromChartSlug(rawSlug || "");
    if (!/^\d{3,5}$/.test(fallbackDigits)) {
      return {
        title: "Train Chart Time Not Found | TravelAdda",
        robots: { index: false, follow: false },
      };
    }
    const fallbackCatalog = findCatalogTrain(fallbackDigits);
    const shouldIndexFallback = fallbackCatalog
      ? isReservedChartEligibleTrain(fallbackCatalog)
      : false;
    return {
      title: `${fallbackDigits} Train Chart Preparation Time (1st & 2nd Chart)`,
      alternates: { canonical: buildChartTimePath(fallbackDigits) },
      robots: shouldIndexFallback
        ? undefined
        : { index: false, follow: true },
    };
  }

  const catalogTrain = findCatalogTrain(data.trainNumber);
  const isChartIndexable = catalogTrain
    ? isReservedChartEligibleTrain(catalogTrain)
    : !data.trainNumber.startsWith("0");

  const canonicalPath = buildChartTimePath(
    data.trainNumber,
    data.trainName,
    data.slug
  );
  const hubList = data.chartingZones
    .map((z) => z.remoteStationCode)
    .join(", ");

  const title = `${data.trainNumber} ${data.trainName} Chart Preparation Time (1st & 2nd Chart) & Charting Station`;
  const description = `The 1st reservation chart for ${data.trainNumber} ${data.trainName} is prepared at ${data.originStationName} (${data.originStation}) around ${data.originFirstChart12h}, and the 2nd (vacancy) chart around ${data.originSecondChart12h}. Check station-by-station 1st & 2nd chart preparation times and remote charting stations (${hubList}) on the ${data.originStation} to ${data.destinationStation} route.`;

  return {
    title,
    description,
    keywords: [
      `${data.trainNumber} chart time`,
      `${data.trainNumber} chart preparation time`,
      `${data.trainNumber} ${data.trainName} chart time`,
      `${data.trainNumber} 1st chart and 2nd chart time`,
      `${data.trainNumber} charting station`,
      `${data.trainNumber} remote charting station`,
      `${data.slug.replace(/-/g, " ")}`,
      `when is chart prepared for ${data.trainNumber}`,
      `${data.originStation} to ${data.destinationStation} ${data.trainNumber} chart time`,
    ],
    robots: isChartIndexable ? undefined : { index: false, follow: true },
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${data.trainNumber} ${data.trainName} Chart Preparation Time (1st & 2nd Chart) | TravelAdda`,
      description,
      url: canonicalPath,
      siteName: "TravelAdda",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.trainNumber} ${data.trainName} 1st & 2nd Chart Time`,
      description,
    },
  };
}

function ChartTimeFallback() {
  return (
    <div className="rounded-2xl border border-line bg-card p-6 shadow-md">
      <div className="h-14 animate-pulse rounded-xl bg-subcard" />
    </div>
  );
}

export default async function ChartTimeByTrainSlugPage({
  params,
}: ChartTimeSlugPageProps) {

  const { slug: rawSlug } = await params;
  const chartData = await fetchSeoChartTimePageData(rawSlug);
  if (!chartData) {
    notFound();
  }

  const canonicalPath = buildChartTimePath(
    chartData.trainNumber,
    chartData.trainName,
    chartData.slug
  );
  const incomingPath = `/chart-times/${decodeURIComponent(rawSlug || "")
    .trim()
    .toLowerCase()}`;
  if (canonicalPath.startsWith("/chart-times/") && incomingPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }
  const canonicalUrl = `https://traveladda.in${canonicalPath}`;
  const liveStatusPath = buildTrainLiveStatusPath(
    chartData.trainNumber,
    chartData.trainName
  );

  const hubSummary = chartData.chartingZones
    .map(
      (z) =>
        `${z.remoteStationName} (${z.remoteStationCode} — 1st Chart ${z.chartOneFormatted12h}, 2nd Chart ${z.chartTwoFormatted12h})`
    )
    .join("; ");

  const remoteMappedExamples = chartData.stations
    .filter((s) => !s.isPrimaryChartHub)
    .slice(0, 4)
    .map(
      (s) =>
        `${s.stationName} (${s.stationCode} → charted at ${s.chartRemoteStationName} ${s.chartRemoteStation} around ${s.chartOneFormatted12h})`
    )
    .join(", ");

  const chartFaqs = [
    {
      question: `When is the 1st and 2nd reservation chart prepared for ${chartData.trainNumber} ${chartData.trainName}?`,
      answer: `At the origin station ${chartData.originStationName} (${chartData.originStation}), the 1st reservation chart for Train ${chartData.trainNumber} (${chartData.trainName}) is prepared around ${chartData.originFirstChart12h}, and the 2nd (vacancy) chart is locked around ${chartData.originSecondChart12h} before its ${chartData.stations[0]?.departureFormatted || "scheduled"} departure.`,
    },
    {
      question: `What are the Primary Charting Stations (Remote Hubs) for Train ${chartData.trainNumber}?`,
      answer: `Train ${chartData.trainNumber} (${chartData.originStation} to ${chartData.destinationStation}) is divided into ${chartData.uniqueChartHubCount} charting ${chartData.uniqueChartHubCount === 1 ? "zone" : "zones"}: ${hubSummary}.`,
    },
    {
      question: `Which stations on ${chartData.trainNumber} ${chartData.trainName} have their chart prepared at an upstream Remote Charting Station?`,
      answer: remoteMappedExamples
        ? `On Train ${chartData.trainNumber}, downstream stations mapped to an upstream remote charting hub include: ${remoteMappedExamples}. Always check your boarding station's assigned Charting Hub in the table above so you know the exact hour your WL/RAC ticket locks.`
        : `Every commercial stop on Train ${chartData.trainNumber} is mapped to its corresponding PRS charting hub (${chartData.chartingZones.map((z) => z.remoteStationCode).join(", ")}) as shown in the station-by-station table on this page.`,
    },
    {
      question: `Can I book Current Availability (CURR_AVBL) tickets on ${chartData.trainNumber} ${chartData.trainName}?`,
      answer: `Yes. Right after the 1st reservation chart is prepared (${chartData.originFirstChart12h} at ${chartData.originStation}), any remaining vacant berths open under IRCTC Current Booking until the 2nd (vacancy) chart locks at ${chartData.originSecondChart12h}.`,
    },
    {
      question: `What happens if my waitlisted ticket on Train ${chartData.trainNumber} does not confirm in the 1st chart?`,
      answer: `If your WL or RAC ticket on ${chartData.trainNumber} does not clear during the 1st chart (${chartData.originFirstChart12h}), it remains eligible for last-minute cancellation upgrades in the 2nd vacancy chart (${chartData.originSecondChart12h}). Fully waitlisted e-tickets after the 2nd chart are automatically cancelled and refunded by IRCTC.`,
    },
    {
      question: `How can I check my PNR confirmation and live train position for ${chartData.trainNumber}?`,
      answer: `Once your boarding station's chart is prepared, enter your 10-digit PNR on TravelAdda's PNR Status page to view your final coach and berth number, or open the ${chartData.trainNumber} Live Running Status page to track real-time delays, platform numbers, and coach position from the engine.`,
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${chartData.trainNumber} ${chartData.trainName} Chart Preparation Time & Charting Station Finder`,
        url: canonicalUrl,
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        image: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
        description: chartData.summary,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "TrainTrip",
        trainNumber: chartData.trainNumber,
        trainName: chartData.trainName,
        name: `${chartData.trainNumber} ${chartData.trainName} Chart Preparation Schedule`,
        url: canonicalUrl,
        departureStation: {
          "@type": "TrainStation",
          name: `${chartData.originStationName} (${chartData.originStation})`,
          identifier: chartData.originStation,
        },
        arrivalStation: {
          "@type": "TrainStation",
          name: `${chartData.destinationStationName} (${chartData.destinationStation})`,
          identifier: chartData.destinationStation,
        },
        provider: {
          "@type": "Organization",
          name: "Indian Railways",
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
            name: "Train Chart Preparation Time",
            item: "https://traveladda.in/rail/chart-time",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${chartData.trainNumber} ${chartData.trainName} Chart Times`,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: chartFaqs.map((faq) => ({
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
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/rail/chart-time" className="hover:text-white">
                Chart Times
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {chartData.trainNumber} {chartData.trainName} Chart Times
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={liveStatusPath}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
              >
                <TrainIcon className="h-3.5 w-3.5 text-emerald-300" />
                <span>Spot {chartData.trainNumber} Live</span>
              </Link>
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
                TRAIN #{chartData.trainNumber}
              </span>
              <span className="rounded border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                1st Chart: {chartData.originFirstChart12h} · 2nd Chart:{" "}
                {chartData.originSecondChart12h}
              </span>
              <span className="rounded border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-200">
                {chartData.originStation} → {chartData.destinationStation}
              </span>
            </div>

            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {chartData.trainNumber} {chartData.trainName} Chart Preparation
              Time &amp; Charting Station
            </h1>

            <p className="mt-2 max-w-4xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              {chartData.summary}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Boarding Station & Chart Time Finder (Pre-Hydrated with SSR Data) */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<ChartTimeFallback />}>
          <TrainChartTimeChecker
            initialTrainNumber={chartData.trainNumber}
            initialData={chartData}
          />
        </Suspense>

        {/* Quick Jump Anchor Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3 text-xs font-semibold text-ink-soft">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <a
              href="#about-charting"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              About {chartData.trainNumber} Charting
            </a>
            <span className="text-line-strong">·</span>
            <a
              href="#station-chart-table"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              Station-Wise Chart Table ({chartData.totalStations} Stops)
            </a>
            <span className="text-line-strong">·</span>
            <a
              href="#chart-faq"
              className="hover:text-[#1956b4] dark:hover:text-blue-400"
            >
              {chartData.trainNumber} Charting FAQs
            </a>
          </div>
          <Link
            href={liveStatusPath}
            className="inline-flex items-center gap-1.5 font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <TrainIcon className="h-4 w-4" />
            <span>
              View {chartData.trainNumber} Live Running Status &amp; Time Table
              →
            </span>
          </Link>
        </div>

        {/* Cross-Tool Intent Loop: Train-Specific Chart Time -> PRS Refund Calculator */}
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 shadow-2xs dark:border-amber-500/30 dark:bg-amber-950/30">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-ink sm:text-sm">
                Cancelling a Ticket on {chartData.trainNumber} {chartData.trainName} Before or After Charting ({chartData.originFirstChart12h})?
              </div>
              <p className="text-xs text-ink-soft">
                Calculate exact CRIS PRS bank refund with Double ₹5 Rounding before or after{" "}
                <strong>{chartData.originFirstChart12h}</strong> chart lock for Confirmed (CNF), RAC, Waitlist (WL), or Tatkal tickets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/rail/refund-calculator"
                className="rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#144696]"
              >
                Calculate {chartData.trainNumber} Ticket Refund →
              </Link>
              <Link
                href="/rail/refund-calculator/after-chart-preparation-train-ticket-cancellation-rules"
                className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                Post-Chart Refund Rules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SSR SECTION 1: About Train {trainNumber} Chart Preparation & Key Details (Google AI Overview Block) */}
      <section
        id="about-charting"
        aria-labelledby="about-charting-heading"
        className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-subcard px-4 py-4 sm:px-6">
            <div>
              <h2
                id="about-charting-heading"
                className="text-lg font-extrabold text-ink sm:text-xl"
              >
                About {chartData.trainName} ({chartData.trainNumber}) Chart
                Preparation Times
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                Key charting summary, 1st &amp; 2nd reservation chart locks, and
                remote charting hubs for Train {chartData.trainNumber}.
              </p>
            </div>
            <Link
              href={liveStatusPath}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-400"
            >
              <TrainIcon className="h-3.5 w-3.5" />
              <span>Spot #{chartData.trainNumber} Live</span>
            </Link>
          </div>

          {/* 4-Card Visual Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 border-b border-line bg-subcard/35 p-4 sm:grid-cols-4 sm:px-6">
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 dark:border-blue-500/25 dark:bg-blue-950/20">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Origin 1st Chart ({chartData.originStation})
              </div>
              <div className="mt-1 font-mono text-base font-extrabold text-ink sm:text-lg">
                {chartData.originFirstChart12h}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-ink-muted">
                {chartData.stations[0]?.chartOneDayLabel || "Before Departure"}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-500/25 dark:bg-emerald-950/20">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Origin 2nd Chart ({chartData.originStation})
              </div>
              <div className="mt-1 font-mono text-base font-extrabold text-ink sm:text-lg">
                {chartData.originSecondChart12h}
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-ink-muted">
                Final Vacancy Lock
              </div>
            </div>

            <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-3 dark:border-orange-500/25 dark:bg-orange-950/20">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">
                Charting Hubs
              </div>
              <div className="mt-1 font-mono text-base font-extrabold text-ink sm:text-lg">
                {chartData.uniqueChartHubCount}{" "}
                {chartData.uniqueChartHubCount === 1 ? "Hub" : "Hubs"}
              </div>
              <div className="mt-0.5 truncate text-[11px] font-medium text-ink-muted">
                {chartData.chartingZones
                  .map((z) => z.remoteStationCode)
                  .join(" → ")}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-3">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                Route Halts Covered
              </div>
              <div className="mt-1 font-mono text-base font-extrabold text-ink sm:text-lg">
                {chartData.totalStations} Stops
              </div>
              <div className="mt-0.5 truncate text-[11px] font-medium text-ink-muted">
                {chartData.originStation} → {chartData.destinationStation}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                Key Charting Facts — {chartData.trainNumber}{" "}
                {chartData.trainName}
              </h3>
              <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">
                      Origin 1st Reservation Chart ({chartData.originStation}):
                    </strong>{" "}
                    Prepared around{" "}
                    <strong className="text-ink">
                      {chartData.originFirstChart12h}
                    </strong>{" "}
                    ({chartData.stations[0]?.chartTimeLocal || "—"} IST)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">
                      Origin 2nd Vacancy Chart ({chartData.originStation}):
                    </strong>{" "}
                    Locked around{" "}
                    <strong className="text-ink">
                      {chartData.originSecondChart12h}
                    </strong>{" "}
                    ({chartData.stations[0]?.chartTwoTimeLocal || "—"} IST)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">
                      Primary Charting Stations ({chartData.uniqueChartHubCount}{" "}
                      Hubs):
                    </strong>{" "}
                    {chartData.chartingZones
                      .map(
                        (z) => `${z.remoteStationName} (${z.remoteStationCode})`
                      )
                      .join(", ")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong className="text-ink">Route Coverage:</strong>{" "}
                    {chartData.knownChartCount} of {chartData.totalStations}{" "}
                    stations from {chartData.originStationName} (
                    {chartData.originStation}) to{" "}
                    {chartData.destinationStationName} (
                    {chartData.destinationStation})
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line bg-subcard/70 p-4 text-xs leading-relaxed text-ink-soft sm:text-sm">
              <p>{chartData.summary}</p>
              <p className="mt-2.5">
                Once your boarding station&apos;s chart is prepared, verify your
                final coach &amp; berth on our{" "}
                <Link
                  href="/rail/pnr-status"
                  className="font-bold text-[#1956b4] underline decoration-[#1956b4]/40 underline-offset-2 hover:decoration-[#1956b4] dark:text-blue-400"
                >
                  10-Digit IRCTC PNR Status Checker
                </Link>{" "}
                or track the train on{" "}
                <Link
                  href={liveStatusPath}
                  className="font-bold text-[#1956b4] underline decoration-[#1956b4]/40 underline-offset-2 hover:decoration-[#1956b4] dark:text-blue-400"
                >
                  {chartData.trainNumber} {chartData.trainName} Live Running
                  Status
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SSR SECTION 2: Semantic Station-by-Station Chart Time Table for Google Indexing */}
      <section
        id="station-chart-table"
        aria-labelledby="station-chart-table-heading"
        className="mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-subcard px-4 py-4 sm:px-6">
            <div>
              <h2
                id="station-chart-table-heading"
                className="text-lg font-extrabold text-ink sm:text-xl"
              >
                {chartData.trainName} ({chartData.trainNumber}) Station-Wise 1st
                &amp; 2nd Chart Schedule
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                Complete station-by-station reservation chart preparation table
                from {chartData.originStationName} ({chartData.originStation})
                to {chartData.destinationStationName} (
                {chartData.destinationStation}).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-line bg-card px-3 py-1.5 font-mono text-xs font-bold text-ink-soft">
                {chartData.totalStations} Stations ·{" "}
                {chartData.uniqueChartHubCount} Chart Hubs
              </span>
              <Link
                href="/rail/pnr-status"
                className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold"
              >
                <TicketIcon className="h-3.5 w-3.5" />
                <span>Check PNR Status</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-subcard/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3 sm:px-5">#</th>
                  <th className="px-4 py-3">Boarding Station</th>
                  <th className="px-4 py-3 text-center">Day</th>
                  <th className="px-4 py-3">Arr / Dep</th>
                  <th className="px-4 py-3">1st Reservation Chart</th>
                  <th className="px-4 py-3">2nd (Vacancy) Chart</th>
                  <th className="px-4 py-3 sm:px-5">Charting Station (Hub)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {chartData.stations.map((st, idx) => {
                  const isOrigin = idx === 0;
                  const isTerminus = idx === chartData.stations.length - 1;

                  return (
                    <tr
                      key={`${st.stationCode}-${st.sequence}`}
                      className={`transition hover:bg-subcard/50 ${
                        isOrigin
                          ? "bg-emerald-50/30 dark:bg-emerald-950/10"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-ink-muted sm:px-5">
                        {st.sequence}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                              isOrigin
                                ? "bg-emerald-500 ring-4 ring-emerald-500/15"
                                : isTerminus
                                  ? "bg-[#fc6203] ring-4 ring-[#fc6203]/15"
                                  : st.isPrimaryChartHub
                                    ? "bg-[#1956b4] ring-4 ring-[#1956b4]/15"
                                    : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-ink">
                                {st.stationName}
                              </span>
                              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                                {st.stationCode}
                              </span>
                              {isOrigin ? (
                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                  1st Boarding · Origin
                                </span>
                              ) : isTerminus ? (
                                <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-orange-700 dark:text-orange-300">
                                  Destination
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-ink-muted">
                              {st.distanceKm} km from origin
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex rounded-md border border-line bg-subcard px-2 py-0.5 font-mono text-xs font-bold text-ink">
                          Day {st.day}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-ink-soft">
                        <div>
                          Arr:{" "}
                          <span className="font-bold text-ink">
                            {isOrigin ? "Origin" : st.arrivalTime || "--"}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          Dep:{" "}
                          <span className="font-bold text-ink">
                            {isTerminus ? "End" : st.departureTime || "--"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          {st.chartOneFormatted12h}
                        </span>
                        <div className="mt-1 text-[11px] text-ink-muted">
                          {st.chartTimeLocal} IST · {st.chartOneDayLabel}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {st.chartTwoFormatted12h}
                        </span>
                        <div className="mt-1 text-[11px] text-ink-muted">
                          {st.chartTwoTimeLocal} IST · {st.chartTwoDayLabel}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <div className="inline-flex items-center gap-1.5">
                          <BuildingStationIcon className="h-3.5 w-3.5 shrink-0 text-[#fc6203]" />
                          <span className="font-bold text-ink">
                            {st.chartRemoteStationName} ({st.chartRemoteStation})
                          </span>
                        </div>
                        <div className="mt-0.5">
                          {st.isPrimaryChartHub ? (
                            <span className="inline-flex rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              Primary Charting Hub
                            </span>
                          ) : (
                            <span className="text-[11px] text-ink-muted">
                              Remote Hub ({st.chartRemoteStation})
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SSR SECTION 3: Train-Specific Charting FAQs */}
      <section
        id="chart-faq"
        aria-labelledby="chart-faq-heading"
        className="mx-auto mt-10 max-w-4xl scroll-mt-24 px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <h2
          id="chart-faq-heading"
          className="text-lg font-extrabold text-ink sm:text-xl"
        >
          Frequently Asked Questions — {chartData.trainNumber}{" "}
          {chartData.trainName} Chart Time
        </h2>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {chartFaqs.map((faq, idx) => (
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

      {/* SSR SECTION 4: Directory of Other Popular & Connected Train Chart Preparation Pages */}
      <section
        aria-labelledby="other-chart-trains-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        {(() => {
          const relatedTrains = getRelatedCatalogTrains(
            chartData.trainNumber,
            40,
            { reservedOnly: true }
          );
          const featuredRelated = relatedTrains.slice(0, 16);
          const quickJumpRelated = relatedTrains.slice(16, 40);

          return (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2
                    id="other-chart-trains-heading"
                    className="text-lg font-extrabold text-ink sm:text-xl"
                  >
                    Other Popular Trains — 1st &amp; 2nd Chart Preparation Times
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                    Check station-by-station reservation chart timings and
                    remote charting hubs for major Indian Railways trains.
                  </p>
                </div>
                <Link
                  href="/rail/chart-time#all-chart-trains"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>Browse All Train Chart Times →</span>
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {featuredRelated.map((train) => (
                  <div
                    key={train.trainNumber}
                    className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
                  >
                    <Link
                      prefetch={false}
                      href={buildChartTimePath(
                        train.trainNumber,
                        train.trainName
                      )}
                      className="block"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          #{train.trainNumber}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-ink-muted">
                          {train.sourceCode} → {train.destinationCode}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-1 text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                        {train.trainName}
                      </h3>
                      <p className="mt-1 text-[11px] text-ink-muted">
                        {train.type} · 1st &amp; 2nd Chart Schedule
                      </p>
                    </Link>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                      <Link
                        prefetch={false}
                        href={buildTrainLiveStatusPath(
                          train.trainNumber,
                          train.trainName
                        )}
                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:underline dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        Live Status
                      </Link>
                      <Link
                        prefetch={false}
                        href={buildChartTimePath(
                          train.trainNumber,
                          train.trainName
                        )}
                        className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
                      >
                        <span>Chart Time</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {quickJumpRelated.length > 0 && (
                <div className="mt-5 rounded-2xl border border-line bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
                    <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase sm:text-sm">
                      More Reserved Trains — Direct 1st &amp; 2nd Chart Links
                    </h3>
                    <Link
                      href="/rail/chart-time#all-chart-trains"
                      className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                    >
                      Full Train Chart Directory →
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {quickJumpRelated.map((train) => (
                      <Link
                        prefetch={false}
                        key={`jump-${train.trainNumber}`}
                        href={buildChartTimePath(
                          train.trainNumber,
                          train.trainName
                        )}
                        className="flex items-center justify-between gap-2 rounded-lg border border-line/70 bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
                      >
                        <span className="truncate">
                          <span className="mr-1.5 font-mono font-bold text-[#1956b4] dark:text-blue-400">
                            {train.trainNumber}
                          </span>
                          {train.trainName} Chart Time
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                          {train.sourceCode}→{train.destinationCode}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}

        <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Synchronized with Indian Railways PRS Charting Zones</span>
          </span>
          <Link
            href={liveStatusPath}
            className="font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            Spot Train #{chartData.trainNumber} Live →
          </Link>
        </div>
      </section>
    </main>
  );
}

