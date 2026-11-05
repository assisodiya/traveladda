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
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";

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
    trainTag: "Vistadome Jan Shatabdi",
    bestSeat: "Vistadome EV · Rotatable Glass Seat",
    duration: "8h 40m Scenic",
    liveHref: "/rail/live-status",
    routePill: "bg-amber-500/20 text-amber-900 dark:text-amber-300",
    description:
      "2,000+ bridges, coastal estuaries, and misty Sahyadri viaducts along India's western coast.",
  },
  {
    routeCode: "NDLS → SVDK",
    title: "Northern Foothills Vande Bharat",
    trainTag: "Vande Bharat Express",
    bestSeat: "Executive Chair Car (EC)",
    duration: "8h 00m Semi-High Speed",
    liveHref: "/rail/live-status",
    routePill: "bg-yellow-500/20 text-amber-900 dark:text-yellow-300",
    description:
      "Aerodynamic reclining comfort from New Delhi straight into the Shivalik foothills.",
  },
  {
    routeCode: "KLK → SML",
    title: "UNESCO Himalayan Heritage Track",
    trainTag: "Shivalik Deluxe Express",
    bestSeat: "Right-Side Valley Window",
    duration: "4h 55m Mountain Gauge",
    liveHref: "/rail/live-status",
    routePill: "bg-rose-500/18 text-rose-800 dark:text-rose-300",
    description:
      "102 historic mountain tunnels, pine forests, and stone arch bridges climbing to 2,076m.",
  },
];

const PORTAL_HIGHLIGHTS = [
  {
    stat: "Live Radar",
    label: "PNR & Train Running",
    detail: "Spot live stations, delays, coach order & PNR seats",
    icon: <RadarLiveIcon className="h-5 w-5" />,
  },
  {
    stat: "17 Zones",
    label: "Pan-India Coverage",
    detail: "Works across Superfast, Vande Bharat & Express routes",
    icon: <CompassIcon className="h-5 w-5" />,
  },
  {
    stat: "Air · Rail · Hotel",
    label: "Unified Travel Suite",
    detail: "Live rail status, baggage rules & GST stay calculators",
    icon: <SparklesIcon className="h-5 w-5" />,
  },
  {
    stat: "100% Clear",
    label: "Coach & Rake Decoder",
    detail: "Visual coach order from engine + CNF/RAC/WL decoder",
    icon: <CoachTrainIcon className="h-5 w-5" />,
  },
];

