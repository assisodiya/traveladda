import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { HotelToolsClient } from "@/components/HotelToolsClient";

export const metadata: Metadata = {
  title: "Hotel Travel Tools | Room Tariff GST Calculator & Stay Planner",
  description:
    "Estimate Indian hotel tariffs with 0%, 12%, and 18% GST slabs, plan early rail/flight check-ins, and review guest ID guidelines on TravelAdda.",
};

export default async function HotelToolsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-16 sm:pb-24">
      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">Hotels &amp; GST Calculator</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hotel Room GST Calculator &amp; Stay Guide
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Calculate room tariffs across 0%, 12%, and 18% GST brackets, plan
              early train/flight check-ins, and verify Indian hotel ID rules.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-5xl px-4 sm:mt-8 sm:px-6 lg:px-8">
        <HotelToolsClient />
      </div>
    </main>
  );
}
