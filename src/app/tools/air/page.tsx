import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { AirToolsClient } from "@/components/AirToolsClient";
import { PlaneIcon } from "@/components/Icons";

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
      <section className="bg-travel-grid bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-sky-300">Air Tools</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30">
              <PlaneIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-300">
              AVIATION UTILITY HUB
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Smart Air Travel &amp; Airport Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Check cabin and check-in baggage limits, calculate terminal arrival
            buffers, and breeze through security with confidence.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <AirToolsClient />
      </div>
    </main>
  );
}