export default async function Home() {
  "use cache";
  cacheLife("hours");

  return (
    <main>
      {/* Warm Sunset / Golden Hero Section */}
      <section className="ta-hero relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_1fr] lg:px-8">
          {/* Left Hero Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-4 py-1.5 text-xs font-bold text-orange-700 dark:text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Air · Rail · Hotel Smart Travel Portal</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Every great journey starts with{" "}
              <span className="text-orange-600 dark:text-amber-400">
                complete clarity.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Welcome to <strong className="font-bold text-ink">TravelAdda</strong>{" "}
              — check live 10-digit PNR status, track real-time train running
              status &amp; coach positions, verify flight baggage, and estimate
              hotel tariffs in one smooth portal.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/rail/pnr-status"
                className="ta-btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check Live PNR Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-card px-5 py-3.5 text-sm font-extrabold text-ink shadow-2xs transition hover:border-orange-500 hover:bg-subcard"
              >
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Track Live Train</span>
              </Link>
            </div>

            {/* Aligned SVG Feature Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-line pt-6 text-xs font-semibold text-ink-soft">
              <div className="inline-flex items-center gap-2">
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Live Train Station &amp; Delay</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <CoachTrainIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
                <span>Coach Rake &amp; Seat Numbers</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>1st &amp; 2nd Charting Updates</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Multi-Mode Widget */}
          <div>
            <HeroSearchWidget />
          </div>
        </div>
      </section>

      {/* Metrics / Trust Ribbon */}
      <section className="border-b border-line bg-band">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3.5 rounded-2xl border border-line bg-subcard p-4"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="font-mono text-base font-black text-ink sm:text-lg">
                  {item.stat}
                </p>
                <p className="mt-0.5 text-xs font-extrabold text-orange-600 dark:text-amber-400 sm:text-sm">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Air, Rail & Hotel Toolkit Showcase */}
      <section
        id="toolkit"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>AIR · RAIL · HOTEL SUITE</span>
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Precision tools for every stage of your trip.
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink-soft">
            Navigate straight to any utility from the top menu dropdowns or
            launch our core travel tools below.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* RAIL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border-2 border-orange-500/35 bg-card p-7 shadow-xl shadow-black/5 dark:shadow-black/30">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
                  <TrainIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/18 px-3 py-1 text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-orange-500 dark:bg-amber-400" />
                  <span>FLAGSHIP LIVE</span>
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                Rail Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Real-time 10-digit PNR status, live train running radar,
                engine-to-guard coach rake positions, and charting guides.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <li>
                  <Link
                    href="/rail/pnr-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <TicketIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                      <span>Live PNR Status Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600 dark:group-hover:text-amber-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/live-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <RadarLiveIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                      <span>Live Train Running Status</span>
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

            <div className="mt-7 grid grid-cols-2 gap-2.5">
              <Link
                href="/rail/pnr-status"
                className="ta-btn-primary inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-xs font-extrabold sm:text-sm"
              >
                <TicketIcon className="h-4 w-4" />
                <span>PNR Status</span>
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-line bg-subcard px-4 py-3.5 text-xs font-extrabold text-ink transition hover:border-orange-500 sm:text-sm"
              >
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Live Train</span>
              </Link>
            </div>
          </article>

          {/* AIR CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-line bg-card p-7 shadow-lg shadow-black/5 dark:shadow-black/25">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/18 text-amber-800 dark:text-amber-300">
                  <PlaneIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-amber-500/18 px-3 py-1 text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  AVIATION
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                Air Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Compare cabin and check-in baggage allowances, compute airport
                reporting buffers, and prepare for smooth boarding.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
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

            <Link
              href="/tools/air"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-subcard px-5 py-3.5 text-sm font-extrabold text-ink transition hover:border-orange-500"
            >
              <PlaneIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Explore Air Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>

          {/* HOTEL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-line bg-card p-7 shadow-lg shadow-black/5 dark:shadow-black/25">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/20 text-amber-900 dark:text-yellow-300">
                  <HotelIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-extrabold text-amber-900 dark:text-yellow-300">
                  STAYS
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                Hotel Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Calculate multi-night hotel bills with GST slabs, plan early
                train/flight check-ins, and verify guest ID rules.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
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
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-subcard px-5 py-3.5 text-sm font-extrabold text-ink transition hover:border-orange-500"
            >
              <HotelIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <span>Explore Hotel Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* Scenic Indian Corridors */}
      <section
        id="corridors"
        className="scroll-mt-20 border-y border-line bg-band py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
                <RouteTrackIcon className="h-3.5 w-3.5" />
                <span>ICONIC INDIAN JOURNEYS</span>
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Routes worth booking a window seat for.
              </h2>
            </div>
            <Link
              href="/rail/live-status"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200"
            >
              <RadarLiveIcon className="h-4 w-4" />
              <span>Spot live trains on any corridor</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCENIC_CORRIDORS.map((corridor) => (
              <div
                key={corridor.routeCode}
                className="flex flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="ta-ticket-header p-6">
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
                  <h3 className="mt-5 text-lg font-extrabold leading-snug text-ink">
                    {corridor.title}
                  </h3>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-soft">
                    <TrainIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                    <span>{corridor.trainTag}</span>
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between bg-card p-5">
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {corridor.description}
                  </p>
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      <BedIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                      <span>Recommended Seat</span>
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-ink">
                      {corridor.bestSeat}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel & Rail Editorial Blog Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
              <BookOpenIcon className="h-3.5 w-3.5" />
              <span>TRAVELADDA JOURNAL</span>
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Smart guides for stress-free travel.
            </h2>
          </div>
          <Link
            href="/rail/pnr-status#rail-blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200"
          >
            <span>View all rail guides on PNR Hub</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {RAIL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-muted">
                  <UserCheckIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>{post.author.name}</span>
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-orange-600 hover:text-orange-800 dark:text-amber-300 dark:hover:text-amber-200"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Warm Sunset / Golden Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="ta-cta-banner relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-800 dark:text-amber-200">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>LIVE INDIAN RAILWAYS SUITE</span>
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Travelling by train today?
              </h2>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">
                Verify your 10-digit PNR seat confirmation or spot your
                train&apos;s live station, platform number, and coach rake order
                in seconds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/rail/live-status"
                className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-card px-5 py-4 text-sm font-extrabold text-ink transition hover:border-orange-500"
              >
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Spot Live Train</span>
              </Link>
              <Link
                href="/rail/pnr-status"
                className="ta-btn-primary inline-flex shrink-0 items-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check PNR Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
