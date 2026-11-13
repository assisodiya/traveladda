import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  ClockIcon,
  LuggageIcon,
  PlaneIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveFlightTracker } from "@/components/LiveFlightTracker";
import { FLIGHT_BLOG_POSTS } from "@/lib/blog-data";
import { fetchCachedFlightStatusForSeo } from "@/lib/flight-service";
import {
  buildFlightStatusPath,
  buildFlightStatusSlug,
  POPULAR_AIRLINES,
  POPULAR_LIVE_FLIGHTS,
  parseFlightStatusSlug,
} from "@/lib/flight-types";

export async function generateStaticParams() {
  return POPULAR_LIVE_FLIGHTS.map((item) => ({
    slug: buildFlightStatusSlug(
      item.airlineCode,
      item.flightNumber,
      item.airlineName
    ),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  const parsed = parseFlightStatusSlug(slug);

  if (!parsed) {
    return {
      title: "Live Flight Status Tracker | TravelAdda",
      description:
        "Check live domestic and international flight status, terminal, boarding gate, baggage belt, and arrival/departure time by airline and flight number.",
      robots: { index: false, follow: false },
    };
  }

  const { airlineCode, flightNumber, airlineName, canonicalSlug } = parsed;
  const flightCode = `${airlineCode} ${flightNumber}`;
  const canonicalUrl = `/flight-status/${canonicalSlug}`;

  const flightData = await fetchCachedFlightStatusForSeo(
    airlineCode,
    flightNumber
  );
  const primary = flightData?.primaryFlight;

  const routeLabel = primary
    ? `${primary.departure.airportCity} (${primary.departure.airportCode}) to ${primary.arrival.airportCity} (${primary.arrival.airportCode})`
    : "";
  const routeCodesLabel = primary
    ? `(${primary.departure.airportCode} to ${primary.arrival.airportCode})`
    : "";
  const depTerminalLabel = primary?.departure.terminal
    ? `Terminal ${primary.departure.terminal}`
    : "Departure Terminal";
  const arrTerminalLabel = primary?.arrival.terminal
    ? `Terminal ${primary.arrival.terminal}`
    : "Arrival Terminal";

  const title = primary
    ? `${airlineName} ${flightCode} Flight Status ${routeCodesLabel} — Live Arrival, Departure, Terminal & Gate`
    : `${airlineName} ${flightCode} Flight Status (${airlineCode}-${flightNumber}) — Live Arrival, Departure, Terminal & Gate`;

  const description = primary
    ? `Track live ${airlineName} ${flightCode} (${airlineCode}${flightNumber}) flight status from ${routeLabel}. Check today's scheduled & estimated departure (${primary.departure.scheduledTime || "live"}), arrival (${primary.arrival.scheduledTime || "live"}), ${depTerminalLabel}, ${arrTerminalLabel}, boarding gate, baggage belt & aircraft model on TravelAdda.`
    : `Track live ${airlineName} ${flightCode} (${airlineCode}${flightNumber}) flight status today. Check real-time departure & arrival times, airport terminal numbers, boarding gates, baggage carousel belts, and inbound aircraft status on TravelAdda.`;

  return {
    title,
    description,
    keywords: [
      `${airlineName.toLowerCase()} ${flightCode.toLowerCase()} flight status`,
      `${flightCode.toLowerCase()} flight status`,
      `${airlineCode.toLowerCase()}${flightNumber.toLowerCase()} flight status`,
      `${airlineName.toLowerCase()} ${flightNumber} live status`,
      `${flightCode.toLowerCase()} terminal and gate`,
      `${flightCode.toLowerCase()} arrival time today`,
      `${flightCode.toLowerCase()} departure time`,
      ...(primary
        ? [
            `${primary.departure.airportCity.toLowerCase()} to ${primary.arrival.airportCity.toLowerCase()} ${flightCode.toLowerCase()} status`,
            `${primary.departure.airportCode.toLowerCase()} to ${primary.arrival.airportCode.toLowerCase()} flight ${flightCode.toLowerCase()}`,
          ]
        : []),
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | TravelAdda`,
      description,
      url: canonicalUrl,
      siteName: "TravelAdda",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function FlightTrackerSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <div className="grid animate-pulse gap-3 lg:grid-cols-4">
        <div className="h-12 rounded-xl bg-subcard" />
        <div className="h-12 rounded-xl bg-subcard" />
        <div className="h-12 rounded-xl bg-subcard" />
        <div className="h-12 rounded-xl bg-subcard" />
      </div>
    </div>
  );
}

export default async function FlightStatusSeoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  const parsed = parseFlightStatusSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { airlineCode, flightNumber, airlineName, canonicalSlug } = parsed;
  const normalizedIncomingSlug = decodeURIComponent(slug || "")
    .trim()
    .toLowerCase();
  if (normalizedIncomingSlug !== canonicalSlug) {
    permanentRedirect(`/flight-status/${canonicalSlug}`);
  }
  const flightCode = `${airlineCode} ${flightNumber}`;

  const flightData = await fetchCachedFlightStatusForSeo(
    airlineCode,
    flightNumber
  );
  const primary = flightData?.primaryFlight ?? null;
  const resolvedAirlineName = primary?.airlineName || airlineName;

  const flightFaqs = [
    {
      q: `What is the current live status of ${resolvedAirlineName} flight ${flightCode}?`,
      a: primary
        ? `${resolvedAirlineName} flight ${flightCode} (${airlineCode}${flightNumber}) operates between ${primary.departure.airportCity} (${primary.departure.airportCode}) and ${primary.arrival.airportCity} (${primary.arrival.airportCode}). Current status is "${primary.flightStatus}". Scheduled departure from ${primary.departure.airportCode} is ${primary.departure.scheduledTime || "published in the tracker above"}${primary.departure.terminal ? ` from Terminal ${primary.departure.terminal}` : ""}, and scheduled arrival at ${primary.arrival.airportCode} is ${primary.arrival.scheduledTime || "published above"}${primary.arrival.terminal ? ` at Terminal ${primary.arrival.terminal}` : ""}.`
        : `You can check the real-time airborne progress, scheduled vs estimated departure/arrival times, terminal, gate, and baggage belt for ${resolvedAirlineName} flight ${flightCode} (${airlineCode}${flightNumber}) in the live tracker above by selecting Yesterday, Today, or Tomorrow.`,
    },
    {
      q: `Which airport terminal and gate does ${resolvedAirlineName} ${flightCode} depart from and arrive at?`,
      a: primary
        ? `${resolvedAirlineName} ${flightCode} departs from ${primary.departure.airport} (${primary.departure.airportCode})${primary.departure.terminal ? `, Terminal ${primary.departure.terminal}` : ""}${primary.departure.gate ? ` (Gate ${primary.departure.gate})` : ""}, and arrives at ${primary.arrival.airport} (${primary.arrival.airportCode})${primary.arrival.terminal ? `, Terminal ${primary.arrival.terminal}` : ""}${primary.arrival.gate ? ` (Gate ${primary.arrival.gate})` : ""}${primary.arrival.baggage ? ` with baggage claim at Belt ${primary.arrival.baggage}` : ""}.`
        : `Terminal numbers for ${resolvedAirlineName} ${flightCode} are shown in the Departure and Arrival cards above. Specific boarding gates and baggage claim carousels are assigned by airport operations 60 to 120 minutes prior to departure or landing.`,
    },
    {
      q: `What aircraft operates ${resolvedAirlineName} ${flightCode}?`,
      a: primary?.aircraft
        ? `${resolvedAirlineName} ${flightCode} is scheduled to be operated by a ${primary.aircraft.name} (ICAO equipment code: ${primary.aircraft.code}).`
        : `Equipment and aircraft model details (such as Airbus A320neo, A321neo, A350, or Boeing 737 MAX / 777 / 787 Dreamliner) for ${resolvedAirlineName} ${flightCode} are displayed in the flight telemetry card once the flight manifest is active.`,
    },
    {
      q: `How early should I reach the airport for ${resolvedAirlineName} ${flightCode}?`,
      a: `For domestic Indian flights, airline check-in and bag-drop counters close 45–60 minutes before scheduled departure (arrive at least 2 hours early). For international departures, counters close 60–75 minutes before departure (arrive at least 3 hours early).`,
    },
  ];

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `https://traveladda.in/flight-status/${canonicalSlug}`,
      url: `https://traveladda.in/flight-status/${canonicalSlug}`,
      name: `${resolvedAirlineName} ${flightCode} Live Flight Status, Terminal & Gate`,
      description: `Live flight status, departure and arrival times, terminal, gate, and baggage carousel for ${resolvedAirlineName} ${flightCode}.`,
      inLanguage: "en-IN",
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
          name: "Live Flight Status",
          item: "https://traveladda.in/air/flight-status",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${resolvedAirlineName} ${flightCode} Status`,
          item: `https://traveladda.in/flight-status/${canonicalSlug}`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: flightFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

  if (primary) {
    jsonLdGraph.push({
      "@type": "Flight",
      flightNumber: `${airlineCode}${flightNumber}`,
      provider: {
        "@type": "Airline",
        name: resolvedAirlineName,
        iataCode: airlineCode,
      },
      departureAirport: {
        "@type": "Airport",
        name: primary.departure.airport,
        iataCode: primary.departure.airportCode,
      },
      arrivalAirport: {
        "@type": "Airport",
        name: primary.arrival.airport,
        iataCode: primary.arrival.airportCode,
      },
      ...(primary.departure.terminal
        ? { departureTerminal: primary.departure.terminal }
        : {}),
      ...(primary.arrival.terminal
        ? { arrivalTerminal: primary.arrival.terminal }
        : {}),
      ...(primary.departure.gate
        ? { departureGate: primary.departure.gate }
        : {}),
      ...(primary.arrival.gate ? { arrivalGate: primary.arrival.gate } : {}),
      ...(primary.aircraft ? { aircraft: primary.aircraft.name } : {}),
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
  };

  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* High-Contrast Navy SSR Hero Header */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/air/flight-status" className="hover:text-white">
              Live Flight Status
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">
              {resolvedAirlineName} {flightCode}
            </span>
          </nav>

          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fc6203] px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                  <PlaneIcon className="h-3 w-3" />
                  <span>{flightCode} Live Tracker</span>
                </span>
                {primary && (
                  <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold text-white">
                    {primary.departure.airportCode} →{" "}
                    {primary.arrival.airportCode} • {primary.flightStatus}
                  </span>
                )}
              </div>

              <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                {resolvedAirlineName} {flightCode} Flight Status
                {primary
                  ? ` — ${primary.departure.airportCity} (${primary.departure.airportCode}) to ${primary.arrival.airportCity} (${primary.arrival.airportCode})`
                  : " — Live Arrival, Departure, Terminal & Gate"}
              </h1>

              <p className="mt-1.5 max-w-3xl text-xs text-slate-200 sm:text-sm">
                {primary ? (
                  <>
                    Real-time flight status for{" "}
                    <strong className="text-white">
                      {resolvedAirlineName} {flightCode}
                    </strong>{" "}
                    from{" "}
                    <strong className="text-white">
                      {primary.departure.airport} (
                      {primary.departure.airportCode})
                    </strong>{" "}
                    to{" "}
                    <strong className="text-white">
                      {primary.arrival.airport} ({primary.arrival.airportCode})
                    </strong>
                    . Check scheduled vs estimated times, terminal numbers,
                    boarding gate, baggage belt, and inbound aircraft status.
                  </>
                ) : (
                  <>
                    Track live{" "}
                    <strong className="text-white">
                      {resolvedAirlineName} ({flightCode})
                    </strong>{" "}
                    flight status, departure &amp; arrival terminals, boarding
                    gates, baggage claim belts, and aircraft details across
                    Yesterday, Today, and Tomorrow.
                  </>
                )}
              </p>
            </div>

            {primary && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white">
                  Dep:{" "}
                  <strong className="text-amber-300">
                    {primary.departure.estimatedTime ||
                      primary.departure.scheduledTime ||
                      "TBA"}
                  </strong>
                  {primary.departure.terminal
                    ? ` (T${primary.departure.terminal})`
                    : ""}
                </span>
                <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white">
                  Arr:{" "}
                  <strong className="text-emerald-300">
                    {primary.arrival.estimatedTime ||
                      primary.arrival.scheduledTime ||
                      "TBA"}
                  </strong>
                  {primary.arrival.terminal
                    ? ` (T${primary.arrival.terminal})`
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Interactive Flight Tracker Hydrated with SSR Data */}
      <section
        aria-label="Live Flight Status Search and Telemetry"
        className="mx-auto -mt-7 max-w-6xl px-4 sm:-mt-9 sm:px-6 lg:px-8"
      >
        <Suspense fallback={<FlightTrackerSkeleton />}>
          <LiveFlightTracker
            key={canonicalSlug}
            initialAirlineCode={airlineCode}
            initialAirlineName={resolvedAirlineName}
            initialFlightNumber={flightNumber}
            initialFlightData={flightData}
          />
        </Suspense>

        {/* Cross-Tool Intent Loop: Flight Specific Delay -> DGCA Compensation Checker */}
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50/85 p-4 shadow-2xs dark:border-amber-500/30 dark:bg-amber-950/30">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-ink sm:text-sm">
                Is {resolvedAirlineName} {flightCode} Delayed &gt;2 Hours, Cancelled or Overbooked?
              </div>
              <p className="text-xs text-ink-soft">
                Under DGCA Passenger Charter rules, you may be entitled to free meals, alternate flights, or up to{" "}
                <strong>₹10,000–₹20,000 statutory compensation</strong>. Generate your official{" "}
                {resolvedAirlineName} Nodal Officer claim notice in 30 seconds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/air/flight-compensation"
                className="rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#144696]"
              >
                Check {resolvedAirlineName} DGCA Compensation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Server-Rendered SEO Summary & Route Intelligence Table */}
      <div className="mx-auto mt-10 max-w-6xl space-y-8 px-4 sm:mt-12 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="border-b border-line pb-3.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fc6203]">
              SSR Flight Telemetry &amp; Schedule Summary
            </span>
            <h2 className="mt-0.5 text-lg font-extrabold text-ink sm:text-xl">
              {resolvedAirlineName} {flightCode} Schedule, Terminal, Gate &amp;
              Baggage Summary
            </h2>
          </div>

          {primary ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-line bg-subcard/50 p-3.5">
                <span className="text-[11px] font-bold uppercase text-ink-muted">
                  Origin Departure ({primary.departure.airportCode})
                </span>
                <p className="mt-1 text-base font-extrabold text-ink">
                  {primary.departure.airportCity}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Scheduled: {primary.departure.scheduledTime || "TBA"} • Est:{" "}
                  {primary.departure.estimatedTime ||
                    primary.departure.scheduledTime ||
                    "TBA"}
                </p>
                <p className="mt-1 text-xs font-bold text-[#1956b4] dark:text-blue-300">
                  Terminal: {primary.departure.terminal || "TBA"} • Gate:{" "}
                  {primary.departure.gate || "TBA"}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-subcard/50 p-3.5">
                <span className="text-[11px] font-bold uppercase text-ink-muted">
                  Destination Arrival ({primary.arrival.airportCode})
                </span>
                <p className="mt-1 text-base font-extrabold text-ink">
                  {primary.arrival.airportCity}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Scheduled: {primary.arrival.scheduledTime || "TBA"} • Est:{" "}
                  {primary.arrival.estimatedTime ||
                    primary.arrival.scheduledTime ||
                    "TBA"}
                </p>
                <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Terminal: {primary.arrival.terminal || "TBA"} • Belt:{" "}
                  {primary.arrival.baggage || "TBA"}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-subcard/50 p-3.5">
                <span className="text-[11px] font-bold uppercase text-ink-muted">
                  Flight Duration &amp; Status
                </span>
                <p className="mt-1 text-base font-extrabold text-ink">
                  {primary.flightStatus}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Block Time:{" "}
                  {primary.departure.duration ||
                    primary.arrival.duration ||
                    "Standard"}
                </p>
                <p className="mt-1 text-xs font-bold text-ink-muted">
                  Flight Code: {airlineCode}-{flightNumber}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-subcard/50 p-3.5">
                <span className="text-[11px] font-bold uppercase text-ink-muted">
                  Aircraft Equipment
                </span>
                <p className="mt-1 text-base font-extrabold text-ink">
                  {primary.aircraft?.name || "Commercial Jet"}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  ICAO Code: {primary.aircraft?.code || airlineCode}
                </p>
                <p className="mt-1 text-xs font-bold text-ink-muted">
                  Operator: {resolvedAirlineName}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
              Use the date selector in the tracker above to switch between{" "}
              <strong>Yesterday</strong>, <strong>Today</strong>, and{" "}
              <strong>Tomorrow</strong> for {resolvedAirlineName} {flightCode} (
              {airlineCode}
              {flightNumber}), or enter any other flight number to view live
              departure/arrival times, terminal gates, and baggage carousels.
            </p>
          )}
        </section>

        {/* Popular Flight Status Quick Links (SEO Crawl Grid) */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-xl">
                Popular Domestic &amp; International Live Flight Status Pages
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Direct SSR flight tracker pages for top Indian and global
                routes.
              </p>
            </div>
            <Link
              href="/air/flight-status"
              className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Search All 500+ Airlines →
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_LIVE_FLIGHTS.map((flight) => {
              const targetPath = buildFlightStatusPath(
                flight.airlineCode,
                flight.flightNumber,
                flight.airlineName
              );
              return (
                <Link
                  key={`${flight.airlineCode}-${flight.flightNumber}`}
                  href={targetPath}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-subcard/40 p-3.5 transition hover:border-[#1956b4] hover:bg-card"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AirlineLogo code={flight.airlineCode} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                          {flight.airlineName} {flight.airlineCode}{" "}
                          {flight.flightNumber}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-ink-muted">
                        {flight.routeCodes} • {flight.routeCities}
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-[#1956b4]" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Major Airlines Directory */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-base font-extrabold text-ink sm:text-xl">
            Supported Airlines &amp; 2-Letter IATA Codes
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {POPULAR_AIRLINES.map((airline) => (
              <Link
                key={airline.code}
                href={`/air/flight-status?airline=${airline.code}`}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-line bg-subcard/40 p-3 transition hover:border-[#1956b4] hover:bg-card"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <AirlineLogo code={airline.code} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-ink">
                      {airline.name}
                    </p>
                    <p className="font-mono text-[10px] font-bold text-[#1956b4] dark:text-blue-300">
                      IATA: {airline.code}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              </Link>
            ))}
          </div>
        </section>

        {/* Flight Specific FAQs */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <h2 className="text-base font-extrabold text-ink sm:text-xl">
            Frequently Asked Questions — {resolvedAirlineName} {flightCode}{" "}
            Flight Status
          </h2>
          <div className="mt-4 space-y-3">
            {flightFaqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-line bg-subcard/40 p-4"
              >
                <h3 className="text-xs font-extrabold text-ink sm:text-sm">
                  {faq.q}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Aviation & Airport Transit Guides */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-xl">
                Flight Tracking, Baggage &amp; Airport Metro Guides
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <Link
                href="/delhi-metro/route/new-delhi-to-igi-airport"
                className="inline-flex items-center gap-1 text-[#1956b4] hover:underline dark:text-blue-300"
              >
                <TrainIcon className="h-3.5 w-3.5" />
                <span>Delhi Airport Metro Route</span>
              </Link>
              <Link
                href="/tools/air"
                className="inline-flex items-center gap-1 text-[#fc6203] hover:underline"
              >
                <LuggageIcon className="h-3.5 w-3.5" />
                <span>Baggage Calculator</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {FLIGHT_BLOG_POSTS.slice(0, 3).map((post) => (
              <article
                key={post.slug}
                className="flex flex-col justify-between rounded-xl border border-line bg-subcard/35 p-4 transition hover:border-[#1956b4]"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                      <ClockIcon className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-ink">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-[#1956b4]"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </div>
                <div className="mt-3 border-t border-line pt-2.5 text-right text-xs">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-300"
                  >
                    <span>Read Guide</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

