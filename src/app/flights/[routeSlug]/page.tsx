import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  PlaneIcon,
  ShieldCheckIcon,
  SwapArrowsIcon,
} from "@/components/Icons";
import { IxigoStyleFlightExplorer } from "@/components/IxigoStyleFlightExplorer";
import { fetchCachedSeoFlightRouteData } from "@/lib/flight-booking-service";
import {
  AIRPORT_BY_IATA_MAP,
  buildFlightRoutePath,
  buildFlightRouteSlug,
  getRelatedFlightRoutes,
  POPULAR_FLIGHT_CORRIDORS,
} from "@/lib/flight-booking-types";
import { buildFlightStatusPath } from "@/lib/flight-types";

interface FlightRoutePageProps {
  params: Promise<{ routeSlug: string }>;
}

export function generateStaticParams() {
  return POPULAR_FLIGHT_CORRIDORS.slice(0, 16)
    .map((c) => {
      const from = AIRPORT_BY_IATA_MAP.get(c.fromIata);
      const to = AIRPORT_BY_IATA_MAP.get(c.toIata);
      if (!from || !to) return null;
      return {
        routeSlug: buildFlightRouteSlug(from.citySlug, to.citySlug),
      };
    })
    .filter((item): item is { routeSlug: string } => Boolean(item));
}

export async function generateMetadata({
  params,
}: FlightRoutePageProps): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const data = await fetchCachedSeoFlightRouteData(routeSlug);
  if (!data) {
    return {
      title: "Flight Route Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { origin, destination } = data;
  const canonicalUrl = `https://traveladda.in${data.routePath}`;
  const airlinesText = data.airlinesOperating.map((a) => a.name).join(", ");

  const title = `${origin.city} to ${destination.city} Flights (${origin.iata} to ${destination.iata}) — Schedule, Terminal & Fares from ${data.formattedLowestFare}`;
  const description = `Compare ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) flight schedule, non-stop duration (${data.minDurationFormatted}), departure terminal (${origin.domesticTerminal}), arrival terminal (${destination.domesticTerminal}), and lowest fares starting at ${data.formattedLowestFare} across ${airlinesText}.`;

  return {
    title,
    description,
    keywords: [
      `${origin.city} to ${destination.city} flights`,
      `${origin.iata} to ${destination.iata} flight schedule`,
      `cheap flights from ${origin.city} to ${destination.city}`,
      `${origin.city} to ${destination.city} flight time`,
      `${origin.city} to ${destination.city} flight ticket price`,
      `${origin.city} to ${destination.city} non stop flights`,
      `${origin.iata} to ${destination.iata} terminal`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: `/api/og?type=flight&title=${encodeURIComponent(
            `${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) Flights`
          )}&subtitle=${encodeURIComponent(
            `Fastest ${data.minDurationFormatted} • ${data.directFlightsCount} Non-Stop Flights • ${origin.domesticTerminal} to ${destination.domesticTerminal}`
          )}&badge=${encodeURIComponent(`${origin.iata} → ${destination.iata}`)}`,
          width: 1200,
          height: 630,
          alt: `${origin.city} to ${destination.city} Flights Schedule & Terminals`,
        },
      ],
    },
  };
}

