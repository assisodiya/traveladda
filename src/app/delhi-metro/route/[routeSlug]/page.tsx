import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRightIcon, SwapIcon } from "@/components/Icons";
import { MetroRouteFinder } from "@/components/MetroRouteFinder";
import {
  fetchCachedMetroNetworkSummary,
  fetchCachedMetroRoutePlan,
  getMetroLineBySlug,
  getMetroStationBySlugOrId,
} from "@/lib/metro-service";
import {
  buildMetroLinePath,
  buildMetroRoutePath,
  buildMetroRouteSlug,
  buildMetroStationPath,
  POPULAR_METRO_ROUTES,
  parseMetroRouteSlug,
} from "@/lib/metro-types";

export async function generateStaticParams() {
  return POPULAR_METRO_ROUTES.map((r) => ({
    routeSlug: buildMetroRouteSlug(r.fromSlug, r.toSlug),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ routeSlug: string }>;
}): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const parsedPair = parseMetroRouteSlug(routeSlug);

  if (parsedPair) {
    const plan = await fetchCachedMetroRoutePlan(
      parsedPair.fromSlug,
      parsedPair.toSlug,
      "fastest",
    );
    if (plan) {
      const rec = plan.recommended;
      const fromName = plan.fromStation.name;
      const toName = plan.toStation.name;
      const lineNames = rec.segments
        .filter((s) => s.line)
        .map((s) => s.line!.badge)
        .join(" → ");
      const changeText =
        rec.interchangeCount === 0
          ? "Direct Metro (0 Interchange)"
          : `${rec.interchangeCount} Interchange${rec.interchangeCount > 1 ? "s" : ""}`;

      return {
        title: `${fromName} to ${toName} Metro Route — Fare ₹${rec.fare.tokenFareInr}, ${rec.totalDurationMin} Mins, ${rec.totalStops} Stops | Delhi NCR Metro`,
        description: `Check ${fromName} to ${toName} Delhi NCR Metro route, token fare (₹${rec.fare.tokenFareInr}), Smart Card fare (₹${rec.fare.smartCardPeakInr}), ${rec.totalStops} stations, ${rec.totalDistanceKm} km distance, ${changeText} via ${lineNames}, and first/last train timings.`,
        keywords: [
          `${fromName} to ${toName} metro`,
          `${fromName} to ${toName} metro route`,
          `${fromName} to ${toName} metro fare`,
          `${fromName} to ${toName} metro distance`,
          `${fromName} to ${toName} metro timings`,
          "Delhi NCR Metro Route Planner",
          "DMRC Fare Calculator",
        ],
        alternates: {
          canonical: `/delhi-metro/route/${plan.routeSlug}`,
        },
        openGraph: {
          title: `${fromName} to ${toName} Metro Route — ₹${rec.fare.tokenFareInr} Fare, ${rec.totalDurationMin} Mins & ${rec.totalStops} Stops`,
          description: `${fromName} to ${toName} by Delhi Metro takes ~${rec.totalDurationMin} mins (${rec.totalStops} stops, ${rec.totalDistanceKm} km) with ₹${rec.fare.tokenFareInr} token fare (${changeText}).`,
          url: `https://traveladda.in/delhi-metro/route/${plan.routeSlug}`,
          type: "article",
        },
      };
    }
  }

  const line = getMetroLineBySlug(routeSlug);
  if (line) {
    return {
      title: `Delhi Metro ${line.badge} — All ${line.totalStops} Stations, Route Map, Interchanges & Timings | TravelAdda`,
      description: `Complete station list and route guide for Delhi NCR Metro ${line.badge} (${line.fromStationName} to ${line.toStationName}): ${line.totalStops} stations, ${line.totalDistanceKm} km length, ~${line.totalDurationMin} mins travel time, interchanges & fares.`,
      alternates: {
        canonical: buildMetroLinePath(line.slug),
      },
    };
  }

  const station = getMetroStationBySlugOrId(routeSlug);
  if (station) {
    return {
      title: `${station.name} Metro Station — Route Planner, Lines, First/Last Train (${station.firstTrain}) & Fares | Delhi NCR Metro`,
      description: `Find metro routes from ${station.name} Metro Station in Delhi NCR. Check connecting metro lines, first train (${station.firstTrain}), last train (${station.lastTrain}), interchange details, and token/smart card fares.`,
      alternates: {
        canonical: buildMetroStationPath(station.slug),
      },
    };
  }

  return {
    title: "Delhi NCR Metro Route & Fare Planner | TravelAdda",
    description:
      "Check Delhi NCR Metro routes, token & smart card fares, travel time, and interchanges across all 262 stations.",
  };
}

