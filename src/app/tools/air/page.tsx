import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AirToolsClient } from "@/components/AirToolsClient";
import { ArrowRightIcon, PlaneIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Air Travel Tools | Baggage Allowance & Airport Buffer Calculator",
  description:
    "Check domestic & international flight baggage allowances, calculate ideal airport terminal arrival buffers, and review boarding checklists on TravelAdda.",
};

export default async function AirToolsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-16 sm:pb-24">
      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">Air Baggage &amp; Tools</span>
            </nav>

            <Link
              href="/air/flight-status"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
            >
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>Live Flight Status</span>
            </Link>
          </div>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Airline Baggage Allowance &amp; Airport Buffer Tools
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Check cabin and check-in baggage limits, calculate terminal arrival
              times, and review boarding rules before heading to the airport.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-5xl space-y-6 px-4 sm:mt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="text-base font-extrabold text-ink">
              Flying Today? Check Live Flight Status, Terminal &amp; Boarding Gate
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Search 500+ domestic &amp; international airlines by flight number
              and departure date.
            </p>
          </div>

          <Link
            href="/air/flight-status"
            className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold sm:text-sm"
          >
            <span>Check Flight Status</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <AirToolsClient />
      </div>
    </main>
  );
}
