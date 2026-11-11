import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  HotelIcon,
  PlaneIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "404 — Route or Gate Not Found | TravelAdda",
  description:
    "This flight, train, or metro route link went off-radar. Jump directly to Live Flight Status, Delhi NCR Metro Route Finder, Live Train Running Status, or 10-Digit IRCTC PNR Status on TravelAdda.",
  robots: {
    index: false,
    follow: true,
  },
};

const REROUTE_DESTINATIONS = [
  {
    title: "Live Flight Status Tracker",
    subtitle: "Search 500+ airlines, terminals, gates & baggage belts",
    badge: "AIR RADAR",
    badgeClass:
      "bg-blue-500/15 text-[#1956b4] border-blue-500/30 dark:text-blue-300",
    href: "/air/flight-status",
    icon: PlaneIcon,
  },
  {
    title: "Delhi NCR Metro Route Finder",
    subtitle: "12 lines, 262 stations, DMRC fares & interchange stops",
    badge: "METRO MAP",
    badgeClass:
      "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300",
    href: "/delhi-metro",
    icon: TrainIcon,
  },
  {
    title: "Spot Live Train Status",
    subtitle: "Real-time station location, delay & coach order from engine",
    badge: "LIVE RAIL",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
    href: "/rail/live-status",
    icon: TrainIcon,
  },
  {
    title: "10-Digit IRCTC PNR Status",
    subtitle: "Verify CNF / RAC / WL seat confirmation & chart status",
    badge: "PNR CHECK",
    badgeClass:
      "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300",
    href: "/rail/pnr-status",
    icon: TicketIcon,
  },
];

