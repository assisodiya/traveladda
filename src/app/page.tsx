import { cacheLife } from "next/cache";
import Link from "next/link";
import { HeroSearchWidget } from "@/components/HeroSearchWidget";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";

const SCENIC_CORRIDORS = [
  {
    routeCode: "AWR → GADJ",
    title: "Rajasthan Double Decker Corridor",
    trainTag: "#12986 Double Decker Express",
    bestSeat: "Upper Deck CC · Window Side (WS)",
    duration: "2h 15m Express",
    gradient: "from-amber-500 via-orange-600 to-rose-700",
    description:
      "Elevated double-decker AC Chair Car views across Aravalli hills into Gandhinagar Jaipur.",
  },
  {
    routeCode: "CSMT → MAO",
    title: "Konkan Coastal & Ghat Vista",
    trainTag: "#12051 Vistadome Jan Shatabdi",
    bestSeat: "Vistadome EV · Rotatable Glass Seat",
    duration: "8h 40m Scenic",
    gradient: "from-teal-500 via-emerald-600 to-slate-900",
    description:
      "2,000+ bridges, emerald estuaries, and misty Sahyadri viaducts along India's western coast.",
  },
  {
    routeCode: "NDLS → SVDK",
    title: "Northern Foothills Vande Bharat",
    trainTag: "#22439 Vande Bharat Express",
    bestSeat: "Executive Chair Car (EC)",
    duration: "8h 00m Semi-High Speed",
    gradient: "from-indigo-500 via-blue-700 to-slate-900",
    description:
      "180°-capable aerodynamic comfort from New Delhi straight into the Shivalik foothills.",
  },
  {
    routeCode: "KLK → SML",
    title: "UNESCO Himalayan Heritage Track",
    trainTag: "#52451 Shivalik Deluxe",
    bestSeat: "Right-Side Valley Window",
    duration: "4h 55m Mountain Gauge",
    gradient: "from-emerald-600 via-cyan-700 to-indigo-950",
    description:
      "102 historic mountain tunnels, deodar forests, and stone arch bridges climbing to 2,076m.",
  },
];

const PORTAL_HIGHLIGHTS = [
  {
    stat: "< 250ms",
    label: "Owned API Response",
    detail: "Server-to-server PNR lookup via /api/pnr",
  },
  {
    stat: "17 Zones",
    label: "All CRIS PRS Hubs",
    detail: "Works for IRCTC e-tickets & counter slips",
  },
  {
    stat: "100% Decoded",
    label: "Coach, Berth & Quota",
    detail: "Plain-English translation for CNF, RAC & WL",
  },
  {
    stat: "Zero Clutter",
    label: "Built for Travellers",
    detail: "Fast boarding-pass layout on phone & desktop",
  },
];

