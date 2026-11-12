import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "@/components/Icons";
import HighwayTollCalculator from "@/components/HighwayTollCalculator";
import {
  computeHighwayTollPlan,
  getAllIndexableTollRouteSlugs,
  getAllTollCities,
  getPopularTollRoutes,
} from "@/lib/toll-service";

export const metadata: Metadata = {
  title:
    "NHAI FASTag Toll & Fuel Cost Calculator India (2026) | Highway Toll Plaza Rates",
  description:
    "Calculate exact NHAI FASTag highway toll tax, plaza-by-plaza fares, 24-hour return discounts, and Petrol, Diesel, CNG & EV charging cost between 40+ Indian cities.",
  keywords: [
    "NHAI toll calculator",
    "FASTag toll calculator India",
    "highway toll tax and fuel calculator",
    "Delhi to Jaipur toll tax",
    "Delhi to Agra Yamuna Expressway toll",
    "Mumbai to Pune Expressway toll rate",
    "Samruddhi Mahamarg toll calculator",
    "Bengaluru to Mysuru Expressway toll",
    "toll plaza rate list 2026",
  ],
  alternates: {
    canonical: "https://traveladda.in/toll-calculator",
  },
  openGraph: {
    title:
      "NHAI FASTag Highway Toll & Fuel Cost Calculator India (2026) | TravelAdda",
    description:
      "Check plaza-by-plaza NHAI FASTag toll rates, 24-hour return savings, and Petrol/Diesel/CNG/EV fuel cost across India's National Highways & Expressways.",
    url: "https://traveladda.in/toll-calculator",
    type: "website",
  },
};

const TOLL_HUB_FAQS = [
  {
    question:
      "How does the NHAI 24-hour FASTag return journey discount work?",
    answer:
      "On most National Highways Authority of India (NHAI) toll plazas, if your vehicle crosses the same toll plaza on the return journey within 24 hours of the outward scan, FASTag automatically deducts only the balance amount required for a ~1.5x return pass instead of charging 2x (two full single fares), saving you roughly 25% on toll tax.",
  },
  {
    question:
      "Does the 24-hour return discount apply on Mumbai–Pune Expressway or Samruddhi Mahamarg?",
    answer:
      "No. State-operated closed-loop expressways like the Mumbai–Pune Yashwantrao Chavan Expressway (MSRDC) charge two full single trips (₹320 each way = ₹640 return for cars), whereas NHAI-operated highways like NH-48, NH-44, and NE-4 provide the 24-hour return concession.",
  },
  {
    question:
      "What happens if I enter a toll lane with a blacklisted or low-balance FASTag?",
    answer:
      "Under MoRTH and NHAI rules, any vehicle entering a dedicated FASTag lane without an active, KYV-verified FASTag with sufficient wallet balance is charged double (200%) the applicable user fee when paying in cash.",
  },
  {
    question:
      "How is the total road trip cost calculated for Petrol, Diesel, CNG, and Electric Vehicles (EV)?",
    answer:
      "TravelAdda combines the exact plaza-by-plaza FASTag toll tariff for your vehicle class (Car/SUV, LCV, Bus/Truck, or Multi-Axle) with origin-city retail fuel prices (₹/Litre for Petrol & Diesel, ₹/kg for CNG, and ₹/kWh for DC Fast Charging) divided by your vehicle's real-world highway mileage.",
  },
];