const QUICK_POPULAR_SHORTCUTS = [
  {
    label: "IndiGo 6E 1205 Flight Status",
    href: "/flight-status/indigo-6e-1205-flight-status",
  },
  {
    label: "Air India AI 101 Flight Status",
    href: "/flight-status/air-india-ai-101-flight-status",
  },
  {
    label: "MG Road → Anand Vihar Metro",
    href: "/delhi-metro/route/mg-road-to-anand-vihar",
  },
  {
    label: "New Delhi → IGI Airport Metro",
    href: "/delhi-metro/route/new-delhi-to-igi-airport",
  },
  {
    label: "Hauz Khas → Botanical Garden Metro",
    href: "/delhi-metro/route/hauz-khas-to-botanical-garden",
  },
  {
    label: "12952 Tejas Rajdhani Chart Time",
    href: "/chart-times/12952-mmct-tejas-raj-chart-times",
  },
  {
    label: "12952 Tejas Rajdhani Live Status",
    href: "/rail/live-status/12952-new-delhi-mumbai-central-tejas-rajdhani-express",
  },
  {
    label: "Hotel GST Calculator",
    href: "/tools/hotel",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-[82vh] bg-canvas pb-16 sm:pb-24">
      {/* Animated Radar & Departure Board Hero */}
      <section className="ta-navy-hero relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20">
        {/* Ambient glowing background orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1956b4]/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-8 bottom-0 h-56 w-56 rounded-full bg-[#fc6203]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Top ATC / Control Tower Alert Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-extrabold tracking-wider text-amber-300 uppercase backdrop-blur-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="ta-radar-ring absolute inline-flex h-full w-full rounded-full bg-[#fc6203] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#fc6203]" />
            </span>
            <span>ATC &amp; Rail Control • Gate / Platform Off-Radar</span>
          </div>

          {/* Animated 404 Split-Flap & Radar Centerpiece */}
          <div className="mt-6 flex items-center justify-center gap-3 sm:gap-6">
            {/* Left '4' Split-Flap Tile */}
            <div className="relative flex h-24 w-20 items-center justify-center rounded-2xl border border-white/20 bg-slate-900/80 font-mono text-5xl font-black text-white shadow-2xl backdrop-blur-xs sm:h-32 sm:w-28 sm:text-7xl">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] bg-white/15" />
              <span>4</span>
            </div>

            {/* Center '0' Animated Radar Scope with Floating Plane */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-emerald-400/50 bg-slate-950/90 shadow-[0_0_40px_rgba(16,185,129,0.25)] sm:h-36 sm:w-36">
              {/* Outer Radar Rings */}
              <span className="ta-radar-ring absolute inset-2 rounded-full border border-emerald-400/30" />
              <span className="ta-radar-ring-delay absolute inset-5 rounded-full border border-emerald-400/25" />
              <span className="absolute inset-8 rounded-full border border-dashed border-emerald-400/25" />

              {/* Crosshairs */}
              <span className="absolute inset-x-3 top-1/2 h-[1px] bg-emerald-400/20" />
              <span className="absolute inset-y-3 left-1/2 w-[1px] bg-emerald-400/20" />

              {/* Rotating Conic Radar Sweep */}
              <div
                aria-hidden="true"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg 260deg, rgba(16, 185, 129, 0.38) 360deg)",
                }}
                className="ta-404-radar-sweep absolute inset-1.5 rounded-full"
              />

              {/* Floating Aircraft in the Center */}
              <div className="ta-404-plane relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fc6203] to-amber-500 text-white shadow-lg sm:h-14 sm:w-14">
                <PlaneIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              {/* Blinking Radar Blip Dot */}
              <span className="ta-led-blink absolute top-5 right-6 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>

            {/* Right '4' Split-Flap Tile */}
            <div className="relative flex h-24 w-20 items-center justify-center rounded-2xl border border-white/20 bg-slate-900/80 font-mono text-5xl font-black text-white shadow-2xl backdrop-blur-xs sm:h-32 sm:w-28 sm:text-7xl">
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] bg-white/15" />
              <span>4</span>
            </div>
          </div>

          {/* Animated Metro / Express Train Gliding Along Track */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="flex items-center justify-between px-2 font-mono text-[10px] font-bold tracking-widest text-blue-200/80 uppercase">
              <span>DEL • NDLS</span>
              <span className="text-amber-300">SIGNAL REROUTING...</span>
              <span>BOM • ANVT</span>
            </div>
            <div className="relative mt-1.5 flex h-7 items-center overflow-hidden rounded-full border border-white/15 bg-slate-950/60 px-4">
              <div className="h-0.5 w-full border-t-2 border-dashed border-blue-400/40" />
              <div className="ta-404-train-glide absolute inset-x-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1956b4] px-3 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                  <TrainIcon className="h-3 w-3 text-amber-300" />
                  <span>EXPRESS REROUTE</span>
                </span>
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-4xl">
            Looks Like This Route Went Off-Radar!
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-200 sm:text-sm">
            The page, flight number, train, or metro station link you requested
            may have moved to a new terminal gate. Use the live travel tools
            below to get back on track in one click.
          </p>

          {/* Primary Hero CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="ta-btn-primary inline-flex items-center gap-2 rounded-xl bg-[#fc6203] px-5 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-[#e55800] sm:text-sm"
            >
              <span>Return to Home Terminal</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/delhi-metro"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-extrabold text-white backdrop-blur-xs transition hover:bg-white/20 sm:text-sm"
            >
              <TrainIcon className="h-4 w-4 text-amber-300" />
              <span>Delhi NCR Metro Finder</span>
            </Link>
            <Link
              href="/air/flight-status"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-extrabold text-white backdrop-blur-xs transition hover:bg-white/20 sm:text-sm"
            >
              <PlaneIcon className="h-4 w-4 text-sky-300" />
              <span>Track Live Flight</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Overlapping 4-Column Instant Reroute Cards */}
      <div className="mx-auto -mt-8 max-w-6xl space-y-6 px-4 sm:-mt-10 sm:space-y-8 sm:px-6 lg:px-8">
        <section
          aria-label="Instant Travel Tool Reroute"
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {REROUTE_DESTINATIONS.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-md transition hover:-translate-y-0.5 hover:border-[#1956b4] hover:shadow-lg sm:p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-subcard text-[#1956b4] transition group-hover:bg-[#1956b4] group-hover:text-white dark:text-blue-300">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-extrabold ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h2 className="mt-3.5 text-base font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
                  <span>Open Live Tool</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* Popular Direct Routes & Utility Shortcuts */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5">
            <div>
              <span className="text-[11px] font-extrabold tracking-wider text-[#fc6203] uppercase">
                Quick Boarding Gates
              </span>
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Popular Flight, Delhi Metro &amp; Train Status Shortcuts
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <Link
                href="/rail/chart-time"
                className="inline-flex items-center gap-1 text-[#1956b4] hover:underline dark:text-blue-300"
              >
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Train Chart Times</span>
              </Link>
              <Link
                href="/tools/hotel"
                className="inline-flex items-center gap-1 text-ink-soft hover:text-ink hover:underline"
              >
                <HotelIcon className="h-3.5 w-3.5" />
                <span>Hotel GST</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_POPULAR_SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="flex items-center justify-between gap-2 rounded-xl border border-line bg-subcard/45 px-3.5 py-2.5 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:bg-card hover:text-[#1956b4] dark:hover:text-blue-300"
              >
                <span className="truncate">{shortcut.label}</span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

