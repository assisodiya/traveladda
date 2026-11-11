import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  LuggageIcon,
  PhoneCallIcon,
  TrainIcon,
} from "@/components/Icons";
import { LiveFlightTracker } from "@/components/LiveFlightTracker";
import { FLIGHT_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildFlightStatusPath,
  POPULAR_AIRLINES,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";

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
    step: "1",
    title: "Select Airline",
    detail:
      "Search any airline name or 2-letter IATA code (IndiGo 6E, Air India AI, Akasa QP, Emirates EK) in the dropdown.",
  },
  {
    step: "2",
    title: "Enter Flight No. & Date",
    detail:
      "Type your 1 to 4-digit flight number (e.g. 2045 or 562) and select your origin airport departure date.",
  },
  {
    step: "3",
    title: "View Terminal, Gate & Belt",
    detail:
      "Check live departure & arrival times, terminal numbers, boarding gates, baggage belts, and inbound aircraft status.",
  },
];

const AVIATION_STATUS_GLOSSARY = [
  {
    term: "Scheduled vs Estimated Time",
    meaning:
      "Scheduled Time is the published timetable slot in local airport time. Estimated Time updates dynamically from ATC slots and airborne progress.",
  },
  {
    term: "Out-Gate & Off-Ground",
    meaning:
      "Out-Gate marks when cabin doors close and pushback starts. Off-Ground is the exact moment the aircraft takes off from the runway.",
  },
  {
    term: "On-Ground & In-Gate",
    meaning:
      "On-Ground records runway touchdown, while In-Gate marks when the aircraft parks at the arrival gate and doors open.",
  },
  {
    term: "Inbound Previous Aircraft",
    meaning:
      "Tracking the incoming plane operating your flight helps you spot knock-on turnaround delays early.",
  },
];