export default async function Home() {
  "use cache";
  cacheLife("hours");

  return (
    <main>
      {/* Atmospheric Hero Section */}
      <section className="bg-travel-grid relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
        {/* Decorative Ambient Glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 right-1/4 size-96 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-10 size-80 rounded-full bg-teal-400/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.08fr_1fr] lg:px-8">
          {/* Left Editorial Pitch */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-orange-200 backdrop-blur-md">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <span>New: Owned Real-Time Indian Rail PNR Tool Live</span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Every great journey starts with{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                zero guesswork.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Welcome to <strong className="font-bold text-white">TravelAdda</strong> —
              your modern rail and flight travel portal. Track live 10-digit Indian
              Railways PNR status, decode coach &amp; berth positions, and read
              insider transit guides in one calm, beautifully crafted hub.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30 transition hover:from-orange-700 hover:to-amber-600"
              >
                <span>Launch PNR Status Tool</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/rail/pnr-status?pnr=2528012827"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                <span>Try Sample PNR 2528012827</span>
              </Link>
            </div>

            {/* Mini Live Ticket Strip */}
            <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                  ✓
                </span>
                <span>Live Coach &amp; Seat Numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-amber-500/20 text-amber-300">
                  ⚡
                </span>
                <span>Charting Status Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-teal-500/20 text-teal-300">
                  📖
                </span>
                <span>Expert Rail &amp; Air Guides</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Search Hub */}
          <div className="relative">
            <HeroSearchWidget />
          </div>
        </div>
      </section>

      {/* Metrics / Trust Ribbon */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {PORTAL_HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="font-mono text-xl font-black text-slate-900 sm:text-2xl">
                {item.stat}
              </p>
              <p className="mt-1 text-sm font-bold text-orange-600">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Travel Toolkit Showcase */}
      <section id="toolkit" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-600">
              THE TRAVELADDA SUITE
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Precision tools for tracks &amp; tarmac.
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600">
            Designed around the real questions travellers face before boarding —
            powered by clean APIs and instant visual decoders.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
          {/* Flagship Rail Toolkit Card */}
          <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold tracking-wider text-emerald-900">
                <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
                BY RAIL · FLAGSHIP LIVE TOOL
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">
                API v1 ACTIVE
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Indian Railways PNR Status &amp; Ticket Decoder
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Enter any 10-digit PNR to inspect real-time confirmation status,
              exact coach &amp; berth positions (like <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">C8U / 71 / Window Side</code>),
              chart preparation updates, and booking fare via TravelAdda&apos;s owned
              API engine.
            </p>

            {/* Sample Boarding Pass Preview */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-amber-300">
                  SAMPLE PNR: 252-801-2827
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-300">
                  ✓ CNF · C8U / 71 (Window Side)
                </span>
              </div>
              <p className="mt-2.5 text-sm font-bold">
                #12986 Delhi Sarai Rohilla – Jaipur Double Decker Express
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-300">
                <span>Alwar Jn (AWR) → Gandhinagar Jaipur (GADJ)</span>
                <span className="font-mono text-teal-300">AC Chair Car (CC)</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                <span>Open PNR Status Page</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/rail/pnr-status?pnr=2528012827"
                className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3.5 text-sm font-bold text-orange-800 transition hover:bg-orange-100"
              >
                <span>Run Live Demo Check</span>
              </Link>
            </div>
          </article>

          {/* Secondary Air & Rail Utility Stack */}
          <div className="flex flex-col gap-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-md shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold tracking-wider text-amber-900">
                  RAIL REFERENCE
                </span>
                <span className="text-2xl" aria-hidden="true">
                  🎫
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                Waitlist, Quota &amp; Coach Code Decoder
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Instantly compare GNWL, RLWL, PQWL &amp; TQWL confirmation priority,
                and translate cryptic railway codes like WS, SL, 3E, EC, and EV.
              </p>
              <Link
                href="/rail/pnr-status#decoder"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-600 hover:text-orange-700"
              >
                Explore Railway Code Matrix →
              </Link>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 p-7 shadow-md shadow-slate-900/5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-extrabold tracking-wider text-sky-900">
                  BY AIR · AVIATION DESK
                </span>
                <span className="text-2xl" aria-hidden="true">
                  ✈️
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                Flight Baggage &amp; Terminal Buffer Companion
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Quick domestic 7kg/15kg cabin &amp; check-in rules, DigiYatra gate
                checklists, and rail-to-airport transfer buffer planning.
              </p>
              <ul className="mt-4 space-y-2 border-t border-slate-200/70 pt-4 text-xs font-semibold text-slate-700">
                <li className="flex items-center justify-between">
                  <span>Cabin &amp; Check-in Allowance Quick View</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    In Hero Tab
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>IATA Airport Code &amp; Layover Calculator</span>
                  <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    Next Release
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Scenic Indian Corridors */}
      <section
        id="corridors"
        className="scroll-mt-20 border-y border-slate-200/80 bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700">
                ICONIC INDIAN JOURNEYS
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Routes worth booking a window seat for.
              </h2>
            </div>
            <Link
              href="/rail/pnr-status"
              className="text-sm font-bold text-orange-600 hover:text-orange-700"
            >
              Already booked? Check your PNR →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCENIC_CORRIDORS.map((corridor) => (
              <div
                key={corridor.routeCode}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#faf8f5] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`bg-gradient-to-br ${corridor.gradient} p-6 text-white`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="rounded-lg bg-black/25 px-2.5 py-1 font-mono backdrop-blur-xs">
                      {corridor.routeCode}
                    </span>
                    <span className="text-white/85">{corridor.duration}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-extrabold leading-snug">
                    {corridor.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-white/85">
                    {corridor.trainTag}
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="text-xs leading-relaxed text-slate-600">
                    {corridor.description}
                  </p>
                  <div className="mt-4 border-t border-slate-200/80 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended Seat
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800">
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
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-600">
              TRAVELADDA JOURNAL
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Smart guides for stress-free train travel.
            </h2>
          </div>
          <Link
            href="/rail/pnr-status#rail-blog"
            className="text-sm font-bold text-slate-900 underline decoration-orange-500 decoration-2 underline-offset-4 hover:text-orange-600"
          >
            View all rail guides on PNR Hub →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {RAIL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">
                    {post.category}
                  </span>
                  <span className="text-slate-400">{post.readTime}</span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-orange-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="font-semibold text-slate-500">
                  {post.author.name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-extrabold text-orange-600 hover:text-orange-700"
                >
                  Read Guide →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="bg-travel-grid relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-8 text-white sm:p-12">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-300">
                INSTANT PNR VERIFICATION
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                Holding an Indian Railways ticket right now?
              </h2>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Check live seat confirmation, charting status, and coach position in
                under a second using TravelAdda&apos;s dedicated PNR Status tool.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:from-orange-700 hover:to-amber-600"
              >
                <span>Check PNR Status Now</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