export default async function TollCalculatorHubPage() {
  "use cache";
  cacheLife("days");

  const cities = getAllTollCities();
  const initialPlan = computeHighwayTollPlan({
    fromSlug: "delhi",
    toSlug: "jaipur",
    vehicleCategory: "car",
    tripMode: "one-way",
    fuelType: "petrol",
    passengers: 4,
  });
  const popularRoutes = getPopularTollRoutes(30);
  const allIndexableRoutes = getAllIndexableTollRouteSlugs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TravelAdda NHAI FASTag Highway Toll & Fuel Cost Calculator",
        url: "https://traveladda.in/toll-calculator",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        description:
          "Plaza-by-plaza NHAI FASTag highway toll tax, 24-hour return discount, and Petrol, Diesel, CNG & EV road trip fuel cost calculator across India.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://traveladda.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Tools",
            item: "https://traveladda.in/tools",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "NHAI FASTag Toll & Fuel Calculator",
            item: "https://traveladda.in/toll-calculator",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: TOLL_HUB_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Deep Navy Hero Banner (Matches Delhi Metro & Home Page Design) */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
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
              <Link href="/tools" className="hover:text-white hover:underline">
                Tools
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                NHAI FASTag Toll &amp; Fuel Calculator
              </span>
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              40+ Cities • 52+ NHAI Toll Plazas • 158 Routes
            </span>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs sm:text-xs">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                <span>
                  NHAI TIS • Yamuna Expy • NE-4 Delhi–Mumbai • Samruddhi • MPEW
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                NHAI FASTag Highway Toll &amp; Fuel Cost Calculator
              </h1>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                Select your Origin and Destination city to dynamically calculate{" "}
                <strong className="text-white">plaza-by-plaza NHAI FASTag toll tax</strong>,{" "}
                <strong className="text-white">24-hour return concessions (-25%)</strong>,
                and{" "}
                <strong className="text-white">
                  Petrol, Diesel, CNG &amp; Electric EV charging costs
                </strong>{" "}
                with a live shareable Dynamic QR Trip Pass.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href="#popular-highway-routes"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                Popular Expressways
              </a>
              <a
                href="#all-toll-routes-directory"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                158 Route Directory
              </a>
              <a
                href="#fastag-toll-faqs"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
              >
                FASTag Rules
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container with Overlapping SSR Search Box & Results */}
      <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-8 px-3.5 sm:-mt-10 sm:space-y-10 sm:px-6 lg:px-8">
        <HighwayTollCalculator
          key="hub-delhi-jaipur"
          initialFromSlug="delhi"
          initialToSlug="jaipur"
          initialPlan={initialPlan}
          cities={cities}
          isDedicatedRoutePage={false}
        />

        {/* Popular City-to-City Highway Toll Directory Cards */}
        <section
          id="popular-highway-routes"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Top National Highway &amp; Expressway Corridors
              </span>
              <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
                <TicketIcon className="h-5 w-5 text-[#fc6203]" />
                Popular Indian Highway Toll &amp; Fuel Routes (2026)
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {allIndexableRoutes.length} Indexed Highway Corridors
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {popularRoutes.map((route) => (
              <Link
                key={route.routeSlug}
                href={route.routePath}
                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-4 transition hover:border-[#1956b4] hover:bg-card hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:bg-blue-950/60 dark:text-blue-300">
                      {route.distanceKm} km • {route.durationFormatted}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-muted">
                      {route.plazaCount} Toll {route.plazaCount === 1 ? "Plaza" : "Plazas"}
                    </span>
                  </div>

                  <h3 className="mt-2.5 flex items-center gap-1.5 text-sm font-extrabold text-ink group-hover:text-[#1956b4] sm:text-base dark:group-hover:text-blue-300">
                    <span>{route.fromName}</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted group-hover:translate-x-0.5 group-hover:text-[#1956b4]" />
                    <span>{route.toName}</span>
                  </h3>

                  <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
                    {route.highwaySummary}
                  </p>
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-ink-muted">
                      Car One-Way
                    </span>
                    <strong className="text-sm font-black text-ink">
                      ₹{route.carSingleTollInr}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-ink-muted">
                      24h Return
                    </span>
                    <strong className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      ₹{route.carReturn24hTollInr}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-ink-muted">
                      Petrol Est.
                    </span>
                    <strong className="text-sm font-black text-[#1956b4] dark:text-blue-300">
                      ₹{route.petrolOneWayCostInr}
                    </strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Complete SEO Directory of All City-to-City Toll Routes */}
        <section id="all-toll-routes-directory">
          <details className="group rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
                  <MapPinIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Complete A–Z City-to-City NHAI Toll &amp; Fuel Cost Directory ({allIndexableRoutes.length} Routes)
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Direct links to every forward and reverse intercity highway toll &amp; fuel
                  cost page across India.
                </p>
              </div>
              <span className="shrink-0 rounded-lg border border-line bg-subcard px-3 py-1.5 text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
                View All Routes
              </span>
            </summary>

            <div className="mt-5 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {allIndexableRoutes.map((item) => (
                <Link
                  key={item.routeSlug}
                  href={item.routePath}
                  className="flex items-center gap-1.5 truncate py-1 text-xs font-medium text-ink-soft hover:text-[#1956b4] hover:underline dark:hover:text-blue-300"
                >
                  <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                  <span className="truncate">
                    {item.fromName} to {item.toName} Toll &amp; Fuel
                  </span>
                </Link>
              ))}
            </div>
          </details>
        </section>

        {/* FAQ Section */}
        <section
          id="fastag-toll-faqs"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              NHAI &amp; MoRTH Tolling Rules
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <AlertCircleIcon className="h-5 w-5 text-[#fc6203]" />
              Frequently Asked Questions — NHAI FASTag &amp; Highway Toll Rules
            </h2>
          </div>

          <div className="grid gap-3.5 md:grid-cols-2">
            {TOLL_HUB_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-line bg-subcard/40 p-4"
              >
                <h3 className="text-sm font-extrabold text-ink">
                  {faq.question}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