const FLIGHT_STATUS_FAQS = [
  {
    question:
      "How can I check live flight status by airline and flight number?",
    answer:
      "Select your airline from the Airline dropdown (such as IndiGo 6E, Air India AI, Air India Express IX, Akasa Air QP, or Emirates EK), enter your flight number (such as 2045 or 562), pick the departure date, and click 'Search Flight' to see real-time status, terminals, gates, and baggage belts.",
  },
  {
    question:
      "Are flight departure and arrival times shown in local airport time?",
    answer:
      "Yes. Departure times are shown in the origin airport's local timezone and arrival times are shown in the destination airport's local timezone.",
  },
  {
    question:
      "Which departure date should I select for late-night or red-eye flights?",
    answer:
      "Select the calendar date on which the flight is scheduled to depart from its origin airport, as printed on your ticket. For flights that departed just before midnight, select 'Yesterday'.",
  },
  {
    question: "How early are airport terminal and boarding gate numbers updated?",
    answer:
      "Terminal numbers (like Delhi T1/T2/T3 or Mumbai T1/T2) are available in advance with the schedule. Specific boarding gates and baggage claim belts are typically assigned 60 to 120 minutes before departure or landing.",
  },
  {
    question:
      "What is the difference between Landed (On-Ground) and Arrived (In-Gate)?",
    answer:
      "On-Ground means the aircraft has touched down on the runway and is taxiing. In-Gate (Arrived) means the aircraft has parked at its terminal gate.",
  },
  {
    question:
      "Can I track both Indian domestic airlines and international carriers?",
    answer:
      "Yes. Our airline search covers Indian carriers—IndiGo (6E), Air India (AI), Air India Express (IX), Akasa Air (QP), SpiceJet (SG), Alliance Air (9I), Star Air (S5)—plus 500+ international airlines including Emirates (EK), Qatar Airways (QR), Etihad (EY), Singapore Airlines (SQ), British Airways (BA), and Lufthansa (LH).",
  },
  {
    question: "How do I know if my flight might be delayed before boarding?",
    answer:
      "Check the 'Estimated' departure time and use the 'Track Inbound Plane' button when available to see if the incoming aircraft operating your sector is running on time.",
  },
  {
    question:
      "How early should I reach the airport after checking my live flight status?",
    answer:
      "Check-in counters and bag-drop desks close on original scheduled time (45–60 minutes before domestic flights and 60–75 minutes before international flights). Arrive 2 hours early for domestic and 3 hours early for international departures.",
  },
];

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
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* CLEAN GOIBIBO / IXIGO NAVY COMPACT HEADER */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-blue-200/80"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">Live Flight Status</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Live Flight Status, Terminal &amp; Gate Tracker
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs text-blue-100/85 sm:text-sm">
            Search any domestic or international airline, enter your flight
            number &amp; date, and check real-time arrival, departure, terminal,
            gate, and baggage belt status.
          </p>
        </div>
      </section>

      {/* OVERLAPPING CLEAN SEARCH & RESULT CONTAINER */}
      <section className="mx-auto -mt-8 max-w-5xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<FlightTrackerSkeleton />}>
          <LiveFlightTracker />
        </Suspense>
      </section>

      {/* POPULAR LIVE FLIGHTS DIRECTORY */}
      <section
        id="popular-flights"
        className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Popular Domestic &amp; International Flights
            </h2>
            <p className="text-xs text-ink-muted">
              Click any route to check live flight running status today
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_LIVE_FLIGHTS.map((flight) => (
            <Link
              key={`${flight.airlineCode}-${flight.flightNumber}`}
              href={buildFlightStatusPath(
                flight.airlineCode,
                flight.flightNumber,
                flight.airlineName
              )}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-3.5 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <AirlineLogo
                    code={flight.airlineCode}
                    name={flight.airlineName}
                    size="sm"
                  />
                  <div>
                    <p className="font-mono text-sm font-bold text-[#1956b4] dark:text-blue-300">
                      {flight.airlineCode} {flight.flightNumber}
                    </p>
                    <p className="text-xs font-medium text-ink-soft">
                      {flight.airlineName}
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted group-hover:text-[#1956b4]" />
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
                <span className="font-mono font-semibold text-ink">
                  {flight.routeCodes}
                </span>
                <span className="truncate text-[11px] text-ink-muted">
                  {flight.routeCities}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SUPPORTED AIRLINES & HELPLINES */}
      <section
        id="airlines-directory"
        className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Airlines &amp; Customer Care Helplines
          </h2>
          <p className="mt-1 text-xs text-ink-muted sm:text-sm">
            Select an airline below to pre-fill its carrier code in the tracker.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {POPULAR_AIRLINES.map((airline) => {
              const phone = airline.phoneFree || airline.phoneOther;
              return (
                <Link
                  key={airline.code}
                  href={`/air/flight-status?airline=${airline.code}`}
                  className="group flex items-center justify-between gap-2.5 rounded-xl border border-line bg-subcard/60 p-3 transition hover:border-[#1956b4] hover:bg-card"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <AirlineLogo
                      code={airline.code}
                      name={airline.name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                        {airline.name}
                      </p>
                      {phone && (
                        <p className="inline-flex items-center gap-1 truncate font-mono text-[11px] text-ink-muted">
                          <PhoneCallIcon className="h-2.5 w-2.5" />
                          <span>{phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {airline.code}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS + GLOSSARY IN CLEAN CARDS */}
      <section className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_FLIGHT_TRACKING_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-line bg-card p-5"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                {item.step}
              </span>
              <h3 className="mt-3 text-base font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div
          id="flight-glossary"
          className="mt-6 rounded-2xl border border-line bg-card p-5 sm:p-6"
        >
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Flight Status Terms Explained
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {AVIATION_STATUS_GLOSSARY.map((item) => (
              <div
                key={item.term}
                className="rounded-xl border border-line bg-subcard/60 p-4"
              >
                <h3 className="text-sm font-bold text-ink">{item.term}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLIGHT STATUS SEO BLOG GUIDES */}
      <section
        id="flight-blog"
        className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Flight Tracking &amp; Airport Terminal Guides
            </h2>
            <p className="text-xs text-ink-muted">
              Tips on terminal numbers, spotting delays early &amp; DGCA flyer
              rights
            </p>
          </div>
          <Link
            href="/blog#flight-guides"
            className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
          >
            All guides →
          </Link>
        </div>

        <div className="mt-4 grid gap-3.5 md:grid-cols-3">
          {FLIGHT_BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span className="font-semibold text-[#1956b4] dark:text-blue-300">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                  {post.excerpt}
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#fc6203]">
                <span>Read article</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CLEAN FAQ ACCORDION */}
      <section
        id="faq"
        className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 divide-y divide-line">
            {FLIGHT_STATUS_FAQS.map((faq) => (
              <details key={faq.question} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                  <span>{faq.question}</span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180 group-open:text-[#1956b4]" />
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SIMPLE RELATED TOOLS FOOTER CARD */}
      <section className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="ta-cta-banner flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">
              Need Baggage Limits or Connecting Train Status?
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Check 7 kg / 15 kg airline baggage rules or track connecting
              Indian Railways trains live.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/tools/air"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-card px-4 py-2.5 text-xs font-bold text-ink transition hover:border-[#1956b4]"
            >
              <LuggageIcon className="h-4 w-4 text-[#1956b4]" />
              <span>Baggage Rules</span>
            </Link>
            <Link
              href="/rail/live-status"
              className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold"
            >
              <TrainIcon className="h-4 w-4" />
              <span>Live Train Status</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
