import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CompassIcon,
  HelpCircleIcon,
  LiveFlightBeaconIcon,
  LuggageIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneCallIcon,
  PlaneIcon,
  RadarLiveIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveFlightTracker } from "@/components/LiveFlightTracker";
import { FLIGHT_BLOG_POSTS } from "@/lib/blog-data";
import { POPULAR_AIRLINES, POPULAR_LIVE_FLIGHTS } from "@/lib/flight-types";

export const metadata: Metadata = {
  title:
    "Live Flight Status Tracker | Check Airline Arrival, Departure, Terminal & Gate",
  description:
    "Track live domestic and international flight status by airline and flight number. Check real-time IndiGo (6E), Air India (AI), Akasa Air (QP), Air India Express (IX) & Emirates (EK) arrival, departure, terminal, boarding gate, baggage belt, and aircraft model on TravelAdda.",
  keywords: [
    "live flight status",
    "flight status tracker",
    "check flight status by flight number",
    "indigo flight status 6E",
    "air india live flight status",
    "akasa air flight status",
    "air india express flight status",
    "flight arrival and departure time today",
    "airport terminal and boarding gate finder",
    "baggage belt status",
    "domestic international flight tracker india",
  ],
  alternates: {
    canonical: "/air/flight-status",
  },
  openGraph: {
    title:
      "Live Flight Status Tracker | Airline Arrival, Terminal, Gate & Baggage | TravelAdda",
    description:
      "Search any airline and flight number to spot real-time airborne progress, departure & arrival terminals, gates, baggage claim belts, and inbound aircraft status.",
    url: "/air/flight-status",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Flight Status, Terminal & Gate Tracker | TravelAdda",
    description:
      "Check real-time domestic & global flight status, terminal numbers, boarding gates, baggage belts & aircraft types.",
  },
};

const HOW_FLIGHT_TRACKING_WORKS = [
  {
    step: "01",
    title: "Search & Select Airline",
    detail:
      "Type any airline name or IATA code (such as IndiGo 6E, Air India AI, Akasa Air QP, Emirates EK, or Qatar Airways QR) in the live airline search dropdown with official carrier logos.",
  },
  {
    step: "02",
    title: "Enter Flight Number & Date",
    detail:
      "Enter the 1 to 4-digit flight number (e.g., 2045, 562, or 101) and pick your origin airport departure date—Yesterday, Today, or Tomorrow.",
  },
  {
    step: "03",
    title: "Track Terminal, Gate & Air Radar",
    detail:
      "View live airborne progress, scheduled vs estimated times, departure & arrival terminals, boarding gates, baggage claim carousels, aircraft equipment, and inbound plane status.",
  },
];

const FLIGHT_TELEMETRY_FEATURES = [
  {
    title: "Blinking In-Air Flight Radar",
    description:
      "Monitor whether your flight is Scheduled, Out-Gate, In Air, Delayed, or Arrived with an animated progress corridor and remaining flight time.",
    icon: <NavigationIcon className="h-5 w-5" />,
    badge: "LIVE CORRIDOR",
  },
  {
    title: "Terminal & Boarding Gate Finder",
    description:
      "Know your exact departure and arrival terminal numbers (T1, T2, T3, T4) plus assigned boarding and arrival gates before reaching the airport.",
    icon: <MapPinIcon className="h-5 w-5" />,
    badge: "TERMINAL & GATE",
  },
  {
    title: "Baggage Claim Carousel Info",
    description:
      "Skip arrival hall confusion—check assigned baggage claim belt numbers alongside touchdown and in-gate arrival timestamps.",
    icon: <LuggageIcon className="h-5 w-5" />,
    badge: "BAGGAGE BELT",
  },
  {
    title: "Inbound Previous Aircraft Link",
    description:
      "Spot potential knock-on delays early by tracking the incoming previous flight operating your aircraft in a single tap.",
    icon: <RadarLiveIcon className="h-5 w-5" />,
    badge: "INBOUND PLANE",
  },
  {
    title: "Out-Gate, Takeoff & Touchdown",
    description:
      "Compare scheduled timetable slots against real operational pushback (Out-Gate), runway takeoff (Off-Ground), landing (On-Ground), and In-Gate times.",
    icon: <ClockIcon className="h-5 w-5" />,
    badge: "OOOI TELEMETRY",
  },
  {
    title: "Global Airline Directory & Icons",
    description:
      "Search hundreds of Indian and international airlines with locally cached airline logos, IATA/ICAO codes, and customer support helplines.",
    icon: <CompassIcon className="h-5 w-5" />,
    badge: "500+ CARRIERS",
  },
];

