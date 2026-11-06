import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import {
  ArrowRightIcon,
  BedIcon,
  BookOpenIcon,
  CalculatorIcon,
  ClockIcon,
  CoachTrainIcon,
  CompassIcon,
  HotelIcon,
  LiveTrainBeaconIcon,
  LuggageIcon,
  MapPinIcon,
  PlaneIcon,
  RadarLiveIcon,
  RouteTrackIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
  UserCheckIcon,
} from "@/components/Icons";
import { FLIGHT_BLOG_POSTS, RAIL_BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title:
    "TravelAdda | Live Flight Status, Live Train Running Status, PNR & Hotel Tools",
  description:
    "Track live domestic & international flight status with terminals and gates, spot live Indian Railways train running status with blinking GPS radar, check 10-digit IRCTC PNR confirmation, and calculate hotel GST tariffs on TravelAdda.",
  alternates: {
    canonical: "/",
  },
};

const SCENIC_CORRIDORS = [
  {
    routeCode: "DEE → JP",
    title: "Rajasthan Double Decker Corridor",
    trainTag: "#12986 Double Decker Express",
    bestSeat: "Upper Deck CC · Window Side (WS)",
    duration: "4h 35m Superfast",
    liveHref: "/rail/live-status?train=12986",
    routePill: "bg-orange-500/18 text-orange-800 dark:text-orange-300",
    description:
      "Elevated double-decker AC Chair Car views across Gurgaon, Alwar & Aravalli hills into Jaipur Jn.",
  },
  {
    routeCode: "CSMT → MAO",
    title: "Konkan Coastal & Ghat Vista",
    trainTag: "#12051 Jan Shatabdi Express",
    bestSeat: "Vistadome EV · Rotatable Glass Seat",
    duration: "8h 40m Scenic",
    liveHref: "/rail/live-status?train=12051",
    routePill: "bg-amber-500/20 text-amber-900 dark:text-amber-300",
    description:
      "2,000+ bridges, coastal estuaries, and misty Sahyadri viaducts along India's western coast.",
  },
  {
    routeCode: "NDLS → SVDK",
    title: "Northern Foothills Vande Bharat",
    trainTag: "#22439 Vande Bharat Express",
    bestSeat: "Executive Chair Car (EC)",
    duration: "8h 00m Semi-High Speed",
    liveHref: "/rail/live-status?train=22439",
    routePill: "bg-yellow-500/20 text-amber-900 dark:text-yellow-300",
    description:
      "Aerodynamic reclining comfort from New Delhi straight into the Shivalik foothills.",
  },
  {
    routeCode: "NDLS → BSB",
    title: "Gangetic Plains High-Speed Link",
    trainTag: "#22436 Vande Bharat Express",
    bestSeat: "Executive Class · Panoramic Window",
    duration: "8h 00m Express",
    liveHref: "/rail/live-status?train=22436",
    routePill: "bg-rose-500/18 text-rose-800 dark:text-rose-300",
    description:
      "Flagship semi-high-speed run connecting New Delhi, Kanpur, Prayagraj & Varanasi Jn.",
  },
];

