import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/Icons";
import { IxigoStyleFlightExplorer } from "@/components/IxigoStyleFlightExplorer";
import { fetchFlightRoutePageData } from "@/lib/flight-booking-service";
import {
  AIRPORT_BY_IATA_MAP,
  buildFlightRoutePath,
  getAllIndexableFlightRouteSlugs,
  MAJOR_AIRPORT_HUBS,
  POPULAR_FLIGHT_CORRIDORS,
} from "@/lib/flight-booking-types";

export const metadata: Metadata = {
  title:
    "Flight Tickets, Schedule & Cheapest Airfare Finder (INR, USD, AED) — Compare IndiGo, Air India, Akasa",
  description:
    "Compare live domestic and international flight schedules, non-stop durations, departure terminals (T1/T2/T3), 14-day lowest airfare calendar in INR/USD/AED, and book directly on Aviasales, ixigo, MakeMyTrip & Goibibo.",
  keywords: [
    "flight booking",
    "cheap flights India",
    "flight schedule and price",
    "Delhi to Mumbai flights",
    "Bengaluru to Delhi flights",
    "IndiGo flight schedule",
    "Air India flight timings",
    "compare flight prices ixigo MakeMyTrip",
    "domestic flight timetable India",
  ],
  alternates: {
    canonical: "https://traveladda.in/flights",
  },
  openGraph: {
    title:
      "Compare Live Flight Schedules, Terminals & Cheapest Fares | TravelAdda",
    description:
      "Check non-stop flight timings, airport terminals, 14-day cheapest fare calendar (INR/USD/AED/EUR), and instant booking links across 1,496+ routes.",
    url: "https://traveladda.in/flights",
    type: "website",
    images: [
      {
        url: "/api/og?type=flight&title=Flight%20Schedule%20%26%20Cheapest%20Fare%20Finder&subtitle=Compare%201%2C496%2B%20Routes%20%E2%80%A2%20Non-Stop%20Timings%20%E2%80%A2%20T1%2FT2%2FT3%20Terminals%20%E2%80%A2%20Multi-Currency",
        width: 1200,
        height: 630,
        alt: "TravelAdda Flight Schedule & Cheapest Fare Finder",
      },
    ],
  },
};

const FLIGHT_HUB_FAQS = [
  {
    q: "How can I find the cheapest flight date between two Indian cities?",
    a: "Use the 14-Day Lowest Fare Calendar ribbon above the flight list. It fetches daily lowest airfares from the Travelpayouts Aviasales API and highlights the cheapest travel date in green.",
  },
  {
    q: "Can I view flight prices in INR, USD, AED, EUR, or GBP?",
    a: "Yes. Click any currency pill (INR, USD, AED, EUR, GBP) in the top right of the flight search box to switch all flight fares and the 14-day price calendar into your preferred currency.",
  },
  {
    q: "Does this page show departure and arrival airport terminals (T1, T2, T3)?",
    a: "Yes. Every flight card displays the exact departure terminal at the origin airport (such as Delhi IGI T1, T2, or T3) and the arrival terminal at the destination airport (such as Mumbai CSMIA T1 or T2), along with cabin (7 kg) and check-in (15 kg / 25 kg) baggage allowances.",
  },
  {
    q: "How does flight booking work on TravelAdda?",
    a: "TravelAdda is an independent flight schedule and airfare comparison engine. When you click 'Book Flight' or choose ixigo, MakeMyTrip, or Goibibo, we redirect you directly to the verified booking checkout with your origin, destination, and travel date pre-filled.",
  },
  {
    q: "सस्ती फ्लाइट टिकट और टर्मिनल (T1/T2/T3) कैसे चेक करें?",
    a: "ऊपर दिए गए सर्च बॉक्स में अपना प्रस्थान एयरपोर्ट (जैसे दिल्ली DEL) और गंतव्य एयरपोर्ट (जैसे मुंबई BOM) चुनें। आपको सभी नॉन-स्टॉप फ्लाइट्स का समय, टर्मिनल नंबर, 14-दिन का सबसे सस्ता किराया कैलेंडर और डायरेक्ट बुकिंग लिंक तुरंत दिख जाएंगे।",
  },
];

