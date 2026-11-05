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
      <section className="border-b border-slate-200 bg-sky-50/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-16 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            <Link
              href="/"
              className="hover:text-indigo-600 dark:hover:text-white"
            >
              Home
            </Link>
            <span>/</span>
            <span className="font-bold text-indigo-700 dark:text-sky-300">
              Air Tools
            </span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/30">
              <PlaneIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-800 dark:text-sky-300">
              AVIATION UTILITY HUB
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Smart Air Travel &amp; Airport Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
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