const PORTAL_HIGHLIGHTS = [
  {
    stat: "Live Radar",
    label: "Train & PNR Status",
    detail: "Blinking GPS station radar, delays & PNR seats",
    icon: <RadarLiveIcon className="h-5 w-5" />,
  },
  {
    stat: "17 Zones",
    label: "Pan-India Coverage",
    detail: "Vande Bharat, Rajdhani, Shatabdi & Mail routes",
    icon: <CompassIcon className="h-5 w-5" />,
  },
  {
    stat: "Air · Rail · Stay",
    label: "Unified Trip Suite",
    detail: "Live trains, baggage rules & GST calculators",
    icon: <SparklesIcon className="h-5 w-5" />,
  },
  {
    stat: "100% Clear",
    label: "Coach Rake Order",
    detail: "Engine-to-guard coach position + berth decoder",
    icon: <CoachTrainIcon className="h-5 w-5" />,
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
          "Smart Indian travel portal for Live Train Running Status, 10-Digit PNR Status, Flight Baggage Checkers, and Hotel GST Tariff Calculators.",
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Mobile-First Warm Sunset / Golden Hero Section */}
      <section className="ta-hero relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-7 px-4 py-8 sm:px-6 sm:py-14 md:py-20 lg:grid-cols-[1.06fr_1fr] lg:gap-12 lg:px-8">
          {/* Left Hero Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3.5 py-1 text-[11px] font-bold text-orange-700 dark:text-amber-300 sm:px-4 sm:py-1.5 sm:text-xs">
              <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
              <span>Air · Rail · Hotel Smart Travel Portal</span>
            </div>

            <h1 className="mt-4 text-[1.9rem] font-black leading-[1.13] tracking-tight text-ink sm:mt-6 sm:text-5xl lg:text-6xl">
              Every great journey starts with{" "}
              <span className="text-orange-600 dark:text-amber-400">
                complete clarity.
              </span>
            </h1>

            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-ink-soft sm:mt-5 sm:text-lg">
              Welcome to{" "}
              <strong className="font-bold text-ink">TravelAdda</strong> — spot
              live Indian Railways trains with a blinking GPS station radar,
              check 10-digit PNR seats, verify flight baggage, and estimate
              hotel tariffs in one mobile-first portal.
            </p>

            {/* Mobile-Friendly 2-Column CTA Grid on Phones, Inline on Desktop */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link
                href="/rail/live-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-extrabold sm:px-6 sm:text-sm"
              >
                <span className="ta-led-blink h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                <span>Track Live Train</span>
                <ArrowRightIcon className="hidden h-4 w-4 sm:inline" />
              </Link>
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-card px-4 py-3.5 text-xs font-extrabold text-ink shadow-2xs transition hover:border-orange-500 hover:bg-subcard sm:px-5 sm:text-sm"
              >
                <TicketIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Check PNR Status</span>
              </Link>
            </div>

            {/* Aligned SVG Feature Strip (Hidden excess clutter on tiny screens, clean wrap on sm+) */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[11px] font-semibold text-ink-soft sm:mt-9 sm:pt-6 sm:text-xs">
              <div className="inline-flex items-center gap-1.5">
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Live Train GPS &amp; Delay</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <CoachTrainIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                <span>Coach Rake &amp; Berth Order</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>1st &amp; 2nd Chart Updates</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Multi-Mode Widget */}
          <div>
            <HeroSearchWidget />
          </div>
        </div>
      </section>

      {/* Metrics / Trust Ribbon (Optimized 2x2 Mobile Card Grid) */}
      <section className="border-b border-line bg-band">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-3.5 py-6 sm:gap-5 sm:px-6 sm:py-8 md:grid-cols-4 lg:px-8">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-line bg-subcard p-3.5 sm:flex-row sm:gap-3.5 sm:p-4"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300 sm:h-10 sm:w-10">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-sm font-black text-ink sm:text-lg">
                  {item.stat}
                </p>
                <p className="mt-0.5 text-xs font-extrabold text-orange-600 dark:text-amber-400 sm:text-sm">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted sm:text-xs">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Live Train Radar Spotlight Strip on Home */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="ta-live-cockpit overflow-hidden rounded-3xl p-5 shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
              <LiveTrainBeaconIcon size="lg" active />
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/18 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>NEW · BLINKING LIVE TRAIN RADAR</span>
                </div>
                <h2 className="mt-2 text-lg font-black leading-snug text-white sm:text-2xl">
                  Spot Your Train Live with Real-Time Station &amp; Coach
                  Tracking
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/85 sm:text-sm">
                  See exact between-station progress, live speed in km/h,
                  platform numbers, and engine-to-guard coach positions on any
                  mobile screen.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/rail/live-status?train=12002"
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-extrabold text-white transition hover:border-amber-400"
              >
                <TrainIcon className="h-4 w-4 text-amber-300" />
                <span>Demo #12002 Live</span>
              </Link>
              <Link
                href="/rail/live-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold sm:text-sm"
              >
                <span>Open Live Train Tracker</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Air, Rail & Hotel Toolkit Showcase */}
      <section
        id="toolkit"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>AIR · RAIL · HOTEL SUITE</span>
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Precision tools for every stage of your trip.
            </h2>
          </div>
          <p className="max-w-md text-xs text-ink-soft sm:text-sm">
            Launch any travel utility below—optimized for fast mobile checks on
            the move.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-12 sm:gap-8 lg:grid-cols-3">
          {/* RAIL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border-2 border-orange-500/35 bg-card p-5 shadow-xl shadow-black/5 dark:shadow-black/30 sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-700 dark:text-amber-300 sm:h-12 sm:w-12">
                  <TrainIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
                  <span>FLAGSHIP LIVE</span>
                </span>
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-ink sm:mt-5 sm:text-2xl">
                Rail Tools
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                Blinking live train running radar, real-time 10-digit PNR
                status, engine-to-guard coach rake positions, and charting
                guides.
              </p>

              <ul className="mt-5 space-y-3 border-t border-line pt-4 text-sm sm:mt-6 sm:pt-5">
                <li>
                  <Link
                    href="/rail/live-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-300" />
                      <span>Live Train Running Status</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <TicketIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Live PNR Status Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#decoder"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CoachTrainIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                      <span>Coach &amp; Berth Code Decoder</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#rail-blog"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <BookOpenIcon className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                      <span>Rail Blog &amp; Charting Rules</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7">
              <Link
                href="/rail/live-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-1.5 rounded-2xl px-3.5 py-3.5 text-xs font-extrabold sm:text-sm"
              >
                <span className="ta-led-blink h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                <span>Live Train</span>
              </Link>
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-line bg-subcard px-3.5 py-3.5 text-xs font-extrabold text-ink transition hover:border-orange-500 sm:text-sm"
              >
                <TicketIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>PNR Status</span>
              </Link>
            </div>
          </article>

          {/* AIR CARD */}
          <article className="flex flex-col justify-between rounded-3xl border-2 border-amber-500/35 bg-card p-5 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/18 text-amber-800 dark:text-amber-300 sm:h-12 sm:w-12">
                  <PlaneIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
                  <span>LIVE RADAR</span>
                </span>
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-ink sm:mt-5 sm:text-2xl">
                Air Tools
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                Track live domestic &amp; global flight status, terminals, gates
                &amp; baggage belts, plus compare airline baggage allowances.
              </p>

              <ul className="mt-5 space-y-3 border-t border-line pt-4 text-sm sm:mt-6 sm:pt-5">
                <li>
                  <Link
                    href="/air/flight-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-300" />
                      <span>Live Flight Status Tracker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#baggage"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <LuggageIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                      <span>Baggage Allowance Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#buffer"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                      <span>Airport Arrival Buffer Planner</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#checklist"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ShieldCheckIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                      <span>Boarding &amp; DigiYatra Checklist</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7">
              <Link
                href="/air/flight-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-1.5 rounded-2xl px-3.5 py-3.5 text-xs font-extrabold sm:text-sm"
              >
                <span className="ta-led-blink h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                <span>Live Flight</span>
              </Link>
              <Link
                href="/tools/air"
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-line bg-subcard px-3.5 py-3.5 text-xs font-extrabold text-ink transition hover:border-orange-500 sm:text-sm"
              >
                <LuggageIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Baggage Tools</span>
              </Link>
            </div>
          </article>

          {/* HOTEL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-7">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/20 text-amber-900 dark:text-yellow-300 sm:h-12 sm:w-12">
                  <HotelIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-extrabold text-amber-900 dark:text-yellow-300">
                  STAYS
                </span>
              </div>

              <h3 className="mt-4 text-xl font-extrabold text-ink sm:mt-5 sm:text-2xl">
                Hotel Tools
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                Calculate multi-night hotel bills with GST slabs, plan early
                train/flight check-ins, and verify guest ID rules.
              </p>

              <ul className="mt-5 space-y-3 border-t border-line pt-4 text-sm sm:mt-6 sm:pt-5">
                <li>
                  <Link
                    href="/tools/hotel#gst-calculator"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CalculatorIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                      <span>Hotel Tariff &amp; GST Calculator</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#transit-planner"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                      <span>Check-In &amp; Transit Stay Guide</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#stay-checklist"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <MapPinIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                      <span>Guest ID &amp; Stay Essentials</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/tools/hotel"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-subcard px-5 py-3.5 text-sm font-extrabold text-ink transition hover:border-orange-500 sm:mt-7"
            >
              <HotelIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <span>Explore Hotel Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* Scenic Indian Corridors (Interactive Live Train Links) */}
      <section
        id="corridors"
        className="scroll-mt-20 border-y border-line bg-band py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
                <RouteTrackIcon className="h-3.5 w-3.5" />
                <span>ICONIC INDIAN JOURNEYS</span>
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Routes worth booking a window seat for.
              </h2>
            </div>
            <Link
              href="/rail/live-status"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200 sm:text-sm"
            >
              <RadarLiveIcon className="h-4 w-4" />
              <span>Spot live trains on any corridor</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {SCENIC_CORRIDORS.map((corridor) => (
              <Link
                key={corridor.routeCode}
                href={corridor.liveHref}
                className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-200 hover:-translate-y-1 hover:border-orange-500/45 hover:shadow-xl"
              >
                <div className="ta-ticket-header p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-mono ${corridor.routePill}`}
                    >
                      <RouteTrackIcon className="h-3.5 w-3.5" />
                      <span>{corridor.routeCode}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>{corridor.duration}</span>
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-extrabold leading-snug text-ink group-hover:text-orange-700 dark:group-hover:text-amber-300 sm:text-lg">
                    {corridor.title}
                  </h3>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft">
                    <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{corridor.trainTag}</span>
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between bg-card p-5">
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {corridor.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-2 border-t border-line pt-3">
                    <div>
                      <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        <BedIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                        <span>Best Seat</span>
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-ink">
                        {corridor.bestSeat}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-extrabold text-orange-600 dark:text-amber-300">
                      <span>Live</span>
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Travel & Rail Editorial Blog Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <BookOpenIcon className="h-3.5 w-3.5" />
              <span>TRAVELADDA JOURNAL</span>
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Smart guides for stress-free travel.
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200 sm:text-sm"
          >
            <span>View all flight &amp; rail guides</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...FLIGHT_BLOG_POSTS.slice(0, 2), ...RAIL_BLOG_POSTS.slice(0, 2)].map(
            (post) => (
              <article
                key={post.slug}
                className="flex flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-orange-500/15 px-3 py-1 font-bold text-orange-800 dark:text-amber-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-ink-muted">
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>
                  <h3 className="mt-3.5 text-base font-extrabold leading-snug text-ink sm:mt-4 sm:text-lg">
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

                <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5 text-xs sm:mt-6 sm:pt-4">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink-muted">
                    <UserCheckIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                    <span>{post.author.name}</span>
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-extrabold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    <span>Read</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* Warm Sunset / Golden Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="ta-cta-banner relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-800 dark:text-amber-200">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>LIVE INDIAN RAILWAYS SUITE</span>
              </span>
              <h2 className="mt-3 text-xl font-black tracking-tight text-ink sm:mt-4 sm:text-3xl">
                Travelling by train today?
              </h2>
              <p className="mt-1.5 text-xs text-ink-soft sm:mt-2 sm:text-base">
                Spot your train&apos;s blinking live GPS station, platform
                number, and coach rake order—or check your 10-digit PNR seat
                confirmation in seconds.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
              <Link
                href="/rail/live-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-xs font-extrabold sm:px-6 sm:py-4 sm:text-sm"
              >
                <span className="ta-led-blink h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                <span>Spot Live Train</span>
              </Link>
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-card px-4 py-3.5 text-xs font-extrabold text-ink transition hover:border-orange-500 sm:px-5 sm:py-4 sm:text-sm"
              >
                <TicketIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>PNR Status</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
