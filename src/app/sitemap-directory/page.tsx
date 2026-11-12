import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  ArrowRightIcon,
  MapPinIcon,
  PlaneIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import { POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";
import {
  buildAirlineCompensationPath,
  DGCA_AIRLINE_PROFILES,
} from "@/lib/dgca-compensation-types";
import {
  buildFlightStatusPath,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";
import {
  buildTrainLiveStatusPath,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";
import { getAllMetroLines } from "@/lib/metro-service";
import {
  buildMetroLinePath,
  buildMetroRoutePath,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";
import {
  buildRefundScenarioPath,
  REFUND_SEO_SCENARIOS,
} from "@/lib/rail-refund-service";
import {
  buildAllSitemapEntries,
  buildSegmentedSitemaps,
  SITEMAP_SEGMENTS,
} from "@/lib/sitemap-builder";
import {
  getAllCityCombinationGroups,
  getPopularTollRoutes,
} from "@/lib/toll-service";
import { TOOL_CATEGORIES } from "@/lib/tools-catalog";

export const metadata: Metadata = {
  title:
    "HTML Sitemap & Complete Travel Tools Directory (8,800+ Pages) | TravelAdda",
  description:
    "Complete HTML sitemap and crawl directory of TravelAdda's 8,800+ Indian travel tools: IRCTC Refund Calculators, 1,560 NHAI Highway Toll & Fuel Routes, Delhi NCR Metro Lines & Stations, Live Train Status, Chart Times, DGCA Flight Compensation & Travel Guides.",
  alternates: {
    canonical: "https://traveladda.in/sitemap-directory",
  },
};

export default async function HtmlSitemapDirectoryPage() {
  "use cache";
  cacheLife("days");

  const segments = buildSegmentedSitemaps();
  const totalUrls = buildAllSitemapEntries().length;
  const metroLines = getAllMetroLines();
  const popularTollRoutes = getPopularTollRoutes(30);
  const cityTollGroups = getAllCityCombinationGroups();

  return (
    <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
      {/* Navy Hero */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5"
            >
              <Link href="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                HTML Sitemap &amp; Directory
              </span>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300">
              {totalUrls.toLocaleString("en-IN")} Indexed Pages • Segmented XML + IndexNow Ready
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#fc6203]" />
              <span>
                Flights • Trains • IRCTC Refund • NHAI Highway Toll • Delhi NCR Metro • Guides
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              TravelAdda Complete HTML Sitemap &amp; SEO Directory
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              Central navigation hub for all{" "}
              <strong className="text-white">
                {totalUrls.toLocaleString("en-IN")} programmatic pages
              </strong>
              , segmented XML sitemaps, and interactive travel calculators across India.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-6 max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* 1. Segmented XML Sitemaps & IndexNow Feeds */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Search Engine &amp; AI Crawler Feeds
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-ink sm:text-xl">
                1. Segmented XML Sitemaps, Sitemap Index &amp; IndexNow API
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="/sitemaps/index.xml"
                className="rounded-lg bg-[#1956b4] px-3 py-1.5 font-bold text-white hover:bg-[#144696]"
              >
                Sitemap Index (/sitemaps/index.xml)
              </a>
              <a
                href="/sitemap.xml"
                className="rounded-lg border border-line bg-subcard px-3 py-1.5 font-bold text-ink hover:border-[#1956b4]"
              >
                Master Sitemap (/sitemap.xml)
              </a>
              <a
                href="/api/seo/indexnow"
                className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                IndexNow Status JSON
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SITEMAP_SEGMENTS.map((seg) => (
              <a
                key={seg.key}
                href={`/sitemaps/${seg.filename}`}
                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-4 transition hover:border-[#1956b4] hover:bg-card"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
                      /sitemaps/{seg.filename}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {segments[seg.key].length.toLocaleString("en-IN")} URLs
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-extrabold text-ink sm:text-sm">
                    {seg.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {seg.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 2. Core Interactive Tool Hubs */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <h2 className="mb-4 border-b border-line pb-3 text-base font-extrabold text-ink sm:text-xl">
            2. Core TravelAdda Tools (Flights, Trains, Metro &amp; Highways)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TOOL_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-line bg-subcard/40 p-4"
              >
                <h3 className="text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                  {cat.categoryTitle}
                </h3>
                <ul className="mt-3 space-y-2 text-xs">
                  {cat.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between font-bold text-ink hover:text-[#1956b4] hover:underline dark:hover:text-blue-300"
                      >
                        <span>{item.title}</span>
                        <ArrowRightIcon className="h-3 w-3 text-ink-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 3. All 29 IRCTC Train Ticket Cancellation & Refund Calculators */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <TicketIcon className="h-5 w-5 text-[#fc6203]" />
              3. IRCTC Ticket Cancellation &amp; Refund Calculators ({REFUND_SEO_SCENARIOS.length + 1} Pages)
            </h2>
            <Link
              href="/rail/refund-calculator"
              className="text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Open Main Refund Calculator →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {REFUND_SEO_SCENARIOS.map((sc) => (
              <Link
                key={sc.slug}
                href={buildRefundScenarioPath(sc.slug)}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">{sc.shortTitle}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. DGCA Flight Delay & Cancellation Compensation Pages + Live Flights */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <PlaneIcon className="h-5 w-5 text-[#1956b4]" />
              4. DGCA Flight Compensation &amp; Live Flight Status Pages
            </h2>
            <Link
              href="/air/flight-compensation"
              className="text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Open DGCA Compensation Hub →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {DGCA_AIRLINE_PROFILES.map((airline) => (
              <Link
                key={airline.slug}
                href={buildAirlineCompensationPath(airline.slug)}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {airline.name} ({airline.code}) Delay &amp; Refund
                </span>
              </Link>
            ))}
            {POPULAR_LIVE_FLIGHTS.map((flight) => (
              <Link
                key={`${flight.airlineCode}-${flight.flightNumber}`}
                href={buildFlightStatusPath(
                  flight.airlineCode,
                  flight.flightNumber,
                  flight.airlineName
                )}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {flight.airlineName} {flight.airlineCode}-{flight.flightNumber} Status
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. NHAI Highway Toll & Fuel Calculator Hubs (40 Cities x 39 = 1,560 Routes) */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <MapPinIcon className="h-5 w-5 text-emerald-600" />
              5. NHAI FASTag Highway Toll &amp; Fuel Corridors (1,560 City Combinations)
            </h2>
            <Link
              href="/toll-calculator"
              className="text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Open NHAI Toll Hub →
            </Link>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {popularTollRoutes.map((route) => (
              <Link
                key={route.routeSlug}
                href={route.routePath}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {route.fromName} to {route.toName} Toll (₹{route.carSingleTollInr})
                </span>
              </Link>
            ))}
          </div>

          <div className="border-t border-line pt-4">
            <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink-muted">
              All 40 Origin City Highway Hubs (Click to Browse All 39 Outbound Routes)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cityTollGroups.map((group) => (
                <Link
                  key={group.originCity.slug}
                  href={group.routes[0]?.routePath || "/toll-calculator"}
                  className="rounded-md border border-line bg-subcard/60 px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                >
                  {group.originCity.name} Toll Routes ({group.routes.length})
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Delhi NCR Metro Lines & Popular Routes + Indian Railways Live Trains */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <TrainIcon className="h-5 w-5 text-[#fc6203]" />
              6. Delhi NCR Metro Lines &amp; Indian Railways Live Train Pages
            </h2>
            <Link
              href="/delhi-metro"
              className="text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Open Delhi Metro Hub →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {metroLines.map((line) => (
              <Link
                key={line.slug}
                href={buildMetroLinePath(line.slug)}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {line.badge} ({line.totalStops} Stations)
                </span>
              </Link>
            ))}
            {POPULAR_METRO_ROUTES.slice(0, 12).map((r) => (
              <Link
                key={`${r.fromSlug}-${r.toSlug}`}
                href={buildMetroRoutePath(r.fromSlug, r.toSlug)}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {r.fromName} to {r.toName} Metro
                </span>
              </Link>
            ))}
            {POPULAR_LIVE_TRAINS.map((t) => (
              <Link
                key={`live-${t.trainNumber}`}
                href={buildTrainLiveStatusPath(t.trainNumber, t.trainName)}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {t.trainNumber} {t.trainName} Live Status
                </span>
              </Link>
            ))}
            {POPULAR_CHART_TRAINS.map((t) => (
              <Link
                key={`chart-${t.trainNumber}`}
                href={`/chart-times/${t.slug}`}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">
                  {t.trainNumber} {t.trainName} Chart Time
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. All Editorial Blog Guides */}
        <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-base font-extrabold text-ink sm:text-xl">
              7. All Editorial Travel, Aviation, Rail, Metro &amp; Highway Guides ({ALL_BLOG_POSTS.length} Articles)
            </h2>
            <Link
              href="/blog"
              className="text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              Open Blog Index →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex items-center gap-1.5 truncate rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">{post.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

