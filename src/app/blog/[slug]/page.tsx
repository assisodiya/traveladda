import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  HelpCircleIcon,
  LiveFlightBeaconIcon,
  LuggageIcon,
  PlaneIcon,
  RadarLiveIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import {
  ALL_BLOG_POSTS,
  FLIGHT_BLOG_POSTS,
  getBlogPostBySlug,
  RAIL_BLOG_POSTS,
} from "@/lib/blog-data";

export function generateStaticParams() {
  return ALL_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  "use cache";
  cacheLife("days");
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Article Not Found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.seoKeywords,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | TravelAdda`,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      siteName: "TravelAdda",
      locale: "en_IN",
      type: "article",
      publishedTime: `${post.publishedIso}T06:00:00+05:30`,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife("days");

  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const isAirPost = post.domain === "air";
  const sameDomainPosts = (isAirPost ? FLIGHT_BLOG_POSTS : RAIL_BLOG_POSTS).filter(
    (p) => p.slug !== post.slug
  );

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: `${post.publishedIso}T06:00:00+05:30`,
      dateModified: `${post.publishedIso}T06:00:00+05:30`,
      articleSection: post.category,
      keywords: post.seoKeywords.join(", "),
      author: {
        "@type": "Person",
        name: post.author.name,
        jobTitle: post.author.role,
      },
      publisher: {
        "@type": "Organization",
        name: "TravelAdda",
        url: "https://traveladda.in",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://traveladda.in/blog/${post.slug}`,
      },
      about: isAirPost
        ? {
            "@type": "WebApplication",
            name: "TravelAdda Live Flight Status Tracker",
            url: "https://traveladda.in/air/flight-status",
          }
        : {
            "@type": "WebApplication",
            name: "TravelAdda Indian Railways Live & PNR Suite",
            url: "https://traveladda.in/rail/live-status",
          },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://traveladda.in/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Travel Blog",
          item: "https://traveladda.in/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: isAirPost ? "Live Flight Status" : "Rail Tools",
          item: isAirPost
            ? "https://traveladda.in/air/flight-status"
            : "https://traveladda.in/rail/live-status",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: post.title,
          item: `https://traveladda.in/blog/${post.slug}`,
        },
      ],
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
  };

  return (
    <main className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Warm Article Header */}
      <section className="ta-hero py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft"
          >
            <Link
              href="/"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <Link
              href="/blog"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Travel Blog
            </Link>
            <span className="text-ink-muted">/</span>
            <Link
              href={isAirPost ? "/air/flight-status" : "/rail/pnr-status#rail-blog"}
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              {isAirPost ? "Flight Status Hub" : "Rail Hub"}
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-bold text-orange-700 dark:text-amber-300">
              {post.category}
            </span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-orange-800 dark:text-amber-200">
              {isAirPost ? (
                <PlaneIcon className="h-3.5 w-3.5" />
              ) : (
                <TrainIcon className="h-3.5 w-3.5" />
              )}
              <span>{post.category}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-ink-soft">
              <ClockIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>{post.readTime}</span>
            </span>
            <span className="text-ink-muted">·</span>
            <span className="inline-flex items-center gap-1 text-ink-soft">
              <CalendarIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
              <span>{post.publishedDate}</span>
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-sm">
            <div className="flex items-center gap-3">
              <div className="ta-btn-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black">
                {post.author.name[0]}
              </div>
              <div>
                <p className="font-bold text-ink">{post.author.name}</p>
                <p className="text-xs text-ink-muted">{post.author.role}</p>
              </div>
            </div>

            <Link
              href={isAirPost ? "/air/flight-status" : "/rail/live-status"}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/12 px-3.5 py-2 text-xs font-extrabold text-orange-800 transition hover:bg-orange-500/20 dark:text-amber-300"
            >
              <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                {isAirPost
                  ? "Open Live Flight Tracker"
                  : "Open Live Train Radar"}
              </span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 sm:mt-12 sm:px-6 lg:grid-cols-[1fr_350px] lg:px-8">
        {/* Article Body */}
        <article className="space-y-8 rounded-3xl border border-line bg-card p-5 shadow-xs sm:p-10">
          {/* Key Takeaways Box */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/12 p-5 sm:p-6">
            <h2 className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Key Takeaways</span>
            </h2>
            <ul className="mt-3 space-y-2.5">
              {post.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm font-medium text-ink"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contextual SEO Internal Link Strip to Flight / Rail Tools */}
          {post.quickActionLinks && post.quickActionLinks.length > 0 && (
            <div className="rounded-2xl border border-line bg-subcard/70 p-4 sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-amber-300">
                {isAirPost
                  ? "Instant Live Flight & Airport Lookups"
                  : "Instant Live Railway Lookups"}
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {post.quickActionLinks.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center justify-between gap-2.5 rounded-xl border border-line bg-card p-3 transition hover:border-orange-500"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {action.airlineCode ? (
                        <AirlineLogo code={action.airlineCode} size="sm" />
                      ) : (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
                          <RadarLiveIcon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-ink group-hover:text-orange-700 dark:group-hover:text-amber-300">
                          {action.label}
                        </p>
                        <p className="truncate text-[11px] text-ink-muted">
                          {action.sublabel}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Editorial Sections */}
          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-sm leading-relaxed text-ink-soft sm:text-base"
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <div className="mt-4 space-y-3">
                  {section.bullets.map((b) => (
                    <div
                      key={b.label}
                      className="rounded-2xl border border-line bg-subcard p-4"
                    >
                      <p className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-orange-600 dark:text-amber-400" />
                        <span>{b.label}</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {b.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.callout && (
                <div className="rounded-2xl border-l-4 border-orange-500 bg-subcard p-5">
                  <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-amber-300">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    <span>{section.callout.title}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {section.callout.text}
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Article FAQ Section for People Also Ask / Rich Results */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="space-y-3 border-t border-line pt-6">
              <div className="flex items-center gap-2 text-orange-700 dark:text-amber-300">
                <HelpCircleIcon className="h-5 w-5" />
                <h2 className="text-lg font-extrabold text-ink sm:text-xl">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-2.5">
                {post.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    open
                    className="group rounded-2xl border border-line bg-subcard/60 p-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-extrabold text-ink">
                      <span>{faq.question}</span>
                      <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Bottom In-Article Pillar Page Banner */}
          {isAirPost ? (
            <div className="ta-live-cockpit flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-3.5">
                <LiveFlightBeaconIcon size="md" active />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                    READY TO FLY TODAY?
                  </p>
                  <h3 className="text-base font-black text-white sm:text-lg">
                    Check Your Live Flight Status, Terminal &amp; Boarding Gate
                  </h3>
                </div>
              </div>
              <Link
                href="/air/flight-status"
                className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold sm:text-sm"
              >
                <span>Track Flight Now</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="ta-live-cockpit flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  TRAVELLING BY TRAIN?
                </p>
                <h3 className="text-base font-black text-white sm:text-lg">
                  Spot Your Train&apos;s Live GPS Station &amp; Coach Order
                </h3>
              </div>
              <Link
                href="/rail/live-status"
                className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold sm:text-sm"
              >
                <span>Track Live Train</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </article>

        {/* Sticky Sidebar CTA + Related Guides */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {isAirPost ? (
              <div className="ta-cta-banner rounded-3xl p-6 shadow-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-[11px] font-bold text-orange-800 dark:text-amber-200">
                  <PlaneIcon className="h-3.5 w-3.5" />
                  <span>LIVE AVIATION RADAR</span>
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-ink">
                  Track Flight Status, Terminal &amp; Gate
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  Search IndiGo (6E), Air India (AI), Akasa (QP), Emirates (EK)
                  &amp; 500+ global airlines with live takeoff, gate &amp;
                  baggage belt updates.
                </p>
                <div className="mt-5 space-y-2.5">
                  <Link
                    href="/air/flight-status"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold"
                  >
                    <RadarLiveIcon className="h-4 w-4" />
                    <span>Open Flight Status Tracker</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/tools/air"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line-strong bg-card px-4 py-3 text-sm font-extrabold text-ink transition hover:border-orange-500"
                  >
                    <LuggageIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                    <span>Baggage &amp; Buffer Tools</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="ta-cta-banner rounded-3xl p-6 shadow-lg">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-[11px] font-bold text-orange-800 dark:text-amber-200">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  <span>LIVE RAIL TOOLS</span>
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-ink">
                  Check PNR or Spot Your Train Live
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  Verify live seat confirmation, charting status, live station
                  location, and exact coach rake order in seconds.
                </p>
                <div className="mt-5 space-y-2.5">
                  <Link
                    href="/rail/pnr-status"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold"
                  >
                    <TicketIcon className="h-4 w-4" />
                    <span>Open PNR Status Tool</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rail/live-status"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line-strong bg-card px-4 py-3 text-sm font-extrabold text-ink transition hover:border-orange-500"
                  >
                    <RadarLiveIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                    <span>Spot Live Train Status</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-line bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                  <BookOpenIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>
                    {isAirPost ? "More Flight Guides" : "More Rail Guides"}
                  </span>
                </h3>
                <Link
                  href="/blog"
                  className="text-[11px] font-bold text-orange-700 hover:underline dark:text-amber-300"
                >
                  All →
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {sameDomainPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block rounded-2xl border border-line bg-subcard p-3.5 transition hover:border-orange-500"
                  >
                    <span className="text-[10px] font-extrabold uppercase text-orange-600 dark:text-amber-400">
                      {rel.category}
                    </span>
                    <p className="mt-1 text-xs font-extrabold leading-snug text-ink">
                      {rel.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
