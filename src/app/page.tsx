import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AirlineLogo } from "@/components/AirlineLogo";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import {
  ArrowRightIcon,
  ClockIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { FLIGHT_BLOG_POSTS, RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { POPULAR_LIVE_FLIGHTS } from "@/lib/flight-types";
import { POPULAR_LIVE_TRAINS } from "@/lib/live-train-types";

export const metadata: Metadata = {
  title:
    "TravelAdda | Live Flight Status, Train Running Status, PNR & Hotel Tools",
  description:
    "Check live domestic & international flight status with terminal and gate updates, spot Indian Railways train running status live, check 10-digit IRCTC PNR confirmation, and calculate hotel GST tariffs.",
  alternates: {
    canonical: "/",
  },
};

const QUICK_SERVICES = [
  {
    title: "Live Flight Status",
    desc: "Real-time arrival, departure, terminal, gate & baggage belt",
    href: "/air/flight-status",
    badge: "LIVE",
    icon: <PlaneIcon className="h-5 w-5" />,
    iconClass: "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300",
  },
  {
    title: "Spot Your Train",
    desc: "Live station position, delay, platform & coach order",
    href: "/rail/live-status",
    badge: "LIVE",
    icon: <TrainIcon className="h-5 w-5" />,
    iconClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    title: "10-Digit PNR Status",
    desc: "Instant CNF, RAC, Waitlist & chart preparation updates",
    href: "/rail/pnr-status",
    icon: <TicketIcon className="h-5 w-5" />,
    iconClass:
      "bg-orange-50 text-[#fc6203] dark:bg-orange-500/15 dark:text-orange-300",
  },
  {
    title: "Baggage & Hotel GST",
    desc: "7 kg / 15 kg airline limits & room GST tax slabs",
    href: "/tools/air",
    icon: <LuggageIcon className="h-5 w-5" />,
    iconClass:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
];

export default async function Home() {
  "use cache";
  cacheLife("hours");

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "TravelAdda",
        url: "https://traveladda.in",
        description:
          "Clean, fast Indian travel portal for Live Flight Status, Live Train Running Status, 10-Digit PNR Status, Flight Baggage Checkers, and Hotel GST Calculators.",
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://traveladda.in/rail/live-status?train={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "TravelAdda",
        url: "https://traveladda.in",
      },
    ],
  };

  return (
    <main className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Goibibo / ixigo Style Clean Navy Top Search Banner */}
      <section className="ta-navy-hero pt-7 pb-14 sm:pt-10 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Live Flight Status, Train Running Status &amp; PNR Check
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-blue-100/85 sm:text-sm">
            Instant terminal &amp; gate updates for 500+ airlines, live Indian
            Railways GPS station tracking, and 10-digit PNR confirmation.
          </p>
        </div>
      </section>

      {/* Overlapping Unified White Search Card */}
      <section className="mx-auto -mt-9 max-w-5xl px-4 sm:-mt-12 sm:px-6 lg:px-8">
        <HeroSearchWidget />
      </section>

      {/* 4-Card Clean Utility Strip */}
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_SERVICES.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-start gap-3.5 rounded-xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] hover:shadow-md"
            >
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
              >
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                    {item.title}
                  </h2>
                  {item.badge && (
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Flights & Trains Two-Column Quick Status Directory */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Popular Live Flights Card */}
          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                  <PlaneIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink sm:text-lg">
                    Popular Flight Status Checks
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Tap any flight for terminal, gate &amp; live arrival
                  </p>
                </div>
              </div>
              <Link
                href="/air/flight-status"
                className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
              >
                Search all →
              </Link>
            </div>

            <div className="mt-3 divide-y divide-line">
              {POPULAR_LIVE_FLIGHTS.slice(0, 5).map((f) => (
                <Link
                  key={`${f.airlineCode}-${f.flightNumber}`}
                  href={`/air/flight-status?airline=${f.airlineCode}&flight=${f.flightNumber}`}
                  className="group flex items-center justify-between gap-3 py-3 transition hover:bg-subcard/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <AirlineLogo
                      code={f.airlineCode}
                      name={f.airlineName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                        {f.airlineName}{" "}
                        <span className="font-mono text-[#1956b4] dark:text-blue-300">
                          {f.airlineCode} {f.flightNumber}
                        </span>
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {f.routeCities}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded bg-subcard px-2 py-1 font-mono text-xs font-semibold text-ink-soft">
                      {f.routeCodes}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted group-hover:text-[#1956b4]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Live Trains Card */}
          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <TrainIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink sm:text-lg">
                    Popular Live Train Running Status
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Live GPS station, platform &amp; coach position
                  </p>
                </div>
              </div>
              <Link
                href="/rail/live-status"
                className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
              >
                Spot all →
              </Link>
            </div>

            <div className="mt-3 divide-y divide-line">
              {POPULAR_LIVE_TRAINS.slice(0, 5).map((t) => (
                <Link
                  key={t.trainNumber}
                  href={`/rail/live-status?train=${t.trainNumber}`}
                  className="group flex items-center justify-between gap-3 py-3 transition hover:bg-subcard/60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {t.trainNumber}
                      </span>
                      <p className="truncate text-sm font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                        {t.trainName}
                      </p>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">{t.type}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded bg-subcard px-2 py-1 font-mono text-xs font-semibold text-ink-soft">
                      {t.sourceCode} → {t.destinationCode}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted group-hover:text-[#1956b4]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clean Travel Tools Row (Air Baggage + Hotel GST + PNR Decoder) */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/rail/pnr-status"
            className="flex items-center justify-between rounded-xl border border-line bg-card p-5 transition hover:border-[#1956b4]"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#fc6203]">
                IRCTC UTILITY
              </span>
              <h3 className="text-base font-bold text-ink">
                Check 10-Digit PNR &amp; Chart
              </h3>
              <p className="text-xs text-ink-muted">
                Verify CNF, RAC, GNWL &amp; coach berth codes
              </p>
            </div>
            <TicketIcon className="h-7 w-7 shrink-0 text-[#1956b4]" />
          </Link>

          <Link
            href="/tools/air"
            className="flex items-center justify-between rounded-xl border border-line bg-card p-5 transition hover:border-[#1956b4]"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#1956b4] dark:text-blue-300">
                AIRPORT GUIDE
              </span>
              <h3 className="text-base font-bold text-ink">
                Airline Baggage &amp; Arrival Buffer
              </h3>
              <p className="text-xs text-ink-muted">
                Cabin 7 kg &amp; check-in weight limits by carrier
              </p>
            </div>
            <LuggageIcon className="h-7 w-7 shrink-0 text-[#1956b4]" />
          </Link>

          <Link
            href="/tools/hotel"
            className="flex items-center justify-between rounded-xl border border-line bg-card p-5 transition hover:border-[#1956b4]"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                STAY PLANNER
              </span>
              <h3 className="text-base font-bold text-ink">
                Hotel Tariff &amp; GST Calculator
              </h3>
              <p className="text-xs text-ink-muted">
                Instant 0%, 12% &amp; 18% hotel GST breakdown
              </p>
            </div>
            <HotelIcon className="h-7 w-7 shrink-0 text-[#1956b4]" />
          </Link>
        </div>
      </section>

      {/* Clean Travel Guides Section */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-2xl">
              Helpful Flight &amp; Train Guides
            </h2>
            <p className="text-xs text-ink-muted sm:text-sm">
              Clear answers on airport terminals, flight delays, PNR quotas &amp;
              charting
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300 sm:text-sm"
          >
            View all →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...FLIGHT_BLOG_POSTS.slice(0, 2), ...RAIL_BLOG_POSTS.slice(0, 2)].map(
            (post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm sm:p-5"
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
                  <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300 sm:text-base">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {post.excerpt}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#fc6203]">
                  <span>Read guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            )
          )}
        </div>
      </section>
    </main>
  );
}
