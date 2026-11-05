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
    headerBg: "from-slate-950 via-indigo-950 to-blue-950",
    accentPill: "text-sky-300 bg-sky-500/20",
    description:
      "Elevated double-decker AC Chair Car views across Aravalli hills into Gandhinagar Jaipur.",
  },
  {
    routeCode: "CSMT → MAO",
    title: "Konkan Coastal & Ghat Vista",
    trainTag: "Vistadome Jan Shatabdi",
    bestSeat: "Vistadome EV · Rotatable Glass Seat",
    duration: "8h 40m Scenic",
    headerBg: "from-slate-950 via-teal-950 to-emerald-950",
    accentPill: "text-emerald-300 bg-emerald-500/20",
    description:
      "2,000+ bridges, emerald estuaries, and misty Sahyadri viaducts along India's western coast.",
  },
  {
    routeCode: "NDLS → SVDK",
    title: "Northern Foothills Vande Bharat",
    trainTag: "Vande Bharat Express",
    bestSeat: "Executive Chair Car (EC)",
    duration: "8h 00m Semi-High Speed",
    headerBg: "from-slate-950 via-violet-950 to-indigo-950",
    accentPill: "text-violet-300 bg-violet-500/20",
    description:
      "Aerodynamic reclining comfort from New Delhi straight into the Shivalik foothills.",
  },
  {
    routeCode: "KLK → SML",
    title: "UNESCO Himalayan Heritage Track",
    trainTag: "Shivalik Deluxe Express",
    bestSeat: "Right-Side Valley Window",
    duration: "4h 55m Mountain Gauge",
    headerBg: "from-slate-950 via-cyan-950 to-slate-900",
    accentPill: "text-cyan-300 bg-cyan-500/20",
    description:
      "102 historic mountain tunnels, deodar forests, and stone arch bridges climbing to 2,076m.",
  },
];

