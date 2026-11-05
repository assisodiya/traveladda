import { cacheLife } from "next/cache";
import Link from "next/link";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";

const SCENIC_CORRIDORS = [
  {
    routeCode: "AWR → GADJ",
    title: "Rajasthan Double Decker Corridor",
    trainTag: "Double Decker Express",
    bestSeat: "Upper Deck CC · Window Side (WS)",
    duration: "2h 15m Express",
    routePill: "bg-teal-500/18 text-teal-800 dark:text-teal-300",
    description:
      "Elevated double-decker AC Chair Car views across Aravalli hills into Gandhinagar Jaipur.",
  },
  {
    routeCode: "CSMT → MAO",
    title: "Konkan Coastal & Ghat Vista",
    trainTag: "Vistadome Jan Shatabdi",
    bestSeat: "Vistadome EV · Rotatable Glass Seat",
    duration: "8h 40m Scenic",
    routePill: "bg-emerald-500/18 text-emerald-800 dark:text-emerald-300",
    description:
      "2,000+ bridges, emerald estuaries, and misty Sahyadri viaducts along India's western coast.",
  },
  {
    routeCode: "NDLS → SVDK",
    title: "Northern Foothills Vande Bharat",
    trainTag: "Vande Bharat Express",
    bestSeat: "Executive Chair Car (EC)",
    duration: "8h 00m Semi-High Speed",
    routePill: "bg-sky-500/18 text-sky-800 dark:text-sky-300",
    description:
      "Aerodynamic reclining comfort from New Delhi straight into the Shivalik foothills.",
  },
  {
    routeCode: "KLK → SML",
    title: "UNESCO Himalayan Heritage Track",
    trainTag: "Shivalik Deluxe Express",
    bestSeat: "Right-Side Valley Window",
    duration: "4h 55m Mountain Gauge",
    routePill: "bg-amber-500/18 text-amber-800 dark:text-amber-300",
    description:
      "102 historic mountain tunnels, deodar forests, and stone arch bridges climbing to 2,076m.",
  },
];

const PORTAL_HIGHLIGHTS = [
  {
    stat: "Real-Time",
    label: "Live Rail PNR Tracker",
    detail: "Instant seat, coach & chart confirmation status",
  },
  {
    stat: "17 Zones",
    label: "Pan-India Coverage",
    detail: "Works for IRCTC e-tickets & PRS counter slips",
  },
  {
    stat: "Air · Rail · Hotel",
    label: "Unified Travel Suite",
    detail: "PNR status, baggage rules & GST stay calculators",
  },
  {
    stat: "100% Clear",
    label: "Coach & Berth Decoder",
    detail: "Plain-English translation for CNF, RAC & WL",
  },
];