export default async function MetroDynamicSeoPage({
  params,
}: {
  params: Promise<{ routeSlug: string }>;
}) {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const network = await fetchCachedMetroNetworkSummary();
  const linesMap = new Map(network.routes.map((r) => [r.id, r]));
  const stopsById = new Map(network.stops.map((s) => [s.id, s]));

  // CASE 1: Origin-to-Destination Route Details Page (/delhi-metro/route/mg-road-to-anand-vihar)
  const parsedPair = parseMetroRouteSlug(routeSlug);
  if (parsedPair) {
    const plan = await fetchCachedMetroRoutePlan(
      parsedPair.fromSlug,
      parsedPair.toSlug,
      "fastest",
    );
    if (!plan) {
      notFound();
    }

    const rec = plan.recommended;
    const fromSt = plan.fromStation;
    const toSt = plan.toStation;
    const lineBadges = rec.segments
      .filter((s) => s.line)
      .map((s) => s.line!.badge);

    const routeFaqs = [
      {
        q: `What is the metro route and fare from ${fromSt.name} to ${toSt.name}?`,
        a: `The fastest metro route from ${fromSt.name} to ${toSt.name} covers ${rec.totalDistanceKm} km across ${rec.totalStops} stations in approximately ${rec.totalDurationMin} minutes via ${lineBadges.join(" and ")}. The DMRC Token/QR fare is ₹${rec.fare.tokenFareInr}, Smart Card Peak fare is ₹${rec.fare.smartCardPeakInr} (Off-Peak ₹${rec.fare.smartCardOffPeakInr}), and Sunday/Holiday fare is ₹${rec.fare.sundayHolidayInr}.`,
      },
      {
        q: `How many interchanges are there between ${fromSt.name} and ${toSt.name} metro station?`,
        a:
          rec.interchangeCount === 0
            ? `There are 0 interchanges between ${fromSt.name} and ${toSt.name}. You can travel on a direct train on the ${lineBadges[0]} towards ${rec.segments[0]?.towardsTerminal}.`
            : `There ${rec.interchangeCount === 1 ? "is 1 interchange" : `are ${rec.interchangeCount} interchanges`} on the recommended route between ${fromSt.name} and ${toSt.name}: ${rec.interchanges.map((ic) => `switch from ${ic.fromLine.badge} to ${ic.toLine.badge} at ${ic.station.name} (~${ic.transferDurationMin} mins)`).join("; ")}.${plan.alternatives.length > 1 ? ` You can also select among ${plan.alternatives.length} route options (Fastest vs Minimum Interchange) in the planner above.` : ""}`,
      },
      {
        q: `What is the first and last metro timing from ${fromSt.name} to ${toSt.name}?`,
        a: `At ${fromSt.name} Metro Station, the first metro train departs around ${rec.firstTrainFromOrigin} and the last train departs around ${rec.lastTrainFromOrigin}. Peak-hour train frequency is every ${rec.peakFrequencyMin}.`,
      },
      {
        q: `How many stations are between ${fromSt.name} and ${toSt.name}?`,
        a: `There are ${rec.totalStops} metro stations (${Math.max(0, rec.totalStops - 1)} intermediate halts) on the ${rec.totalDistanceKm} km route from ${fromSt.name} to ${toSt.name}.`,
      },
    ];

    const tripJsonLd = {
      "@context": "https://schema.org",
      "@type": "TrainTrip",
      name: `${fromSt.name} to ${toSt.name} Delhi NCR Metro Route`,
      departureStation: {
        "@type": "TrainStation",
        name: `${fromSt.name} Metro Station`,
      },
      arrivalStation: {
        "@type": "TrainStation",
        name: `${toSt.name} Metro Station`,
      },
      provider: {
        "@type": "Organization",
        name: network.agency.name,
      },
    };

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: routeFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
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
          name: "Delhi NCR Metro",
          item: "https://traveladda.in/delhi-metro",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${fromSt.name} to ${toSt.name} Metro`,
          item: `https://traveladda.in/delhi-metro/route/${plan.routeSlug}`,
        },
      ],
    };

    const popularHubSlugs = [
      "mg-road",
      "anand-vihar",
      "rajiv-chowk",
      "new-delhi",
      "kashmere-gate",
      "huda-city-centre",
      "igi-airport",
      "noida-electronic-city",
      "hauz-khas",
      "botanical-garden",
      "lajpat-nagar",
    ].filter((s) => s !== fromSt.slug && s !== toSt.slug);

    return (
      <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Deep Navy Hero Header */}
        <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300"
            >
              <Link href="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/delhi-metro"
                className="hover:text-white hover:underline"
              >
                Delhi NCR Metro
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {fromSt.name} to {toSt.name} Metro
              </span>
            </nav>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white sm:text-xs">
                    Delhi NCR Metro Route
                  </span>
                  <span className="rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-200 sm:text-xs">
                    Token: ₹{rec.fare.tokenFareInr} • Card: ₹
                    {rec.fare.smartCardPeakInr}
                  </span>
                  <span className="rounded-full bg-amber-500/25 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-200 sm:text-xs">
                    {rec.totalDurationMin} Mins • {rec.totalStops} Stops
                  </span>
                </div>

                <h1 className="text-xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {fromSt.name} to {toSt.name} Metro Route, Fare &amp; Timings
                </h1>
                <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-200 sm:mt-2 sm:text-sm">
                  The Delhi NCR Metro journey from{" "}
                  <strong className="text-white">{fromSt.name}</strong> to{" "}
                  <strong className="text-white">{toSt.name}</strong> covers{" "}
                  <strong className="text-white">
                    {rec.totalDistanceKm} km
                  </strong>{" "}
                  across{" "}
                  <strong className="text-white">
                    {rec.totalStops} stations
                  </strong>{" "}
                  in{" "}
                  <strong className="text-white">
                    ~{rec.totalDurationMin} minutes
                  </strong>{" "}
                  via{" "}
                  <strong className="text-white">
                    {lineBadges.join(" → ")}
                  </strong>{" "}
                  with a token fare of{" "}
                  <strong className="text-white">
                    ₹{rec.fare.tokenFareInr}
                  </strong>{" "}
                  (Smart Card: ₹{rec.fare.smartCardPeakInr}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildMetroRoutePath(toSt.slug, fromSt.slug)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <SwapIcon className="h-3.5 w-3.5" />
                  <span>
                    Reverse: {toSt.name} → {fromSt.name}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-6 px-3.5 sm:-mt-10 sm:space-y-8 sm:px-6 lg:px-8">
          {/* Pre-Hydrated Interactive Metro Route Finder (Changing stations updates URL to new route!) */}
          <Suspense
            fallback={
              <div className="h-64 animate-pulse rounded-2xl border border-line bg-card p-6" />
            }
          >
            <MetroRouteFinder
              key={plan.routeSlug}
              stations={network.stops}
              lines={network.routes}
              mode="details"
              initialFromSlug={fromSt.slug}
              initialToSlug={toSt.slug}
              initialPreference="fastest"
              initialResult={plan}
            />
          </Suspense>

          {/* SSR About Origin to Destination Metro Summary Box & Table */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <h2 className="text-base font-extrabold text-ink sm:text-xl">
              About {fromSt.name} to {toSt.name} Metro Route — Quick Summary
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
              Commuters traveling from <strong>{fromSt.name}</strong> to{" "}
              <strong>{toSt.name}</strong> on the Delhi NCR Metro network can
              board the{" "}
              <strong>{rec.segments[0]?.line?.badge || "Metro"}</strong> (
              {rec.segments[0]?.platformHint || "Platform"}) starting at{" "}
              <strong>{rec.firstTrainFromOrigin}</strong>.{" "}
              {rec.interchangeCount === 0
                ? `This is a direct 0-interchange journey with ${rec.totalStops} stops.`
                : `The route requires ${rec.interchangeCount} line change${rec.interchangeCount > 1 ? "s" : ""} at ${rec.interchanges.map((i) => i.station.name).join(", ")}.`}
            </p>

            <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px] border-collapse rounded-xl border border-line text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <th className="px-3.5 py-2.5">Origin</th>
                    <th className="px-3.5 py-2.5">Destination</th>
                    <th className="px-3.5 py-2.5">Travel Time</th>
                    <th className="px-3.5 py-2.5">Distance &amp; Stops</th>
                    <th className="px-3.5 py-2.5">Token / Card Fare</th>
                    <th className="px-3.5 py-2.5">Interchanges</th>
                    <th className="px-3.5 py-2.5">First / Last Metro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-card font-semibold text-ink">
                    <td className="px-3.5 py-3 font-extrabold">
                      <Link
                        href={buildMetroStationPath(fromSt.slug)}
                        className="text-[#1956b4] hover:underline dark:text-blue-300"
                      >
                        {fromSt.name}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 font-extrabold">
                      <Link
                        href={buildMetroStationPath(toSt.slug)}
                        className="text-[#1956b4] hover:underline dark:text-blue-300"
                      >
                        {toSt.name}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 font-mono font-extrabold">
                      {rec.totalDurationMin} mins
                    </td>
                    <td className="px-3.5 py-3 font-mono">
                      {rec.totalDistanceKm} km ({rec.totalStops} stops)
                    </td>
                    <td className="px-3.5 py-3 font-mono font-extrabold text-emerald-700 dark:text-emerald-300">
                      ₹{rec.fare.tokenFareInr} / ₹{rec.fare.smartCardPeakInr}
                    </td>
                    <td className="px-3.5 py-3">
                      {rec.interchangeCount === 0
                        ? "0 (Direct)"
                        : `${rec.interchangeCount} (${rec.interchanges.map((i) => i.station.name).join(", ")})`}
                    </td>
                    <td className="px-3.5 py-3 font-mono text-xs">
                      {rec.firstTrainFromOrigin} – {rec.lastTrainFromOrigin}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SSR Full Station-by-Station Route Timetable */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                  Complete Station Sequence ({rec.allStops.length} Stations)
                </span>
                <h2 className="text-base font-extrabold text-ink sm:text-xl">
                  {fromSt.name} to {toSt.name} Metro Station-by-Station Timings
                  &amp; Distance Table
                </h2>
              </div>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <th className="px-3 py-2.5 sm:px-3.5">Stop #</th>
                    <th className="px-3 py-2.5 sm:px-3.5">
                      Metro Station Name
                    </th>
                    <th className="px-3 py-2.5 sm:px-3.5">Connecting Lines</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Cumulative Time</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Distance (km)</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Journey Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rec.allStops.map((stop, idx) => {
                    const isOrigin = idx === 0;
                    const isDest = idx === rec.allStops.length - 1;
                    const isTransferHere = rec.interchanges.some(
                      (ic) =>
                        ic.station.id === stop.stopId ||
                        ic.departStation.id === stop.stopId,
                    );
                    return (
                      <tr
                        key={`${stop.stopId}-${idx}`}
                        className={`transition hover:bg-subcard/60 ${
                          isOrigin || isDest || isTransferHere
                            ? "bg-blue-50/40 font-bold dark:bg-blue-950/20"
                            : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs text-ink-muted sm:px-3.5">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-ink sm:px-3.5">
                          <Link
                            href={buildMetroStationPath(stop.slug)}
                            className="hover:text-[#1956b4] hover:underline"
                          >
                            {stop.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 sm:px-3.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {stop.routeIds.map((rid) => {
                              const ln = linesMap.get(rid);
                              if (!ln) return null;
                              return (
                                <span
                                  key={`${stop.stopId}-${rid}-${idx}`}
                                  style={{
                                    backgroundColor: ln.color,
                                    color: ln.textColor,
                                  }}
                                  className="rounded px-1.5 py-0.5 text-[10px] font-extrabold"
                                >
                                  {ln.badge}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-ink sm:px-3.5">
                          {stop.cumulativeDurationMin} mins
                        </td>
                        <td className="px-3 py-2.5 font-mono text-ink-soft sm:px-3.5">
                          {stop.cumulativeDistanceKm} km
                        </td>
                        <td className="px-3 py-2.5 sm:px-3.5">
                          {isOrigin ? (
                            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                              Origin Boarding
                            </span>
                          ) : isDest ? (
                            <span className="rounded bg-[#1956b4]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:text-blue-300">
                              Destination Arrival
                            </span>
                          ) : isTransferHere ? (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                              ⇄ Change Train Here
                            </span>
                          ) : (
                            <span className="text-xs text-ink-muted">
                              Intermediate Halt
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Route-Specific FAQs */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <h2 className="text-base font-extrabold text-ink sm:text-xl">
              FAQs — {fromSt.name} to {toSt.name} Delhi NCR Metro
            </h2>
            <div className="mt-4 space-y-3">
              {routeFaqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-line bg-subcard/40 p-3.5 sm:p-4"
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

          {/* Related Routes & Full Station Combination Links */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <h2 className="text-sm font-extrabold text-ink sm:text-lg">
              More Popular Metro Routes from {fromSt.name} &amp; {toSt.name}
            </h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {popularHubSlugs.slice(0, 6).map((hubSlug) => {
                const hub = network.stops.find((s) => s.slug === hubSlug);
                if (!hub) return null;
                return (
                  <Link
                    key={`from-${fromSt.slug}-to-${hub.slug}`}
                    href={buildMetroRoutePath(fromSt.slug, hub.slug)}
                    className="flex items-center justify-between rounded-xl border border-line bg-subcard/40 px-3.5 py-2.5 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
                  >
                    <span className="truncate">
                      {fromSt.name} → {hub.name} Metro
                    </span>
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  </Link>
                );
              })}
            </div>

            <details className="group mt-4 border-t border-line pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-extrabold text-[#1956b4] [&::-webkit-details-marker]:hidden dark:text-blue-300">
                <span>
                  Explore All {network.stops.length - 1} Metro Routes from{" "}
                  {fromSt.name} to Every Delhi NCR Station (A–Z)
                </span>
                <span className="shrink-0 rounded-lg border border-line bg-subcard px-2.5 py-1 text-[11px] font-bold">
                  All {network.stops.length - 1} ▼
                </span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                {[...network.stops]
                  .filter((s) => s.id !== fromSt.id)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((dest) => (
                    <Link
                      key={`all-${fromSt.slug}-to-${dest.slug}`}
                      href={buildMetroRoutePath(fromSt.slug, dest.slug)}
                      className="truncate rounded-lg border border-line/70 bg-subcard/30 px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                    >
                      {fromSt.name} to {dest.name}
                    </Link>
                  ))}
              </div>
            </details>
          </section>
        </div>
      </main>
    );
  }

  // CASE 2: Metro Line Page (/delhi-metro/yellow-line, etc.)
  const line = getMetroLineBySlug(routeSlug);
  if (line) {
    const lineStops = line.stopIds
      .map((sid) => stopsById.get(sid))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    const fromSlug = lineStops[0]?.slug || "mg-road";
    const toSlug =
      lineStops[lineStops.length - 1]?.slug || "anand-vihar";

    return (
      <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
        <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300"
            >
              <Link href="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/delhi-metro"
                className="hover:text-white hover:underline"
              >
                Delhi NCR Metro
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">{line.badge}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <span
                style={{
                  backgroundColor: line.color,
                  color: line.textColor,
                }}
                className="rounded-lg px-3 py-1 text-xs font-extrabold shadow-xs"
              >
                {line.badge} ({line.shortCode})
              </span>
              <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold text-white">
                {line.totalStops} Stations • {line.totalDistanceKm} km • ~
                {line.totalDurationMin} mins
              </span>
            </div>

            <h1 className="mt-2 text-xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Delhi NCR Metro {line.badge} — Stations, Route Map, Interchanges
              &amp; Timings
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-200 sm:mt-2 sm:text-sm">
              Complete station list for the{" "}
              <strong className="text-white">{line.badge}</strong> running
              between{" "}
              <strong className="text-white">{line.fromStationName}</strong> and{" "}
              <strong className="text-white">{line.toStationName}</strong> (
              {line.zone}). Select any Origin and Destination below to view
              exact route &amp; fare.
            </p>
          </div>
        </section>

        <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-6 px-3.5 sm:-mt-10 sm:space-y-8 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-2xl border border-line bg-card p-6" />
            }
          >
            <MetroRouteFinder
              key={line.slug}
              stations={network.stops}
              lines={network.routes}
              mode="search-only"
              initialFromSlug={fromSlug}
              initialToSlug={toSlug}
              initialPreference="fastest"
            />
          </Suspense>

          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <h2 className="text-base font-extrabold text-ink sm:text-xl">
              All {lineStops.length} Stations on {line.badge} (
              {line.fromStationName} ↔ {line.toStationName})
            </h2>
            <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[540px] border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <th className="px-3 py-2.5 sm:px-3.5">#</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Station Name</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Lines Served</th>
                    <th className="px-3 py-2.5 sm:px-3.5">First / Last Train</th>
                    <th className="px-3 py-2.5 sm:px-3.5">Plan Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lineStops.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-subcard/60">
                      <td className="px-3 py-2.5 font-mono text-xs text-ink-muted sm:px-3.5">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5 font-extrabold text-ink sm:px-3.5">
                        <Link
                          href={buildMetroStationPath(st.slug)}
                          className="hover:text-[#1956b4] hover:underline"
                        >
                          {st.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 sm:px-3.5">
                        <div className="flex flex-wrap gap-1">
                          {st.routeIds.map((rid) => {
                            const ln = linesMap.get(rid);
                            if (!ln) return null;
                            return (
                              <span
                                key={`${st.id}-${rid}`}
                                style={{
                                  backgroundColor: ln.color,
                                  color: ln.textColor,
                                }}
                                className="rounded px-1.5 py-0.5 text-[10px] font-extrabold"
                              >
                                {ln.badge}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-ink-soft sm:px-3.5">
                        {st.firstTrain} – {st.lastTrain}
                      </td>
                      <td className="px-3 py-2.5 sm:px-3.5">
                        <Link
                          href={buildMetroRoutePath(
                            st.slug,
                            st.slug === "rajiv-chowk"
                              ? "huda-city-centre"
                              : "rajiv-chowk",
                          )}
                          className="font-bold text-[#1956b4] hover:underline dark:text-blue-300"
                        >
                          Routes from {st.name} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // CASE 3: Single Metro Station Page (/delhi-metro/shivaji-stadium, /delhi-metro/mg-road, etc.)
  const station = getMetroStationBySlugOrId(routeSlug);
  if (station) {
    const defaultDestSlug =
      station.slug === "rajiv-chowk" ? "huda-city-centre" : "rajiv-chowk";

    const popularDestinations = [
      "mg-road",
      "anand-vihar",
      "rajiv-chowk",
      "new-delhi",
      "kashmere-gate",
      "huda-city-centre",
      "igi-airport",
      "noida-electronic-city",
      "hauz-khas",
      "botanical-garden",
      "lajpat-nagar",
      "dwarka-sector-21",
    ].filter((s) => s !== station.slug);

    return (
      <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
        <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300"
            >
              <Link href="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/delhi-metro"
                className="hover:text-white hover:underline"
              >
                Delhi NCR Metro
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {station.name} Metro Station
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {station.routeIds.map((rid) => {
                const ln = linesMap.get(rid);
                if (!ln) return null;
                return (
                  <span
                    key={rid}
                    style={{
                      backgroundColor: ln.color,
                      color: ln.textColor,
                    }}
                    className="rounded-lg px-2.5 py-0.5 text-xs font-extrabold"
                  >
                    {ln.badge}
                  </span>
                );
              })}
              {station.isInterchange && (
                <span className="rounded-full bg-amber-500/25 px-3 py-0.5 text-xs font-extrabold text-amber-200">
                  Interchange Hub
                </span>
              )}
            </div>

            <h1 className="mt-2 text-xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              {station.name} Metro Station — Routes, Timings ({station.firstTrain}
              ), Lines &amp; Fare
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-slate-200 sm:mt-2 sm:text-sm">
              Plan your Delhi NCR Metro journey from{" "}
              <strong className="text-white">
                {station.name} Metro Station
              </strong>
              . First train departs at{" "}
              <strong className="text-white">{station.firstTrain}</strong> and
              last train departs at{" "}
              <strong className="text-white">{station.lastTrain}</strong>.
            </p>
          </div>
        </section>

        <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-6 px-3.5 sm:-mt-10 sm:space-y-8 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-2xl border border-line bg-card p-6" />
            }
          >
            <MetroRouteFinder
              key={station.slug}
              stations={network.stops}
              lines={network.routes}
              mode="search-only"
              initialFromSlug={station.slug}
              initialToSlug={defaultDestSlug}
              initialPreference="fastest"
            />
          </Suspense>

          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <h2 className="text-base font-extrabold text-ink sm:text-xl">
              Direct Metro Route Links from {station.name}
            </h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {popularDestinations.map((destSlug) => {
                const dest = network.stops.find((s) => s.slug === destSlug);
                if (!dest) return null;
                return (
                  <Link
                    key={`${station.slug}-to-${dest.slug}`}
                    href={buildMetroRoutePath(station.slug, dest.slug)}
                    className="flex items-center justify-between rounded-xl border border-line bg-subcard/40 px-3.5 py-3 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
                  >
                    <span className="truncate">
                      {station.name} → {dest.name} Metro Route
                    </span>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                  </Link>
                );
              })}
            </div>

            <details className="group mt-5 border-t border-line pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-extrabold text-[#1956b4] [&::-webkit-details-marker]:hidden dark:text-blue-300">
                <span>
                  All {network.stops.length - 1} Metro Route Combinations from{" "}
                  {station.name} (A–Z Stations)
                </span>
                <span className="shrink-0 rounded-lg border border-line bg-subcard px-2.5 py-1 text-[11px] font-bold">
                  View All {network.stops.length - 1} ▼
                </span>
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
                {[...network.stops]
                  .filter((s) => s.id !== station.id)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((dest) => (
                    <Link
                      key={`st-${station.slug}-to-${dest.slug}`}
                      href={buildMetroRoutePath(station.slug, dest.slug)}
                      className="truncate rounded-lg border border-line/70 bg-subcard/30 px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                    >
                      {station.name} to {dest.name}
                    </Link>
                  ))}
              </div>
            </details>
          </section>
        </div>
      </main>
    );
  }

  notFound();
}