const AVIATION_STATUS_GLOSSARY = [
  {
    term: "Scheduled vs Estimated Time",
    meaning:
      "Scheduled Time is the published timetable slot in the airport's local timezone. Estimated Time updates dynamically based on ATC slot clearances, pushback, and airborne wind conditions.",
  },
  {
    term: "Out-Gate & Off-Ground (Departure)",
    meaning:
      "Out-Gate marks when the aircraft releases parking brakes and pushes back from the boarding bridge. Off-Ground is the exact moment the wheels lift off the departure runway.",
  },
  {
    term: "On-Ground & In-Gate (Arrival)",
    meaning:
      "On-Ground records runway touchdown at the destination airport, while In-Gate marks when the aircraft parks at the arrival gate and doors open for disembarkation.",
  },
  {
    term: "Track Inbound Aircraft (Previous Flight)",
    meaning:
      "Most departure delays happen because the incoming plane is running late on its prior leg. Tracking the inbound flight lets you anticipate gate delays before airlines announce them.",
  },
];

const FLIGHT_STATUS_FAQS = [
  {
    question:
      "How can I check live flight status by airline and flight number?",
    answer:
      "Select your airline from the Airline Search box (for example IndiGo 6E, Air India AI, Air India Express IX, Akasa Air QP, or Emirates EK), enter your flight number (such as 2045 or 562), choose the departure date, and tap 'Track Flight'. TravelAdda immediately displays live flight status, departure and arrival terminals, boarding gates, baggage belt, and aircraft model.",
  },
  {
    question:
      "Are flight departure and arrival times shown in local airport time?",
    answer:
      "Yes. Following global aviation standards, departure times are displayed in the local timezone of the origin airport, and arrival times are displayed in the local timezone of the destination airport.",
  },
  {
    question:
      "Which departure date should I select for late-night or red-eye international flights?",
    answer:
      "Always select the calendar date on which the flight is scheduled to depart from its origin airport, as printed on your boarding pass or e-ticket. If your flight departed shortly before midnight, tap the 'Yesterday' quick pill.",
  },
  {
    question: "How early are airport terminal and boarding gate numbers updated?",
    answer:
      "Terminal assignments (such as Delhi T1/T2/T3 or Mumbai T1/T2) are published alongside the flight schedule. Specific boarding gates and arrival baggage belts are typically assigned by airport operations 60 to 120 minutes prior to departure or landing.",
  },
  {
    question:
      "What is the difference between Landed (On-Ground) and Arrived (In-Gate)?",
    answer:
      "On-Ground means the aircraft has touched down on the destination runway and is taxiing toward the terminal apron. In-Gate (Arrived) means the aircraft has parked at its assigned gate and passengers can disembark.",
  },
  {
    question:
      "Can I track both Indian domestic airlines and international carriers?",
    answer:
      "Yes! Our live airline search and flight status radar covers all major Indian carriers—IndiGo (6E), Air India (AI), Air India Express (IX), Akasa Air (QP), SpiceJet (SG), Alliance Air (9I), Star Air (S5)—as well as 500+ international airlines including Emirates (EK), Qatar Airways (QR), Etihad (EY), Singapore Airlines (SQ), British Airways (BA), and Lufthansa (LH).",
  },
  {
    question: "How do I know if my flight might be delayed before boarding?",
    answer:
      "Check both the 'Estimated' departure time and the 'Track Inbound Aircraft' button on the flight status card. If the incoming aircraft operating your flight is still airborne or delayed at its previous airport, you can spot potential turnaround delays early.",
  },
  {
    question:
      "How early should I reach the airport after checking my live flight status?",
    answer:
      "Even if a flight shows a minor estimated delay, airline check-in counters and bag-drop desks usually close strictly on scheduled time (45–60 minutes before domestic departure and 60–75 minutes before international departure). Report 2 hours prior for domestic flights and 3 hours prior for international flights.",
  },
];

function FlightTrackerSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-lg sm:p-6">
      <div className="grid animate-pulse gap-3.5 lg:grid-cols-4">
        <div className="h-14 rounded-2xl bg-subcard" />
        <div className="h-14 rounded-2xl bg-subcard" />
        <div className="h-14 rounded-2xl bg-subcard" />
        <div className="h-14 rounded-2xl bg-orange-500/25" />
      </div>
    </div>
  );
}