const PORTAL_HIGHLIGHTS = [
  {
    stat: "Real-Time",
    label: "Owned Rail PNR API",
    detail: "Direct server-to-server PRS lookup via /api/pnr",
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
      {/* High-Contrast Midnight Sapphire Hero Section */}
      <section className="bg-travel-grid relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-12 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_1fr] lg:px-8">
          {/* Left Hero Pitch */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-500/15 px-4 py-1.5 text-xs font-bold text-sky-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Air · Rail · Hotel Smart Travel Portal</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Every great journey starts with{" "}
              <span className="text-sky-400">complete clarity.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              Welcome to <strong className="font-bold text-white">TravelAdda</strong> —
              check live 10-digit Indian Railways PNR status, verify airline
              baggage &amp; airport buffers, and calculate hotel stay tariffs in
              one clean, modern portal.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400/30 transition hover:bg-indigo-500"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check Live PNR Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="#toolkit"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <span>Explore All Tools</span>
              </Link>
            </div>

            {/* Aligned SVG Feature Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/15 pt-6 text-xs font-semibold text-slate-200">
              <div className="inline-flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                <span>Live Coach &amp; Seat Numbers</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-sky-400" />
                <span>Charting Status Updates</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-teal-400" />
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
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4"
            >
              <p className="font-mono text-lg font-black text-slate-900 sm:text-xl">
                {item.stat}
              </p>
              <p className="mt-1 text-sm font-bold text-indigo-700">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">{item.detail}</p>
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
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              AIR · RAIL · HOTEL SUITE
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Precision tools for every stage of your trip.
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600">
            Navigate straight to any utility from the top menu dropdowns or
            launch our core travel tools below.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* RAIL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border-2 border-indigo-600/20 bg-white p-7 shadow-xl shadow-indigo-950/5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <TrainIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>FLAGSHIP LIVE</span>
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                Rail Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Real-time 10-digit Indian Railways PNR status via our owned
                API-to-API engine, coach &amp; berth decoders, and charting
                guides.
              </p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <li>
                  <Link
                    href="/rail/pnr-status"
                    className="group flex items-center justify-between font-bold text-slate-800 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <TicketIcon className="h-4 w-4 text-indigo-600" />
                      <span>Live PNR Status Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#decoder"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                      <span>Coach &amp; Berth Code Decoder</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rail/pnr-status#rail-blog"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <BookOpenIcon className="h-4 w-4 text-violet-600" />
                      <span>Rail Blog &amp; Charting Rules</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/rail/pnr-status"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-indigo-700"
            >
              <span>Open PNR Status Tool</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>

          {/* AIR CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <PlaneIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-900">
                  AVIATION
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                Air Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Compare cabin and check-in baggage allowances, compute airport
                reporting buffers, and prepare for smooth boarding.
              </p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <li>
                  <Link
                    href="/tools/air#baggage"
                    className="group flex items-center justify-between font-bold text-slate-800 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <LuggageIcon className="h-4 w-4 text-sky-600" />
                      <span>Baggage Allowance Checker</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#buffer"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-indigo-600" />
                      <span>Airport Arrival Buffer Planner</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/air#checklist"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-teal-600" />
                      <span>Boarding &amp; DigiYatra Checklist</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/tools/air"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-extrabold text-slate-900 transition hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span>Explore Air Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>

          {/* HOTEL CARD */}
          <article className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <HotelIcon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-extrabold text-teal-900">
                  STAYS
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-slate-900">
                Hotel Tools
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Calculate multi-night hotel bills with GST slabs, plan early
                train/flight check-ins, and verify guest ID rules.
              </p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <li>
                  <Link
                    href="/tools/hotel#gst-calculator"
                    className="group flex items-center justify-between font-bold text-slate-800 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CalculatorIcon className="h-4 w-4 text-teal-600" />
                      <span>Hotel Tariff &amp; GST Calculator</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#transit-planner"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <ClockIcon className="h-4 w-4 text-indigo-600" />
                      <span>Check-In &amp; Transit Stay Guide</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/hotel#stay-checklist"
                    className="group flex items-center justify-between font-semibold text-slate-700 hover:text-indigo-600"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                      <span>Guest ID &amp; Stay Essentials</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                  </Link>
                </li>
              </ul>
            </div>

            <Link
              href="/tools/hotel"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-extrabold text-slate-900 transition hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span>Explore Hotel Tools</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </article>
        </div>
      </section>

      {/* Scenic Indian Corridors (High-Contrast Deep Headers) */}
      <section
        id="corridors"
        className="scroll-mt-20 border-y border-slate-200 bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">
                ICONIC INDIAN JOURNEYS
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Routes worth booking a window seat for.
              </h2>
            </div>
            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>Already booked? Check your PNR</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCENIC_CORRIDORS.map((corridor) => (
              <div
                key={corridor.routeCode}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`bg-gradient-to-br ${corridor.headerBg} p-6 text-white`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono ${corridor.accentPill}`}
                    >
                      {corridor.routeCode}
                    </span>
                    <span className="text-slate-200">{corridor.duration}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold leading-snug text-white">
                    {corridor.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-xs text-slate-300">
                    {corridor.trainTag}
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between bg-white p-5">
                  <p className="text-xs leading-relaxed text-slate-600">
                    {corridor.description}
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Recommended Seat
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-900">
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
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">
              TRAVELADDA JOURNAL
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Smart guides for stress-free travel.
            </h2>
          </div>
          <Link
            href="/rail/pnr-status#rail-blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            <span>View all rail guides on PNR Hub</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {RAIL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-800">
                    {post.category}
                  </span>
                  <span className="font-medium text-slate-500">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="font-semibold text-slate-600">
                  {post.author.name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="bg-travel-grid relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-8 text-white sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-sky-500/20 px-3 py-1 text-xs font-bold text-sky-300 ring-1 ring-sky-400/30">
                INSTANT PNR VERIFICATION
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Holding an Indian Railways ticket right now?
              </h2>
              <p className="mt-2 text-sm text-slate-200 sm:text-base">
                Check live seat confirmation, charting status, and coach
                position in under a second using TravelAdda&apos;s PNR Status
                tool.
              </p>
            </div>
            <Link
              href="/rail/pnr-status"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg ring-1 ring-indigo-400/30 transition hover:bg-indigo-500"
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
