import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";
import {
  ALL_BLOG_POSTS,
  FEATURED_SEO_BLOG_POSTS,
  getBlogPostBySlug,
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
      tags: post.seoKeywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function BlogArticleSkeleton() {
  return (
    <main className="pb-16 sm:pb-24">
      <section className="ta-hero py-10 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-48 animate-pulse rounded bg-subcard" />
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-subcard" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-subcard" />
        </div>
      </section>
      <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-card p-8" />
      </div>
    </main>
  );
}

async function BlogArticleContent({
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
  const isHotelPost = post.domain === "hotel";
  const isMetroPost = post.domain === "metro";
  const isRoadPost = post.domain === "road";
  const sameDomainPosts = ALL_BLOG_POSTS.filter(
    (p) => p.domain === post.domain && p.slug !== post.slug
  ).slice(0, 5);
  const featuredRelatedPosts = FEATURED_SEO_BLOG_POSTS.filter(
    (p) => p.slug !== post.slug
  ).slice(0, 4);

  const estimatedWordCount = post.sections
    .flatMap((s) => [
      s.heading,
      ...s.paragraphs,
      ...(s.bullets?.map((b) => `${b.label} ${b.detail}`) ?? []),
      s.callout ? `${s.callout.title} ${s.callout.text}` : "",
    ])
    .join(" ")
    .split(/\s+/).length;

  const domainBreadcrumbLabel = isAirPost
    ? "Live Flight Status"
    : isHotelPost
      ? "Hotels & Stays"
      : isMetroPost
        ? "Delhi NCR Metro"
        : isRoadPost
          ? "NHAI Toll & Fuel Calculator"
          : "Rail Tools";
  const domainBreadcrumbHref = isAirPost
    ? "/air/flight-status"
    : isHotelPost
      ? "/tools/hotel"
      : isMetroPost
        ? "/delhi-metro"
        : isRoadPost
          ? "/toll-calculator"
          : "/rail/live-status";

  const jsonLdGraph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: `${post.publishedIso}T06:00:00+05:30`,
      dateModified: `${post.publishedIso}T06:00:00+05:30`,
      articleSection: post.category,
      inLanguage: "en-IN",
      isAccessibleForFree: true,
      wordCount: estimatedWordCount,
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
        logo: {
          "@type": "ImageObject",
          url: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
          width: 2056,
          height: 765,
        },
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
        : isHotelPost
          ? {
            "@type": "WebApplication",
            name: "TravelAdda Hotel Room GST Calculator & Stay Guide",
            url: "https://traveladda.in/tools/hotel",
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
          name: domainBreadcrumbLabel,
          item: `https://traveladda.in${domainBreadcrumbHref}`,
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
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* Clean Editorial Article Header */}
      <section className="ta-hero py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft"
          >
            <Link href="/" className="hover:text-[#1956b4]">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1956b4]">
              Guides
            </Link>
            <span>/</span>
            <Link href={domainBreadcrumbHref} className="hover:text-[#1956b4]">
              {domainBreadcrumbLabel}
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink">{post.category}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`rounded px-2.5 py-0.5 font-bold ${isAirPost
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : isHotelPost
                    ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                }`}
            >
              {post.category}
            </span>
            {post.primaryKeyword && (
              <span className="rounded bg-subcard px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                #{post.primaryKeyword}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-ink-muted">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{post.readTime}</span>
            </span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">{post.publishedDate}</span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1956b4] text-sm font-bold text-white">
                {post.author.name[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{post.author.name}</p>
                <p className="text-xs text-ink-muted">{post.author.role}</p>
              </div>
            </div>

            <Link
              href={domainBreadcrumbHref}
              className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold"
            >
              <span>
                {isAirPost
                  ? "Check Flight Status"
                  : isHotelPost
                    ? "Calculate Hotel GST"
                    : isMetroPost
                      ? "Find Metro Route & Fare"
                      : "Spot Train Live"}
              </span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="mx-auto mt-8 grid max-w-6xl gap-8 px-4 sm:mt-10 sm:px-6 lg:grid-cols-[1fr_330px] lg:px-8">
        {/* Clean Article Body */}
        <article className="space-y-7 rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-8">
          {/* Key Takeaways */}
          <div className="rounded-xl border border-blue-500/25 bg-blue-50/70 p-4 dark:bg-blue-500/10 sm:p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Key Takeaways
            </h2>
            <ul className="mt-2.5 space-y-2">
              {post.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-ink"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO Table of Contents */}
          {post.sections.length > 1 && (
            <nav
              aria-label="Table of contents"
              className="rounded-xl border border-line bg-subcard/40 p-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                In This Guide
              </p>
              <ol className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
                {post.sections.map((sec, idx) => (
                  <li key={sec.heading}>
                    <a
                      href={`#section-${idx + 1}`}
                      className="inline-flex items-start gap-1.5 font-semibold text-ink-soft hover:text-[#1956b4] dark:hover:text-blue-400"
                    >
                      <span className="font-mono text-[#1956b4] dark:text-blue-400">
                        {idx + 1}.
                      </span>
                      <span className="line-clamp-1">{sec.heading}</span>
                    </a>
                  </li>
                ))}
                {post.faqs && post.faqs.length > 0 && (
                  <li>
                    <a
                      href="#article-faqs"
                      className="inline-flex items-start gap-1.5 font-semibold text-ink-soft hover:text-[#1956b4] dark:hover:text-blue-400"
                    >
                      <span className="font-mono text-[#1956b4] dark:text-blue-400">
                        {post.sections.length + 1}.
                      </span>
                      <span>Frequently Asked Questions</span>
                    </a>
                  </li>
                )}
              </ol>
            </nav>
          )}

          {/* Contextual Quick Lookups */}
          {post.quickActionLinks && post.quickActionLinks.length > 0 && (
            <div className="rounded-xl border border-line bg-subcard/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {isAirPost
                  ? "Quick Live Flight Lookups"
                  : isHotelPost
                    ? "Quick Travel & Stay Tools"
                    : "Quick Railway Lookups"}
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {post.quickActionLinks.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center justify-between gap-2.5 rounded-lg border border-line bg-card p-2.5 transition hover:border-[#1956b4]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {action.airlineCode ? (
                        <AirlineLogo code={action.airlineCode} size="sm" />
                      ) : action.href.includes("/hotel") ? (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          <HotelIcon className="h-4 w-4" />
                        </span>
                      ) : action.href.includes("/air") ? (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          <PlaneIcon className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <TrainIcon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                          {action.label}
                        </p>
                        <p className="truncate text-[11px] text-ink-muted">
                          {action.sublabel}
                        </p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Sections */}
          {post.sections.map((section, idx) => (
            <section
              id={`section-${idx + 1}`}
              key={section.heading}
              className="scroll-mt-24 space-y-3.5"
            >
              <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-sm leading-relaxed text-ink-soft sm:text-[15px]"
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <div className="mt-3 space-y-2.5">
                  {section.bullets.map((b) => (
                    <div
                      key={b.label}
                      className="rounded-xl border border-line bg-subcard/70 p-3.5"
                    >
                      <p className="flex items-center gap-2 text-sm font-bold text-ink">
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{b.label}</span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
                        {b.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.callout && (
                <div className="rounded-xl border-l-4 border-[#1956b4] bg-subcard p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                    {section.callout.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
                    {section.callout.text}
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Article FAQs */}
          {post.faqs && post.faqs.length > 0 && (
            <section
              id="article-faqs"
              className="scroll-mt-24 space-y-3 border-t border-line pt-6"
            >
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {post.faqs.map((faq) => (
                  <details key={faq.question} open className="group p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-ink">
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

          {/* SEO Topic Tags */}
          {post.seoKeywords.length > 0 && (
            <div className="border-t border-line pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Related Search Topics
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {post.seoKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md border border-line bg-subcard px-2.5 py-1 text-xs text-ink-soft"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom In-Article CTA */}
          <div className="ta-live-cockpit flex flex-col justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isAirPost
                  ? "Check Live Flight Status, Terminal & Boarding Gate"
                  : isHotelPost
                    ? "Calculate Hotel GST Slabs & Track Your Flight or Train"
                    : isMetroPost
                      ? "Find Fastest Delhi NCR Metro Route, Fare & Interchange Stops"
                      : "Spot Your Train's Live Station & Coach Position"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-300">
                {isAirPost
                  ? "Real-time departure, arrival, gate, and baggage carousel updates."
                  : isHotelPost
                    ? "Compare 0%, 12%, and 18% hotel GST slabs and track live PNR & flight arrivals."
                    : isMetroPost
                      ? "Compare Fastest, Minimum Interchange, and Minimum Stops routes across all 12 Delhi NCR Metro lines."
                      : "Real-time station progress, platform numbers, and coach sequence."}
              </p>
            </div>
            <Link
              href={domainBreadcrumbHref}
              className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold"
            >
              <span>
                {isAirPost
                  ? "Track Flight"
                  : isHotelPost
                    ? "Open Hotel Tools"
                    : isMetroPost
                      ? "Open Metro Route Finder"
                      : "Spot Train"}
              </span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>

        {/* Clean Sidebar */}
        <aside className="space-y-5">
          <div className="sticky top-20 space-y-5">
            {isAirPost ? (
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <h3 className="text-base font-extrabold text-ink">
                  Track Flight Status Live
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Search IndiGo (6E), Air India (AI), Akasa (QP), Emirates (EK)
                  &amp; 500+ airlines with terminal, gate &amp; baggage belt
                  updates.
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/air/flight-status"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <PlaneIcon className="h-3.5 w-3.5" />
                    <span>Open Flight Status Tracker</span>
                  </Link>
                  <Link
                    href="/tools/air"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <LuggageIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                    <span>Baggage &amp; Buffer Tools</span>
                  </Link>
                </div>
              </div>
            ) : isHotelPost ? (
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <h3 className="text-base font-extrabold text-ink">
                  Plan Your Stay &amp; Transit
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Calculate 0%, 12% &amp; 18% hotel GST slabs, check 10-digit
                  IRCTC PNR status, or track live flight arrivals.
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/tools/hotel"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <HotelIcon className="h-3.5 w-3.5" />
                    <span>Hotel Room GST Calculator</span>
                  </Link>
                  <Link
                    href="/rail/pnr-status"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <TicketIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                    <span>Check 10-Digit PNR Status</span>
                  </Link>
                  <Link
                    href="/air/flight-status"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <PlaneIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                    <span>Live Flight Status Tracker</span>
                  </Link>
                </div>
              </div>
            ) : isMetroPost ? (
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <h3 className="text-base font-extrabold text-ink">
                  Plan Delhi NCR Metro Route
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Check station-to-station metro routes, DMRC token &amp; Smart
                  Card fares, interchanges, and first/last train timings across
                  all 12 lines.
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/delhi-metro"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <TrainIcon className="h-3.5 w-3.5" />
                    <span>Open Metro Route Finder</span>
                  </Link>
                  <Link
                    href="/delhi-metro/route/mg-road-to-anand-vihar"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <TicketIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                    <span>MG Road → Anand Vihar Route</span>
                  </Link>
                  <Link
                    href="/delhi-metro/route/new-delhi-to-igi-airport"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <PlaneIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                    <span>New Delhi → IGI Airport Route</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
                <h3 className="text-base font-extrabold text-ink">
                  Check PNR or Spot Your Train
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Verify live seat confirmation, chart status, live station
                  location, and coach order from engine.
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href="/rail/chart-time"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Check Train Chart Time</span>
                  </Link>
                  <Link
                    href="/rail/pnr-status"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <TicketIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                    <span>Check PNR Status</span>
                  </Link>
                  <Link
                    href="/rail/live-status"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-subcard px-4 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <TrainIcon className="h-3.5 w-3.5 text-[#0d9458] dark:text-emerald-400" />
                    <span>Spot Live Train</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {isAirPost
                    ? "More Flight Guides"
                    : isHotelPost
                      ? "More Stay & Holiday Guides"
                      : "More Rail Guides"}
                </h3>
                <Link
                  href="/blog"
                  className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  All →
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {sameDomainPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block rounded-xl border border-line bg-subcard p-3 transition hover:border-[#1956b4]"
                  >
                    <span className="text-[10px] font-bold uppercase text-[#1956b4] dark:text-blue-400">
                      {rel.category}
                    </span>
                    <p className="mt-0.5 text-xs font-bold leading-snug text-ink">
                      {rel.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  2026–27 Trending Reads
                </h3>
                <Link
                  href="/blog#featured-2026-27-guides"
                  className="text-xs font-bold text-[#fc6203] hover:underline"
                >
                  Top 10 →
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                {featuredRelatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block rounded-xl border border-line bg-subcard p-3 transition hover:border-[#1956b4]"
                  >
                    <span className="text-[10px] font-bold uppercase text-[#fc6203]">
                      {rel.category}
                    </span>
                    <p className="mt-0.5 text-xs font-bold leading-snug text-ink">
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

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<BlogArticleSkeleton />}>
      <BlogArticleContent params={params} />
    </Suspense>
  );
}