export default async function Home() {
  "use cache";
  cacheLife("hours");

  return (
    <main>
      {/* Smooth Hero Section */}
      <section className="ta-hero relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_1fr] lg:px-8">
          {/* Left Hero Pitch */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/25 bg-teal-500/12 px-4 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>Air · Rail · Hotel Smart Travel Portal</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Every great journey starts with{" "}
              <span className="text-teal-700 dark:text-teal-300">
                complete clarity.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Welcome to <strong className="font-bold text-ink">TravelAdda</strong>{" "}
              — check live 10-digit Indian Railways PNR status, verify airline
              baggage &amp; airport buffers, and calculate hotel stay tariffs in
              one smooth, modern portal.
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
                href="#toolkit"
                className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-card px-5 py-3.5 text-sm font-bold text-ink shadow-2xs transition hover:bg-subcard"
              >
                <span>Explore All Tools</span>
              </Link>
            </div>

            {/* Aligned SVG Feature Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-line pt-6 text-xs font-semibold text-ink-soft">
              <div className="inline-flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Live Coach &amp; Seat Numbers</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                <span>Charting Status Updates</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                <span>Expert Travel Guides</span>
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
              className="rounded-2xl border border-line bg-subcard p-4"
            >
              <p className="font-mono text-lg font-black text-ink sm:text-xl">
                {item.stat}
              </p>
              <p className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{item.detail}</p>
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
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              AIR · RAIL · HOTEL SUITE
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
          <article className="flex flex-col justify-between rounded-3xl border-2 border-teal-500/30 bg-card p-7 shadow-xl shadow-black/5 dark:shadow-black/30">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                  <TrainIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>FLAGSHIP LIVE</span>
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-ink">
                Rail Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Real-time 10-digit Indian Railways PNR status, coach &amp; berth
                decoders, and reservation charting guides.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <li>
                  <Link
                    href="/rail/pnr-status"
                    className="group flex items-center justify-between font-bold text-ink hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <TicketIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                      <span>Live PNR Status Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#decoder"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Coach &amp; Berth Code Decoder</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#rail-blog"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <BookOpenIcon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                      <span>Rail Blog &amp; Charting Rules</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/rail/pnr-status"
              className="ta-btn-primary mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold"
            >
              <span>Open PNR Status Tool</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>

          {/* AIR CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-line bg-card p-7 shadow-lg shadow-black/5 dark:shadow-black/25">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  <PlaneIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-extrabold text-sky-800 dark:text-sky-300">
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
                    className="group flex items-center justify-between font-bold text-ink hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <LuggageIcon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                      <span>Baggage Allowance Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#buffer"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                      <span>Airport Arrival Buffer Planner</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#checklist"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Boarding &amp; DigiYatra Checklist</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/tools/air"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-subcard px-5 py-3.5 text-sm font-extrabold text-ink transition hover:border-teal-500"
            >
              <span>Explore Air Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>

          {/* HOTEL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-line bg-card p-7 shadow-lg shadow-black/5 dark:shadow-black/25">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                  <HotelIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-extrabold text-teal-800 dark:text-teal-300">
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
                    className="group flex items-center justify-between font-bold text-ink hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CalculatorIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                      <span>Hotel Tariff &amp; GST Calculator</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#transit-planner"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                      <span>Check-In &amp; Transit Stay Guide</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#stay-checklist"
                    className="group flex items-center justify-between font-semibold text-ink-soft hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Guest ID &amp; Stay Essentials</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-300" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/tools/hotel"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-subcard px-5 py-3.5 text-sm font-extrabold text-ink transition hover:border-teal-500"
            >
              <span>Explore Hotel Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* Scenic Indian Corridors */}
      <section id="corridors" className="scroll-mt-20 border-y border-line bg-band py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                ICONIC INDIAN JOURNEYS
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Routes worth booking a window seat for.
              </h2>
            </div>
            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
            >
              <span>Already booked? Check your PNR</span>
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
                      className={`rounded-lg px-2.5 py-1 font-mono ${corridor.routePill}`}
                    >
                      {corridor.routeCode}
                    </span>
                    <span className="text-ink-muted">{corridor.duration}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold leading-snug text-ink">
                    {corridor.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-xs font-semibold text-ink-soft">
                    {corridor.trainTag}
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between bg-card p-5">
                  <p className="text-xs leading-relaxed text-ink-soft">
                    {corridor.description}
                  </p>
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Recommended Seat
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
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              TRAVELADDA JOURNAL
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Smart guides for stress-free travel.
            </h2>
          </div>
          <Link
            href="/rail/pnr-status#rail-blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
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
                  <span className="rounded-full bg-teal-500/15 px-3 py-1 font-bold text-teal-800 dark:text-teal-300">
                    {post.category}
                  </span>
                  <span className="font-medium text-ink-muted">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span className="font-semibold text-ink-muted">
                  {post.author.name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Smooth Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="ta-cta-banner relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/15 px-3 py-1 text-xs font-bold text-teal-800 dark:text-teal-200">
                INSTANT PNR VERIFICATION
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Holding an Indian Railways ticket right now?
              </h2>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">
                Check live seat confirmation, charting status, and coach
                position in under a second using TravelAdda&apos;s PNR Status
                tool.
              </p>
            </div>
            <Link
              href="/rail/pnr-status"
              className="ta-btn-primary inline-flex shrink-0 items-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Check PNR Status Now</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
