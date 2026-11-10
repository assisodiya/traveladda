import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalculatorIcon,
  ClockIcon,
  LuggageIcon,
  PlaneIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import { TOOL_CATEGORIES, type ToolMenuItem } from "@/lib/tools-catalog";

export const metadata: Metadata = {
  title:
    "Active Travel Tools | Live Flight Status, Live Train GPS, PNR Checker, Baggage & Hotel GST Calculator",
  description:
    "Browse all active TravelAdda utilities by category: Air Tools (Live Flight Status, Baggage & Arrival Time Calculator), Rail Tools (Live Train Running Status, 10-Digit PNR Status), and Hotel Room GST Calculator.",
  keywords: [
    "travel tools india",
    "live flight status tool",
    "indian railways pnr status tool",
    "spot your train live running status",
    "airline baggage allowance calculator",
    "hotel room gst calculator india",
  ],
  alternates: {
    canonical: "/tools",
  },
};

function renderToolIcon(iconKey: ToolMenuItem["iconKey"]) {
  switch (iconKey) {
    case "plane":
      return <PlaneIcon className="h-5 w-5" />;
    case "luggage":
      return <LuggageIcon className="h-5 w-5" />;
    case "train":
      return <TrainIcon className="h-5 w-5" />;
    case "ticket":
      return <TicketIcon className="h-5 w-5" />;
    case "calculator":
      return <CalculatorIcon className="h-5 w-5" />;
    case "clock":
      return <ClockIcon className="h-5 w-5" />;
  }
}

export default async function AllToolsPage() {
  "use cache";
  cacheLife("hours");

  const allItems = TOOL_CATEGORIES.flatMap((cat) => cat.items);

  const toolsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "TravelAdda Air, Rail & Hotel Travel Tools Directory",
        url: "https://traveladda.in/tools",
        description:
          "Category-wise suite of free travel utilities for Indian and international flyers, railway passengers, and hotel guests.",
      },
      {
        "@type": "ItemList",
        itemListElement: allItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          description: item.description,
          url: `https://traveladda.in${item.href}`,
        })),
      },
    ],
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolsJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">All Travel Tools</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                Category-Wise Air, Rail &amp; Hotel Travel Tools
              </h1>
              <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                Instant, zero-clutter utilities for live flight tracking,
                baggage rules, Indian Railways GPS running status, 10-digit PNR
                verification, and hotel GST calculation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOOL_CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`#category-${cat.id}`}
                  className="rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  {cat.categoryTitle}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl space-y-12 px-4 sm:mt-12 sm:px-6 lg:px-8">
        {TOOL_CATEGORIES.map((category) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                >
                  {category.id === "air"
                    ? "Aviation Suite"
                    : category.id === "rail"
                      ? "Indian Railways Suite"
                      : "Hospitality Suite"}
                </span>
                <h2 className="mt-1 text-lg font-extrabold text-ink sm:text-2xl">
                  {category.categoryTitle}
                </h2>
                <p className="text-xs text-ink-soft sm:text-sm">
                  {category.categorySubtitle}
                </p>
              </div>
              <Link
                href={category.hubHref}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                <span>Open {category.categoryTitle}</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-2xs transition hover:border-[#1956b4] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.accentBadgeClass}`}
                      >
                        {renderToolIcon(tool.iconKey)}
                      </span>
                      {tool.badge && (
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3.5 text-base font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-bold text-[#1956b4] dark:text-blue-400">
                    <span>Launch Tool</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

