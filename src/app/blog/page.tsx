import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  LiveFlightBeaconIcon,
  PlaneIcon,
  RadarLiveIcon,
  TrainIcon,
  UserCheckIcon,
} from "@/components/Icons";
import {
  ALL_BLOG_POSTS,
  FLIGHT_BLOG_POSTS,
  RAIL_BLOG_POSTS,
} from "@/lib/blog-data";

export const metadata: Metadata = {
  title:
    "TravelAdda Blog | Live Flight Status, Airport Terminal & Indian Rail Guides",
  description:
    "Read expert guides on checking live flight status by airline and flight number, Delhi/Mumbai/Bengaluru airport terminals, inbound aircraft delay prediction, DGCA flyer rights, and Indian Railways PNR & charting rules.",
  keywords: [
    "flight status blog",
    "how to check live flight status",
    "delhi mumbai airport terminals guide",
    "dgca flight delay rules",
    "indian railways pnr guide",
    "traveladda travel blog",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "TravelAdda Blog | Flight Status, Airport & Rail Travel Guides",
    description:
      "Actionable aviation and railway travel guides—live flight tracking tips, terminal maps, delay intelligence, and PNR masterclasses.",
    url: "/blog",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
};

export default async function BlogIndexPage() {
  "use cache";
  cacheLife("hours");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "TravelAdda Aviation & Rail Travel Blog",
        url: "https://traveladda.in/blog",
        description:
          "Editorial guides covering Live Flight Status tracking, airport terminals, inbound delay prediction, DGCA passenger rights, and Indian Railways PNR & charting.",
      },
      {
        "@type": "ItemList",
        itemListElement: ALL_BLOG_POSTS.map((post, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `https://traveladda.in/blog/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  };

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero Header */}
      <section className="ta-hero py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-ink-soft"
          >
            <Link
              href="/"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-bold text-orange-700 dark:text-amber-300">
              Travel Blog
            </span>
          </nav>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3.5 py-1 text-xs font-extrabold text-orange-700 dark:text-amber-300">
                <BookOpenIcon className="h-3.5 w-3.5" />
                <span>TRAVELADDA EDITORIAL JOURNAL</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
                Aviation, Flight Status &amp; Rail Guides
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                Practical playbooks for checking live flight telemetry,
                navigating multi-terminal Indian airports, spotting inbound
                delays early, and decoding Indian Railways PNR quotas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/air/flight-status"
                className="ta-btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold sm:text-sm"
              >
                <PlaneIcon className="h-4 w-4" />
                <span>Live Flight Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-card px-4 py-3 text-xs font-extrabold text-ink transition hover:border-orange-500 sm:text-sm"
              >
                <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                <span>Live Train Status</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FLIGHT STATUS & AVIATION GUIDES CLUSTER */}
      <section
        id="flight-guides"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              <LiveFlightBeaconIcon size="sm" active />
              <span>AVIATION &amp; LIVE FLIGHT STATUS GUIDES</span>
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Master Flight Tracking, Terminals &amp; Flyer Rights
            </h2>
          </div>
          <Link
            href="/air/flight-status"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-700 hover:underline dark:text-amber-300 sm:text-sm"
          >
            <span>Open Live Flight Tracker</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FLIGHT_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-line bg-card p-6 shadow-xs transition hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 font-bold text-orange-800 dark:text-amber-300">
                    <PlaneIcon className="h-3 w-3" />
                    <span>{post.category}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-ink-muted">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-extrabold leading-snug text-ink">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-muted">
                  <CalendarIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{post.publishedDate}</span>
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-orange-600 hover:text-orange-800 dark:text-amber-300"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* INDIAN RAILWAYS & PNR GUIDES CLUSTER */}
      <section
        id="rail-guides"
        className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              <TrainIcon className="h-4 w-4" />
              <span>INDIAN RAILWAYS &amp; PNR MASTERCLASS</span>
            </span>
            <h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Waitlist Quotas, Charting Rules &amp; Coach Layouts
            </h2>
          </div>
          <Link
            href="/rail/live-status"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-700 hover:underline dark:text-amber-300 sm:text-sm"
          >
            <span>Open Live Train Tracker</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {RAIL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-xs transition hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-lg sm:p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-amber-500/18 px-3 py-1 font-bold text-amber-900 dark:text-amber-300">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-ink-muted">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold leading-snug text-ink sm:text-lg">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition hover:text-orange-600 dark:hover:text-amber-300"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-muted">
                  <UserCheckIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>{post.author.name}</span>
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-extrabold text-orange-600 dark:text-amber-300"
                >
                  <span>Read</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

