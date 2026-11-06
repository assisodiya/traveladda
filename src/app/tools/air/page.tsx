import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AirToolsClient } from "@/components/AirToolsClient";
import {
  ArrowRightIcon,
  LiveFlightBeaconIcon,
  PlaneIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Air Travel Tools | Baggage Allowance & Airport Buffer Calculator",
  description:
    "Check domestic & international flight baggage allowances, calculate ideal airport terminal arrival buffers, and review boarding checklists on TravelAdda.",
};

export default async function AirToolsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-20">
      <section className="ta-hero py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-ink-soft"
          >
            <Link
              href="/"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-bold text-orange-700 dark:text-amber-300">
              Air Tools
            </span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-amber-300">
              <PlaneIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              AVIATION UTILITY HUB
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
            Smart Air Travel &amp; Airport Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Check cabin and check-in baggage limits, calculate terminal arrival
            buffers, and breeze through security with confidence.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="ta-live-cockpit flex flex-col justify-between gap-4 rounded-3xl p-5 shadow-xl sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-3.5">
            <LiveFlightBeaconIcon size="md" active />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                NEW · LIVE AVIATION TELEMETRY
              </span>
              <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">
                Track Live Flight Status, Terminal, Gate &amp; Baggage Belt
              </h2>
              <p className="text-xs text-stone-300 sm:text-sm">
                Search 500+ domestic &amp; global airlines with real-time takeoff,
                airborne progress &amp; gate updates.
              </p>
            </div>
          </div>

          <Link
            href="/air/flight-status"
            className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-extrabold sm:text-sm"
          >
            <span>Open Flight Tracker</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <AirToolsClient />
      </div>
    </main>
  );
}