export default async function FlightsHubPage() {
  "use cache";
  cacheLife("hours");

  const initialData = await fetchFlightRoutePageData("DEL", "BOM", null, "inr");
  const allRoutes = getAllIndexableFlightRouteSlugs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda Flight Schedule, Terminal & Cheapest Fare Finder",
        url: "https://traveladda.in/flights",
        applicationCategory: "TravelApplication",
        operatingSystem: "Web",
        description:
          "Compare live flight schedules, non-stop durations, airport terminals (T1/T2/T3), and 14-day lowest airfares in INR, USD, AED, EUR, and GBP across 1,496+ routes.",
      },
      {
        "@type": "FAQPage",
        mainEntity: FLIGHT_HUB_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
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

      {/* Clean Hero Header */}
      <section className="border-b border-line bg-linear-to-b from-[#0a223d] to-[#10325a] py-7 text-white sm:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">
                <SparklesIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                <span>
                  1,496+ Domestic &amp; International Flight Routes · Multi-Currency
                </span>
              </div>
              <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                Flight Schedule, Terminals &amp; Cheapest Airfare Finder
              </h1>
              <p className="mt-1.5 max-w-3xl text-xs text-slate-200 sm:text-sm">
                Compare daily non-stop flight timings, airport terminals (T1,
                T2, T3), 14-day lowest fare calendar in INR / USD / AED / EUR,
                and instant booking links for IndiGo, Air India, Akasa Air &amp;
                more.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <Link
                href="/air/flight-status"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-white transition hover:bg-white/20"
              >
                <ClockIcon className="h-3.5 w-3.5 text-emerald-300" />
                <span>Live Flight Status Tracker</span>
              </Link>
              <Link
                href="/air/flight-compensation"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-white transition hover:bg-white/20"
              >
                <ShieldCheckIcon className="h-3.5 w-3.5 text-amber-300" />
                <span>DGCA Delay Compensation</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Ixigo-Style Flight Explorer */}
      <section
        aria-label="Flight Search and Schedule Explorer"
        className="mx-auto -mt-4 max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <IxigoStyleFlightExplorer initialData={initialData} />
      </section>

      {/* Popular Domestic & International Flight Corridors */}
      <section
        aria-labelledby="popular-flight-routes-heading"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="popular-flight-routes-heading"
              className="text-lg font-extrabold text-ink sm:text-xl"
            >
              Popular Flight Routes — Daily Timetable, Terminal &amp; Fares
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Select any high-frequency air corridor below to inspect non-stop
              flight numbers, terminal gates, and 14-day lowest fares:
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_FLIGHT_CORRIDORS.map((item) => {
            const fromHub = AIRPORT_BY_IATA_MAP.get(item.fromIata);
            const toHub = AIRPORT_BY_IATA_MAP.get(item.toIata);
            if (!fromHub || !toHub) return null;
            const path = buildFlightRoutePath(fromHub.citySlug, toHub.citySlug);

            return (
              <Link
                key={`${item.fromIata}-${item.toIata}`}
                href={path}
                className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 transition hover:border-[#1956b4] hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                      {fromHub.iata} → {toHub.iata}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                    {fromHub.city} to {toHub.city} Flights
                  </h3>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    Origin {fromHub.domesticTerminal} · Arrival{" "}
                    {toHub.domesticTerminal}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
                  <span className="text-ink-soft">Schedule &amp; Fares</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400">
                    <span>Compare</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Expandable Complete Airport Route Directory */}
        <details className="group mt-6 rounded-2xl border border-line bg-card p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink sm:text-base">
            <span>
              Browse All {allRoutes.length.toLocaleString("en-IN")} Domestic
              &amp; International Flight Routes (40 Major Airports)
            </span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
          </summary>
          <p className="mt-1.5 text-xs text-ink-soft">
            Direct airport-to-airport flight schedules, durations, and lowest
            fares indexed for instant search:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {allRoutes.slice(0, 240).map((r) => (
              <Link
                key={r.routeSlug}
                href={r.routePath}
                className="flex items-center justify-between gap-2 rounded-lg border border-line/70 bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <span className="truncate">
                  {r.originCity} to {r.destinationCity} Flights
                </span>
                <span className="shrink-0 font-mono text-[10px] font-bold text-[#1956b4] dark:text-blue-300">
                  {r.originIata}→{r.destinationIata}
                </span>
              </Link>
            ))}
          </div>
        </details>
      </section>

      {/* Major Indian & International Airport Terminals Quick Guide */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Major Indian Airport Terminals &amp; IATA Code Reference
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
          Quickly verify domestic and international passenger terminals before
          leaving for the airport:
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-line bg-subcard/70 text-[11px] font-extrabold tracking-wider text-ink-muted uppercase">
                <tr>
                  <th className="px-4 py-3">City &amp; IATA</th>
                  <th className="px-4 py-3">Official Airport Name</th>
                  <th className="px-4 py-3">Domestic Terminal</th>
                  <th className="px-4 py-3">International Terminal</th>
                  <th className="px-4 py-3 text-right">Top Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {MAJOR_AIRPORT_HUBS.slice(0, 14).map((hub) => {
                  const targetTo = hub.iata === "DEL" ? "BOM" : "DEL";
                  const targetCity = hub.iata === "DEL" ? "Mumbai" : "New Delhi";
                  return (
                    <tr key={hub.iata} className="hover:bg-subcard/30">
                      <td className="px-4 py-3 font-bold text-ink">
                        <span>{hub.city}</span>{" "}
                        <span className="ml-1 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          {hub.iata}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {hub.airportName}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-ink">
                        {hub.domesticTerminal}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-ink">
                        {hub.intlTerminal}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={buildFlightRoutePath(hub.iata, targetTo)}
                          className="inline-flex items-center gap-1 font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                        >
                          <span>
                            {hub.city} → {targetCity}
                          </span>
                          <ArrowRightIcon className="h-3 w-3" />
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

      {/* FAQs */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — Flight Schedule &amp; Airfare Comparison
        </h2>
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {FLIGHT_HUB_FAQS.map((faq, idx) => (
            <details
              key={faq.q}
              open={idx === 0}
              className="group p-4 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                <span>{faq.q}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