export default async function LiveFlightStatusPage() {
  "use cache";
  cacheLife("hours");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda Live Flight Status & Terminal Gate Tracker",
        url: "https://traveladda.in/air/flight-status",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description:
          "Track live domestic and international flight status by airline search, flight number, and departure date. View real-time departure and arrival terminals, gates, baggage belts, aircraft equipment, and airborne progress.",
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
            name: "Air Tools",
            item: "https://traveladda.in/tools/air",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Live Flight Status",
            item: "https://traveladda.in/air/flight-status",
          },
        ],
      },
      {
        "@type": "HowTo",
        name: "How to Check Live Flight Status by Airline and Flight Number",
        description:
          "Follow three quick steps to check live flight arrival, departure, terminal, gate, and baggage carousel status.",
        step: HOW_FLIGHT_TRACKING_WORKS.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.title,
          text: item.detail,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FLIGHT_STATUS_FAQS.map((faq) => ({
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
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* HERO & LIVE FLIGHT RADAR SECTION */}
      <section className="ta-hero relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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
            <Link
              href="/tools/air"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Air Tools
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-extrabold text-orange-700 dark:text-amber-300">
              Live Flight Status
            </span>
          </nav>

          {/* Header Copy */}
          <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3.5 py-1 text-xs font-extrabold text-orange-700 dark:text-amber-300">
                <LiveFlightBeaconIcon size="sm" active />
                <span>Real-Time Domestic &amp; Global Aviation Radar</span>
              </div>

              <h1 className="mt-4 text-3xl font-black leading-[1.14] tracking-tight text-ink sm:text-5xl">
                Live Flight Status,{" "}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-orange-300 dark:to-yellow-200">
                  Terminal &amp; Gate Tracker
                </span>
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                Search any domestic or international airline, enter your flight
                number and departure date, and track real-time takeoff, airborne
                progress, terminal &amp; boarding gates, baggage belts, and
                aircraft type.
              </p>
            </div>

            {/* Trust Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                <span>500+ Global Airlines</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/12 px-3 py-1.5 text-orange-800 dark:text-amber-300">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>Terminal · Gate · Belt</span>
              </span>
            </div>
          </div>

          {/* Interactive Client Flight Tracker */}
          <div className="mt-7">
            <Suspense fallback={<FlightTrackerSkeleton />}>
              <LiveFlightTracker />
            </Suspense>
          </div>
        </div>
      </section>

      {/* POPULAR LIVE FLIGHT ROUTES DIRECTORY (SEO INTERNAL LINKS) */}
      <section
        id="popular-flights"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              ONE-TAP FLIGHT TRACKING
            </span>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Popular Domestic &amp; International Flights Today
            </h2>
          </div>
          <p className="text-xs font-medium text-ink-muted sm:text-sm">
            Tap any flight below to load live departure, arrival &amp; terminal
            status
          </p>
        </div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_LIVE_FLIGHTS.map((flight) => (
            <Link
              key={`${flight.airlineCode}-${flight.flightNumber}`}
              href={`/air/flight-status?airline=${flight.airlineCode}&flight=${flight.flightNumber}`}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-orange-500/60 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <AirlineLogo
                    code={flight.airlineCode}
                    name={flight.airlineName}
                    size="md"
                  />
                  <div>
                    <span className="font-mono text-sm font-black text-orange-700 dark:text-amber-300">
                      {flight.airlineCode} {flight.flightNumber}
                    </span>
                    <p className="text-xs font-bold text-ink">
                      {flight.airlineName}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    flight.category === "Domestic"
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                      : "bg-amber-500/18 text-amber-900 dark:text-amber-300"
                  }`}
                >
                  {flight.category}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <div>
                  <p className="font-mono text-xs font-extrabold text-ink">
                    {flight.routeCodes}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {flight.routeCities}
                  </p>
                </div>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-subcard text-ink-soft transition group-hover:bg-orange-500 group-hover:text-white">
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR AIRLINES DIRECTORY WITH DAILY LOCAL ICONS */}
      <section
        id="airlines-directory"
        className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-line bg-card p-5 sm:p-8">
          <div className="max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              SUPPORTED CARRIERS &amp; HELPLINES
            </span>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Track Flights by Major Indian &amp; International Airlines
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Select an airline below to pre-fill its IATA carrier code in the
              flight tracker, or check official airline helpline numbers.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {POPULAR_AIRLINES.map((airline) => {
              const phone = airline.phoneFree || airline.phoneOther;
              return (
                <Link
                  key={airline.code}
                  href={`/air/flight-status?airline=${airline.code}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-subcard/60 p-3.5 transition hover:border-orange-500/60 hover:bg-subcard"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AirlineLogo
                      code={airline.code}
                      name={airline.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink group-hover:text-orange-700 dark:group-hover:text-amber-300">
                        {airline.name}
                      </p>
                      {phone ? (
                        <p className="mt-0.5 inline-flex items-center gap-1 truncate font-mono text-[11px] text-ink-muted">
                          <PhoneCallIcon className="h-2.5 w-2.5" />
                          <span>{phone}</span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          Live Status Ready
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border border-orange-500/30 bg-orange-500/14 px-2 py-1 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                    {airline.code}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 3-STEP AVIATION GUIDE */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
            FAST &amp; ACCURATE LOOKUP
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            How to Check Live Flight Running Status in 3 Steps
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOW_FLIGHT_TRACKING_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-3xl border border-line bg-card p-6 shadow-xs"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 font-mono text-sm font-black text-orange-700 dark:text-amber-300">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 AVIATION TELEMETRY CAPABILITIES */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
            AIRPORT &amp; AIRSPACE INTELLIGENCE
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Everything You Need Before Leaving for the Terminal
          </h2>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FLIGHT_TELEMETRY_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-3xl border border-line bg-card p-5 shadow-2xs sm:p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
                  {feat.icon}
                </span>
                <span className="rounded-full bg-subcard px-2.5 py-1 font-mono text-[10px] font-extrabold tracking-wider text-ink-muted">
                  {feat.badge}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-ink">
                {feat.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FLIGHT STATUS & GATE DECODER GLOSSARY */}
      <section
        id="flight-glossary"
        className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-line bg-card p-5 sm:p-8">
          <div className="flex items-center gap-2.5 text-orange-700 dark:text-amber-300">
            <ShieldCheckIcon className="h-5 w-5" />
            <span className="text-xs font-extrabold uppercase tracking-[0.18em]">
              AVIATION TERMINOLOGY DECODED
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Understanding Flight Status, Gate &amp; Runway Timestamps
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {AVIATION_STATUS_GLOSSARY.map((item) => (
              <div
                key={item.term}
                className="rounded-2xl border border-line bg-subcard/65 p-4 sm:p-5"
              >
                <h3 className="text-sm font-extrabold text-ink sm:text-base">
                  {item.term}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLIGHT STATUS & AVIATION EDITORIAL BLOG GUIDES (SEO TOPIC CLUSTER) */}
      <section
        id="flight-blog"
        className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              <BookOpenIcon className="h-4 w-4" />
              <span>AVIATION &amp; FLIGHT TRACKING GUIDES</span>
            </span>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Expert Guides for Smarter Airport &amp; Flight Journeys
            </h2>
          </div>
          <Link
            href="/blog#flight-guides"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-700 hover:underline dark:text-amber-300 sm:text-sm"
          >
            <span>Explore All Travel Guides</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FLIGHT_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-xs transition hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-md sm:p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-bold text-orange-800 dark:text-amber-300">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-ink-muted">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="mt-3.5 text-base font-extrabold leading-snug text-ink sm:text-lg">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5 text-xs">
                <span className="font-semibold text-ink-muted">
                  {post.author.name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-orange-600 hover:text-orange-800 dark:text-amber-300"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SEO FAQ ACCORDION */}
      <section
        id="faq"
        className="mx-auto mt-14 max-w-4xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-orange-700 dark:text-amber-300">
            <HelpCircleIcon className="h-5 w-5" />
            <span className="text-xs font-extrabold uppercase tracking-[0.18em]">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Live Flight Status, Terminals &amp; Delays — FAQs
          </h2>
        </div>

        <div className="mt-7 space-y-3">
          {FLIGHT_STATUS_FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-line bg-card p-4 transition open:border-orange-500/45 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-extrabold text-ink sm:text-base">
                <span>{faq.question}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180 group-open:text-orange-600" />
              </summary>
              <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* BOTTOM CROSS-TOOL CTA BANNER */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8">
        <div className="ta-cta-banner flex flex-col items-start justify-between gap-6 rounded-3xl p-6 sm:p-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-800 dark:text-amber-300">
              <PlaneIcon className="h-4 w-4" />
              <span>Complete Air &amp; Rail Companion</span>
            </span>
            <h2 className="mt-2 text-xl font-black text-ink sm:text-2xl">
              Check Cabin Baggage Rules or Connecting Train Status
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Verify airline-wise 7 kg cabin &amp; 15–30 kg check-in allowances,
              calculate airport arrival buffers, or track connecting Indian
              Railways trains live.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <Link
              href="/tools/air"
              className="ta-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold sm:flex-initial"
            >
              <LuggageIcon className="h-4 w-4" />
              <span>Baggage &amp; Buffer Tools</span>
            </Link>
            <Link
              href="/rail/live-status"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-card px-5 py-3 text-sm font-extrabold text-ink transition hover:border-orange-500 sm:flex-initial"
            >
              <TrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Live Train Radar</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

