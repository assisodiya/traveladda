import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  PlaneIcon,
  TrainIcon,
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
                Flight Status, Airport Terminal &amp; Rail Guides
              </h1>
              <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                Clear, practical guides on tracking live flight status, finding
                your airport terminal, predicting inbound delays, and decoding
                Indian Railways PNR quotas.
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
            </div>
          </div>
        </div>
      </section>

      {/* FLIGHT STATUS & AVIATION GUIDES */}
      <section
        id="flight-guides"
        className="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6 lg:px-8"
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
