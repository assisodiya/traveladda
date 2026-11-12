import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SwapIcon,
} from "@/components/Icons";
import HighwayTollCalculator from "@/components/HighwayTollCalculator";
import { TOLL_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildTollRoutePath,
  computeHighwayTollPlan,
  getAllIndexableTollRouteSlugs,
  getAllTollCities,
  parseTollRouteSlug,
} from "@/lib/toll-service";

interface RoutePageProps {
  params: Promise<{ routeSlug: string }>;
}

export async function generateStaticParams() {
  const routes = getAllIndexableTollRouteSlugs().slice(0, 30);
  return routes.map((r) => ({
    routeSlug: r.routeSlug,
  }));
}

export async function generateMetadata({
  params,
}: RoutePageProps): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const parsed = parseTollRouteSlug(routeSlug);
  if (!parsed) {
    return {
      title: "Highway Toll & Fuel Calculator | TravelAdda",
    };
  }

  const plan = computeHighwayTollPlan({
    fromSlug: parsed.fromCity.slug,
    toSlug: parsed.toCity.slug,
    vehicleCategory: "car",
    tripMode: "one-way",
    fuelType: "petrol",
  });

  if (!plan) {
    return {
      title: "Highway Toll & Fuel Calculator | TravelAdda",
    };
  }

  const canonicalUrl = `https://traveladda.in${plan.routePath}`;
  const title = `${plan.fromCity.name} to ${plan.toCity.name} Toll Tax (₹${plan.oneWayCarTollInr}), FASTag Plaza List & Fuel Cost (2026)`;
  const description = `Driving from ${plan.fromCity.name} to ${plan.toCity.name} (${plan.oneWayDistanceKm} km via ${plan.highwaySummary})? One-way Car FASTag toll is ₹${plan.oneWayCarTollInr} (24h Return: ₹${plan.return24hCarTollInr}) across ${plan.plazaCount || "NHAI"} toll plazas. Check Petrol, Diesel, CNG & EV trip cost.`;

  return {
    title,
    description,
    keywords: [
      `${plan.fromCity.name} to ${plan.toCity.name} toll tax`,
      `${plan.fromCity.name} to ${plan.toCity.name} FASTag toll rate`,
      `${plan.fromCity.name} to ${plan.toCity.name} road trip fuel cost`,
      `${plan.fromCity.name} to ${plan.toCity.name} toll plazas list`,
      `${plan.fromCity.name} to ${plan.toCity.name} distance and toll`,
      `${plan.highwaySummary} toll rate 2026`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function TollRouteDetailPage({ params }: RoutePageProps) {
  "use cache";
  cacheLife("days");

  const { routeSlug } = await params;
  const parsed = parseTollRouteSlug(routeSlug);
  if (!parsed) {
    notFound();
  }

  const cities = getAllTollCities();
  const plan = computeHighwayTollPlan({
    fromSlug: parsed.fromCity.slug,
    toSlug: parsed.toCity.slug,
    vehicleCategory: "car",
    tripMode: "one-way",
    fuelType: "petrol",
    passengers: 4,
  });

  if (!plan) {
    notFound();
  }

  const reverseRoutePath = buildTollRoutePath(
    plan.toCity.slug,
    plan.fromCity.slug
  );

  const allRoutes = getAllIndexableTollRouteSlugs();
  const outboundFromOrigin = allRoutes.filter(
    (r) => r.fromSlug === plan.fromCity.slug && r.routeSlug !== plan.routeSlug
  );
  const outboundFromDestination = allRoutes.filter(
    (r) => r.fromSlug === plan.toCity.slug && r.routeSlug !== plan.routeSlug
  );

  const routeCombinationKeywords = [
    `${plan.fromCity.name} to ${plan.toCity.name} toll tax 2026`,
    `${plan.fromCity.name} to ${plan.toCity.name} FASTag toll rate`,
    `${plan.fromCity.name} to ${plan.toCity.name} car toll ₹${plan.oneWayCarTollInr}`,
    `${plan.fromCity.name} to ${plan.toCity.name} 24 hour return toll ₹${plan.return24hCarTollInr}`,
    `${plan.fromCity.name} to ${plan.toCity.name} LCV bus truck toll tax`,
    `${plan.fromCity.name} to ${plan.toCity.name} petrol cost`,
    `${plan.fromCity.name} to ${plan.toCity.name} diesel cost`,
    `${plan.fromCity.name} to ${plan.toCity.name} CNG cost`,
    `${plan.fromCity.name} to ${plan.toCity.name} electric EV charging cost`,
    `${plan.fromCity.name} to ${plan.toCity.name} ${plan.oneWayDistanceKm} km road trip budget`,
    `${plan.toCity.name} to ${plan.fromCity.name} return toll tax`,
    ...plan.plazas.map(
      (s) => `${s.plaza.name} FASTag rate (₹${s.plaza.carSingle})`
    ),
  ];

  const dynamicFaqs = [
    {
      question: `How much is the FASTag toll tax from ${plan.fromCity.name} to ${plan.toCity.name} for a Car in 2026?`,
      answer: `The one-way NHAI FASTag toll tax for a Car / Jeep / SUV from ${plan.fromCity.name} to ${plan.toCity.name} (${plan.oneWayDistanceKm} km via ${plan.highwaySummary}) is ₹${plan.oneWayCarTollInr}. If you return within 24 hours across the same toll plazas, the discounted 24-hour return FASTag fare is ₹${plan.return24hCarTollInr} (saving ₹${plan.fastag24hSavingsInr}).`,
    },
    {
      question: `How many toll plazas are between ${plan.fromCity.name} and ${plan.toCity.name}?`,
      answer:
        plan.plazas.length > 0
          ? `There are ${plan.plazaCount} major toll plazas on the ${plan.fromCity.name} to ${plan.toCity.name} corridor (${plan.highwaySummary}): ${plan.plazas
              .map((p) => `${p.plaza.name} (₹${p.plaza.carSingle})`)
              .join(", ")}.`
          : `The ${plan.oneWayDistanceKm} km highway journey from ${plan.fromCity.name} to ${plan.toCity.name} uses standard NHAI national highway tolling with an estimated one-way car toll of ₹${plan.oneWayCarTollInr}.`,
    },
    {
      question: `What is the total Petrol, Diesel, CNG, and EV cost from ${plan.fromCity.name} to ${plan.toCity.name}?`,
      answer: `For the ${plan.oneWayDistanceKm} km one-way drive from ${plan.fromCity.name} to ${plan.toCity.name}, combined fuel + FASTag toll cost is approximately: ${plan.fuelComparisons
        .map(
          (fc) =>
            `${fc.label}: ₹${fc.totalWithTollInr} (Fuel ₹${fc.fuelCostInr} + Toll ₹${plan.oneWayCarTollInr})`
        )
        .join("; ")}.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `${plan.fromCity.name} to ${plan.toCity.name} NHAI FASTag Toll & Fuel Calculator`,
        url: `https://traveladda.in${plan.routePath}`,
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        description: `Calculate NHAI FASTag toll tax (₹${plan.oneWayCarTollInr} one-way, ₹${plan.return24hCarTollInr} 24h return) and fuel cost from ${plan.fromCity.name} to ${plan.toCity.name}.`,
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
            name: "NHAI Toll Calculator",
            item: "https://traveladda.in/toll-calculator",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${plan.fromCity.name} to ${plan.toCity.name} Toll & Fuel Cost`,
            item: `https://traveladda.in${plan.routePath}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: dynamicFaqs.map((faq) => ({
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

      {/* Deep Navy Route Hero Banner */}
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
              <Link
                href="/toll-calculator"
                className="hover:text-white hover:underline"
              >
                NHAI Toll Calculator
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {plan.fromCity.name} to {plan.toCity.name} Toll &amp; Fuel
              </span>
            </nav>

            <Link
              href={reverseRoutePath}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-white/20"
            >
              <SwapIcon className="h-3.5 w-3.5 text-[#fc6203]" />
              <span>
                Return: {plan.toCity.name} to {plan.fromCity.name} Toll
              </span>
            </Link>
          </div>

          <div className="mt-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs sm:text-xs">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#fc6203]" />
              <span>
                {plan.highwaySummary} • {plan.oneWayDistanceKm} km (
                {plan.durationFormatted})
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {plan.fromCity.name} to {plan.toCity.name} Toll Tax (₹
              {plan.oneWayCarTollInr}) &amp; Fuel Cost
            </h1>

            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              Complete 2026 NHAI FASTag toll plaza rate table for driving from{" "}
              <strong className="text-white">
                {plan.fromCity.name} ({plan.fromCity.state})
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {plan.toCity.name} ({plan.toCity.state})
              </strong>
              . One-way Car FASTag toll is{" "}
              <strong className="text-emerald-300">
                ₹{plan.oneWayCarTollInr}
              </strong>
              , 24-hour return pass is{" "}
              <strong className="text-emerald-300">
                ₹{plan.return24hCarTollInr}
              </strong>
              , and estimated one-way Petrol fuel cost is{" "}
              <strong className="text-white">₹{plan.fuelCostInr}</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container with Overlapping SSR Search Box & Results */}
      <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-8 px-3.5 sm:-mt-10 sm:space-y-10 sm:px-6 lg:px-8">
        <HighwayTollCalculator
          key={plan.routeSlug}
          initialFromSlug={plan.fromCity.slug}
          initialToSlug={plan.toCity.slug}
          initialPlan={plan}
          cities={cities}
          isDedicatedRoutePage={true}
        />

        {/* Route-Specific FAQs */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Corridor Toll &amp; Fuel Guide
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <AlertCircleIcon className="h-5 w-5 text-[#fc6203]" />
              FAQs: {plan.fromCity.name} to {plan.toCity.name} Highway Toll &amp; Fuel
            </h2>
          </div>

          <div className="space-y-3.5">
            {dynamicFaqs.map((faq, idx) => (
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

        {/* Authority Blog Guides */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                NHAI FASTag &amp; Indian Expressway Knowledge Hub
              </span>
              <h2 className="mt-0.5 text-base font-extrabold text-ink sm:text-xl">
                Highway Toll Rules, FASTag KYV &amp; Road Trip Cost Guides
              </h2>
            </div>
            <Link
              href="/blog#highway-toll-guides"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
            >
              <span>All Highway Guides</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TOLL_BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-4 transition hover:border-[#1956b4] hover:bg-card hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded bg-blue-50 px-2 py-0.5 font-extrabold text-[#1956b4] dark:bg-blue-950/60 dark:text-blue-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <ClockIcon className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-extrabold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
                  <span className="text-[11px] text-ink-muted">
                    {post.publishedDate}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-extrabold text-[#1956b4] dark:text-blue-300"
                  >
                    <span>Read</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* All Outbound Highway Corridors from Origin & Destination Cities */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Complete Intercity Highway Matrix
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
              <MapPinIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              All Highway Toll &amp; Fuel Routes from {plan.fromCity.name} &amp;{" "}
              {plan.toCity.name}
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                All {outboundFromOrigin.length} Highway Routes from {plan.fromCity.name} ({plan.fromCity.state})
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {outboundFromOrigin.map((rel) => (
                  <Link
                    key={rel.routeSlug}
                    href={rel.routePath}
                    className="flex items-center justify-between rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink transition hover:border-[#1956b4] hover:bg-card hover:text-[#1956b4] dark:hover:text-blue-300"
                  >
                    <span className="truncate">
                      {rel.fromName} to {rel.toName} Toll
                    </span>
                    <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                All {outboundFromDestination.length} Onward &amp; Return Routes from {plan.toCity.name} ({plan.toCity.state})
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {outboundFromDestination.map((rel) => (
                  <Link
                    key={rel.routeSlug}
                    href={rel.routePath}
                    className="flex items-center justify-between rounded-lg border border-line bg-subcard/40 px-3 py-2 text-xs font-semibold text-ink transition hover:border-[#1956b4] hover:bg-card hover:text-[#1956b4] dark:hover:text-blue-300"
                  >
                    <span className="truncate">
                      {rel.fromName} to {rel.toName} Toll
                    </span>
                    <ArrowRightIcon className="h-3 w-3 shrink-0 text-ink-muted" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Route Combination Keywords & Search Queries */}
        <section
          aria-label="Route Combination Search Keywords"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <h2 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink-muted">
            {plan.fromCity.name} to {plan.toCity.name} Highway Toll &amp; Fuel Search Keywords
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {routeCombinationKeywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md border border-line bg-subcard/60 px-2.5 py-1 text-[11px] font-medium text-ink-soft"
              >
                {kw}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
