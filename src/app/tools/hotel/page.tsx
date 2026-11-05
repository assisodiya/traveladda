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
      <section className="bg-travel-grid bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-teal-300">Hotel Tools</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
              <HotelIcon className="h-5 w-5" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300">
              STAY &amp; HOSPITALITY HUB
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Hotel Budget &amp; Transit Stay Tools
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
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

