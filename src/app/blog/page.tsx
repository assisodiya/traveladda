import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  HotelIcon,
  PlaneIcon,
  TrainIcon,
} from "@/components/Icons";
import {
  ALL_BLOG_POSTS,
  FEATURED_SEO_BLOG_POSTS,
  FLIGHT_BLOG_POSTS,
  HOTEL_BLOG_POSTS,
  RAIL_BLOG_POSTS,
} from "@/lib/blog-data";

export const metadata: Metadata = {
  title:
    "TravelAdda Travel Blog | Winter Destinations, Cheap Flights, Vande Bharat vs Rajdhani & Hotel Guides",
  description:
    "Read 2026–27 India travel guides: best winter destinations in India, cheap flights Christmas 2026, Vande Bharat vs Rajdhani, budget international destinations, family hotels in India, AI flight booking, flight vs train India, weekend getaways, hotel vs Airbnb vs homestay, and scenic train journeys.",
  keywords: [
    "winter destinations in India",
    "cheap flights Christmas 2026",
    "Vande Bharat vs Rajdhani",
    "budget international destinations",
    "family hotels in India",
    "AI flight booking",
    "flight vs train India",
    "weekend getaways India",
    "hotel vs Airbnb vs homestay",
    "scenic train journeys India",
    "flight status blog",
    "indian railways pnr guide",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title:
      "TravelAdda Blog | 2026–27 Destinations, Flights, Trains & Stay Guides",
    description:
      "Actionable Indian and international travel guides—winter destinations, holiday flight hacks, Vande Bharat Sleeper vs Rajdhani, family stays, and live flight & rail tools.",
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
        name: "TravelAdda Travel, Aviation, Rail & Stay Blog",
        url: "https://traveladda.in/blog",
        description:
          "Comprehensive 2026–27 travel guides covering winter destinations in India, cheap Christmas flights, Vande Bharat vs Rajdhani, budget international destinations, family hotels, AI flight booking, and Indian Railways PNR & live train status.",
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
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Clean Compact Navy Header */}
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
            <span className="font-semibold text-white">Travel Guides</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                2026–27 Travel, Flight, Train &amp; Hotel Guides
              </h1>
              <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                Expert guides on winter destinations in India, cheap Christmas
                flights, Vande Bharat Sleeper vs Rajdhani, budget international
                trips, family hotels, AI flight booking, and live flight &amp;
                rail tracking.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/air/flight-status"
                className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold"
              >
                <PlaneIcon className="h-3.5 w-3.5" />
                <span>Flight Status</span>
              </Link>
              <Link
                href="/rail/live-status"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/15"
              >
                <TrainIcon className="h-3.5 w-3.5" />
                <span>Train Status</span>
              </Link>
              <Link
                href="/tools/hotel"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/15"
              >
                <HotelIcon className="h-3.5 w-3.5" />
                <span>Hotel GST</span>
              </Link>
            </div>
          </div>

          {/* Quick Category Jump Bar */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs">
            <a
              href="#featured-2026-27-guides"
              className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white hover:bg-white/25"
            >
              Top 10 Holiday &amp; Comparison Guides (2026–27)
            </a>
            <a
              href="#flight-guides"
              className="rounded-full bg-white/10 px-3 py-1 font-medium text-slate-200 hover:bg-white/20"
            >
              Flight Status &amp; Airport Guides
            </a>
            <a
              href="#rail-guides"
              className="rounded-full bg-white/10 px-3 py-1 font-medium text-slate-200 hover:bg-white/20"
            >
              Indian Railways &amp; PNR Guides
            </a>
            <a
              href="#hotel-destination-guides"
              className="rounded-full bg-white/10 px-3 py-1 font-medium text-slate-200 hover:bg-white/20"
            >
              Hotels, Homestays &amp; Getaways
            </a>
          </div>
        </div>
      </section>

      {/* FEATURED 2026–27 SEO TRAVEL GUIDES (ALL 10 BLOGS) */}
      <section
        id="featured-2026-27-guides"
        className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#fc6203]">
              2026–27 Editorial Series
            </span>
            <h2 className="mt-0.5 text-lg font-extrabold text-ink sm:text-2xl">
              Featured Destination, Airfare, Train &amp; Stay Comparisons
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              In-depth guides covering winter trips, Christmas flights, Vande
              Bharat vs Rajdhani, AI flight booking, budget international
              destinations, and scenic train journeys.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {FEATURED_SEO_BLOG_POSTS.map((post, idx) => {
            const badgeColor =
              post.domain === "air"
                ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                : post.domain === "rail"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";

            return (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-xl border border-line bg-card p-5 transition hover:border-[#1956b4] hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-subcard font-mono text-[11px] font-bold text-ink-soft">
                        {idx + 1}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-bold ${badgeColor}`}
                      >
                        {post.category}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <ClockIcon className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400 sm:text-lg">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
                  {post.primaryKeyword ? (
                    <span className="rounded bg-subcard px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                      #{post.primaryKeyword}
                    </span>
                  ) : (
                    <span className="text-ink-muted">{post.publishedDate}</span>
                  )}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOTELS, HOMESTAYS & DESTINATION GUIDES */}
      <section
        id="hotel-destination-guides"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Hotels, Homestays &amp; Holiday Destination Guides
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Compare family hotels vs Airbnbs vs homestays, plan 2-day or 3-day
              weekend getaways, and explore top winter destinations in India.
            </p>
          </div>
          <Link
            href="/tools/hotel"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <span>Open Hotel GST Calculator</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {HOTEL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 transition hover:border-[#1956b4] hover:shadow-sm sm:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    {post.category}
                  </span>
                  <span className="text-ink-muted">{post.readTime}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400 sm:text-base">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-muted">{post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
                >
                  <span>Read</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FLIGHT STATUS & AVIATION GUIDES */}
      <section
        id="flight-guides"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Flight Status &amp; Airport Guides
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Learn how to check live flight status, navigate multi-terminal
              airports, and know your DGCA passenger rights.
            </p>
          </div>
          <Link
            href="/air/flight-status"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <span>Open Flight Tracker</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FLIGHT_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-5 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-ink-muted">
                    <ClockIcon className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-muted">{post.publishedDate}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
                >
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* INDIAN RAILWAYS & PNR GUIDES */}
      <section
        id="rail-guides"
        className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Indian Railways &amp; PNR Guides
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Waitlist confirmation priority, reservation chart windows, and
              coach berth layouts explained simply.
            </p>
          </div>
          <Link
            href="/rail/live-status"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            <span>Open Train Tracker</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {RAIL_BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 transition hover:border-[#1956b4] hover:shadow-sm sm:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {post.category}
                  </span>
                  <span className="text-ink-muted">{post.readTime}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400 sm:text-base">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-muted">{post.author.name}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-[#1956b4] dark:text-blue-400"
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
