import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { HotelToolsClient } from "@/components/HotelToolsClient";
import { HotelIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Hotel Travel Tools | Room Tariff GST Calculator & Stay Planner",
  description:
    "Estimate Indian hotel tariffs with 0%, 12%, and 18% GST slabs, plan early rail/flight check-ins, and review guest ID guidelines on TravelAdda.",
};

export default async function HotelToolsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-20">
      <section className="border-b border-slate-200 bg-teal-50/70 bg-gradient-to-br from-teal-50 via-white to-indigo-50 py-16 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-teal-950/75 dark:to-slate-900">
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
            <span className="font-bold text-teal-800 dark:text-teal-300">
              Hotel Tools
            </span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-400/30">
              <HotelIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">
              STAY &amp; HOSPITALITY HUB
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Hotel Budget &amp; Transit Stay Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
            Calculate room tariffs with GST slabs, coordinate early train or
            flight check-ins, and travel prepared.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6 lg:px-8">
        <HotelToolsClient />
      </div>
    </main>
  );
}
