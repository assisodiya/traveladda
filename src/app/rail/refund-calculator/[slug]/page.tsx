import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "@/components/Icons";
import RailRefundCalculator from "@/components/RailRefundCalculator";
import {
  buildRefundScenarioPath,
  computeRailRefund,
  DEFAULT_REFUND_STATE,
  formatINR,
  getRefundScenarioBySlug,
  REFUND_SEO_SCENARIOS,
} from "@/lib/rail-refund-service";

interface ScenarioPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return REFUND_SEO_SCENARIOS.map((sc) => ({
    slug: sc.slug,
  }));
}

export async function generateMetadata({
  params,
}: ScenarioPageProps): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const { slug } = await params;
  const scenario = getRefundScenarioBySlug(slug);
  if (!scenario) {
    return {
      title: "IRCTC Train Ticket Cancellation & Refund Calculator | TravelAdda",
    };
  }

  const canonicalUrl = `https://traveladda.in${buildRefundScenarioPath(
    scenario.slug
  )}`;

  return {
    title: scenario.title,
    description: scenario.metaDescription,
    keywords: scenario.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: scenario.title,
      description: scenario.metaDescription,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function RailRefundScenarioPage({
  params,
}: ScenarioPageProps) {
  "use cache";
  cacheLife("days");

  const { slug } = await params;
  const scenario = getRefundScenarioBySlug(slug);
  if (!scenario) {
    notFound();
  }

  const mergedInitialState = {
    ...DEFAULT_REFUND_STATE,
    ...scenario.presetState,
  };
  const initialResult = computeRailRefund(mergedInitialState);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: scenario.h1,
        url: `https://traveladda.in${buildRefundScenarioPath(scenario.slug)}`,
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        description: scenario.metaDescription,
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
            name: "IRCTC Refund Calculator",
            item: "https://traveladda.in/rail/refund-calculator",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: scenario.shortTitle,
            item: `https://traveladda.in${buildRefundScenarioPath(
              scenario.slug
            )}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: scenario.faqs.map((faq) => ({
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

      {/* Deep Navy Scenario Hero Header */}
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
                href="/rail/refund-calculator"
                className="hover:text-white hover:underline"
              >
                IRCTC Refund Calculator
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {scenario.shortTitle}
              </span>
            </nav>

            <Link
              href="/rail/refund-calculator"
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-white/20"
            >
              All 29 Refund Calculators
            </Link>
          </div>

          <div className="mt-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs sm:text-xs">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#fc6203]" />
              <span>{scenario.heroBadge}</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {scenario.h1}
            </h1>

            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
              {scenario.summaryHighlight} Pre-loaded sample shows a net bank
              refund of{" "}
              <strong className="text-emerald-300">
                {formatINR(initialResult.totalNetRefund)}
              </strong>{" "}
              after a PRS deduction of{" "}
              <strong className="text-rose-300">
                {formatINR(initialResult.finalRailwayCut)}
              </strong>
              . Customize your fare, passengers, and time window below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-8 px-3.5 sm:-mt-10 sm:space-y-10 sm:px-6 lg:px-8">
        <RailRefundCalculator
          key={scenario.slug}
          initialState={scenario.presetState}
          initialResult={initialResult}
          activeScenarioSlug={scenario.slug}
        />

        {/* Scenario-Specific FAQs */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 border-b border-line pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Official Indian Railways PRS Rule Guide
            </span>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-extrabold text-ink sm:text-xl">
              <AlertCircleIcon className="h-5 w-5 text-[#fc6203]" />
              FAQs: {scenario.shortTitle}
            </h2>
          </div>

          <div className="space-y-3.5">
            {scenario.faqs.map((faq, idx) => (
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

        {/* All 29 Refund Calculators Directory for Internal Linking */}
        <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
              <TicketIcon className="h-5 w-5 text-[#fc6203]" />
              Explore All Indian Railways Ticket Refund Calculators (CNF, RAC, WL, Tatkal &amp; Classes)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {REFUND_SEO_SCENARIOS.map((sc) => (
              <Link
                key={sc.slug}
                href={buildRefundScenarioPath(sc.slug)}
                className={`flex items-center justify-between rounded-xl border p-3 text-xs font-extrabold transition ${
                  sc.slug === scenario.slug
                    ? "border-[#1956b4] bg-blue-50/70 text-[#1956b4] dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-line bg-subcard/40 text-ink hover:border-[#1956b4] hover:bg-card hover:text-[#1956b4] dark:hover:text-blue-300"
                }`}
              >
                <span className="truncate">{sc.shortTitle}</span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom Keyword Tags */}
        <section
          aria-label="Scenario Search Keywords"
          className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
        >
          <h2 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-ink-muted">
            {scenario.shortTitle} Search Keywords
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {scenario.keywords.map((kw) => (
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