export default async function FlightRouteSeoPage({
  params,
}: FlightRoutePageProps) {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const routeData = await fetchCachedSeoFlightRouteData(routeSlug);
  if (!routeData) {
    notFound();
  }

  const normalizedIncomingSlug = decodeURIComponent(routeSlug || "")
    .trim()
    .toLowerCase();
  if (normalizedIncomingSlug !== routeData.routeSlug) {
    permanentRedirect(routeData.routePath);
  }

  const { origin, destination } = routeData;
  const reverseRoutePath = buildFlightRoutePath(
    destination.citySlug,
    origin.citySlug
  );
  const relatedRoutes = getRelatedFlightRoutes(
    origin.iata,
    destination.iata,
    16
  );

  const routeFaqs = [
    {
      question: `What is the lowest flight fare from ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata})?`,
      answer: `The lowest one-way airfare from ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) currently starts at ${routeData.formattedLowestFare}, while the average economy fare is around ${routeData.formattedAverageFare}. Booking 2 to 3 weeks in advance typically secures the lowest fare slab.`,
    },
    {
      question: `How long does a non-stop flight take from ${origin.city} to ${destination.city}?`,
      answer: `A direct non-stop flight from ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) covers an aerial distance of ${routeData.aerialDistanceKm} km in approximately ${routeData.minDurationFormatted}.`,
    },
    {
      question: `Which airport terminal do ${origin.city} to ${destination.city} flights depart from and arrive at?`,
      answer: `Flights from ${origin.city} (${origin.airportName}) depart from Terminal ${origin.domesticTerminal} and arrive at ${destination.city} (${destination.airportName}) Terminal ${destination.domesticTerminal}. Always verify your exact terminal printed on your airline boarding pass.`,
    },
    {
      question: `What is the first and last flight time from ${origin.city} to ${destination.city}?`,
      answer: `The first daily flight from ${origin.city} (${origin.iata}) to ${destination.city} (${destination.iata}) departs at ${routeData.firstFlightTime} IST, and the last flight departs at ${routeData.lastFlightTime} IST. Major airlines operating this corridor include ${routeData.airlinesOperating.map((a) => a.name).join(", ")}.`,
    },
    {
      question: `${origin.cityHindi} (${origin.iata}) से ${destination.cityHindi} (${destination.iata}) की सबसे सस्ती फ्लाइट और समय क्या है?`,
      answer: `${origin.cityHindi} से ${destination.cityHindi} के बीच हवाई दूरी ${routeData.aerialDistanceKm} किमी है और नॉन-स्टॉप फ्लाइट में लगभग ${routeData.minDurationFormatted} का समय लगता है। शुरुआती किराया ${routeData.formattedLowestFare} से शुरू होता है तथा पहली फ्लाइट ${routeData.firstFlightTime} बजे और आखिरी फ्लाइट ${routeData.lastFlightTime} बजे रवाना होती है।`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
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
            name: "Flights",
            item: "https://traveladda.in/flights",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${origin.city} to ${destination.city} Flights`,
            item: `https://traveladda.in${routeData.routePath}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: routeFaqs.map((faq) => ({
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
    <main className="min-h-screen bg-canvas pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Route Hero Banner */}
      <section className="border-b border-line bg-linear-to-b from-[#0a223d] to-[#10325a] py-6 text-white sm:py-9">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/flights" className="hover:text-white">
              Flights
            </Link>
            <span>/</span>
            <span className="font-bold text-white">
              {origin.city} ({origin.iata}) to {destination.city} (
              {destination.iata})
            </span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-blue-200">
                <PlaneIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                <span>
                  {origin.iata} → {destination.iata} · {routeData.aerialDistanceKm}{" "}
                  km · {routeData.directFlightsCount} Non-Stop Flights
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {origin.city} to {destination.city} Flights ({origin.iata} →{" "}
                {destination.iata})
              </h1>
              <p className="mt-1.5 max-w-3xl text-xs text-slate-200 sm:text-sm">
                Compare daily flight schedules, departure terminal (
                {origin.domesticTerminal}) &amp; arrival terminal (
                {destination.domesticTerminal}), non-stop duration (
                {routeData.minDurationFormatted}), and lowest airfares starting
                at{" "}
                <strong className="font-extrabold text-white">
                  {routeData.formattedLowestFare}
                </strong>
                .
              </p>
            </div>

            <Link
              href={reverseRoutePath}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-white/20"
            >
              <SwapArrowsIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>
                Return: {destination.city} ({destination.iata}) to {origin.city}{" "}
                ({origin.iata})
              </span>
            </Link>
          </div>

          {/* 4 Quick KPI Stats */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-300">
                Lowest Airfare
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-emerald-300 sm:text-xl">
                {routeData.formattedLowestFare}
              </div>
              <div className="text-[11px] text-slate-300">
                Avg: {routeData.formattedAverageFare}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-300">
                Fastest Duration
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-white sm:text-xl">
                {routeData.minDurationFormatted}
              </div>
              <div className="text-[11px] text-slate-300">
                {routeData.aerialDistanceKm} km Aerial Distance
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-300">
                First &amp; Last Flight
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-white sm:text-xl">
                {routeData.firstFlightTime} – {routeData.lastFlightTime}
              </div>
              <div className="text-[11px] text-slate-300">
                {routeData.totalFlightsCount} Daily Options
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5">
              <div className="text-[11px] font-semibold text-slate-300">
                Airport Terminals
              </div>
              <div className="mt-0.5 font-mono text-base font-extrabold text-amber-300 sm:text-lg">
                {origin.iata} {origin.domesticTerminal} → {destination.iata}{" "}
                {destination.domesticTerminal}
              </div>
              <div className="truncate text-[11px] text-slate-300">
                {origin.city} to {destination.city}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Ixigo-Style Flight Explorer */}
      <section
        aria-label={`${origin.city} to ${destination.city} Flight Search and Fares`}
        className="mx-auto mt-5 max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <IxigoStyleFlightExplorer initialData={routeData} />
      </section>

      {/* SSR Section 1: Complete Route Flight Schedule & Terminal Table */}
      <section
        aria-labelledby="route-timetable-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="route-timetable-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              {origin.city} ({origin.iata}) to {destination.city} (
              {destination.iata}) Flight Schedule &amp; Terminal Table
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Complete daily departure timetable, terminal numbers, duration,
              and live flight tracking links:
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-line bg-subcard/70 text-[11px] font-extrabold tracking-wider text-ink-muted uppercase">
                <tr>
                  <th className="px-4 py-3">Flight &amp; Airline</th>
                  <th className="px-4 py-3">Departure ({origin.iata})</th>
                  <th className="px-4 py-3">Arrival ({destination.iata})</th>
                  <th className="px-4 py-3">Duration &amp; Stops</th>
                  <th className="px-4 py-3">Indicative Fare</th>
                  <th className="px-4 py-3 text-right">Live Status / Book</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {routeData.offers.map((offer) => (
                  <tr key={`tbl-${offer.id}`} className="hover:bg-subcard/30">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-ink">
                        {offer.airlineName}
                      </div>
                      <div className="font-mono text-xs font-bold text-[#1956b4] dark:text-blue-300">
                        {offer.fullFlightCode} · {offer.aircraft}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-extrabold text-ink">
                        {offer.departureTime24} IST
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {origin.city} · Terminal {offer.originTerminal}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-extrabold text-ink">
                        {offer.arrivalTime24} IST
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {destination.city} · Terminal{" "}
                        {offer.destinationTerminal}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-ink">
                        {offer.durationFormatted}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {offer.stopsLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-extrabold text-ink">
                      {offer.formattedPrice}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={buildFlightStatusPath(
                            offer.airlineCode,
                            offer.flightNumber,
                            offer.airlineName
                          )}
                          className="rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
                        >
                          Live Tracker
                        </Link>
                        <a
                          href={offer.bookingUrls.primaryAffiliate}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          style={{
                            backgroundColor: "#fc6203",
                            color: "#ffffff",
                          }}
                          className="ta-btn-primary rounded-lg bg-[#fc6203] px-3 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-[#e55600]"
                        >
                          Book
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SSR Section 2: Route FAQs */}
      <section
        aria-labelledby="route-faq-heading"
        className="mx-auto mt-12 max-w-4xl px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <h2
          id="route-faq-heading"
          className="text-lg font-extrabold text-ink sm:text-xl"
        >
          Frequently Asked Questions — {origin.city} to {destination.city}{" "}
          Flights
        </h2>
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {routeFaqs.map((faq, idx) => (
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

      {/* SSR Section 3: Connected Flight Routes Mesh (Zero-Orphan SEO Interlinking) */}
      <section
        aria-labelledby="related-flight-routes-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="related-flight-routes-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              Related Flight Routes from {origin.city} ({origin.iata}) &amp;{" "}
              {destination.city} ({destination.iata})
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Compare schedules, airport terminals, and lowest fares across
              connected domestic and international air corridors:
            </p>
          </div>
          <Link
            href="/flights"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <ClockIcon className="h-3.5 w-3.5" />
            <span>View All 1,496 Flight Routes</span>
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {relatedRoutes.map((r) => (
            <Link
              key={r.routeSlug}
              href={r.routePath}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {r.originIata} → {r.destinationIata}
                  </span>
                  <span className="text-[11px] font-medium text-ink-muted">
                    Schedule &amp; Fares
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-1 text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                  {r.originCity} to {r.destinationCity} Flights
                </h3>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                <span className="text-ink-soft">Compare Fares</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400">
                  <span>Check</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>
              Synchronized with Travelpayouts Aviasales API &amp; DGCA Civil
              Aviation Timetables
            </span>
          </span>
          <Link
            href="/air/flight-status"
            className="font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            Track Live Flight Status by Flight Number →
          </Link>
        </div>
      </section>
    </main>
  );
}

