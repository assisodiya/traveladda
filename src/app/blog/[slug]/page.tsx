import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AirlineLogo } from "@/components/AirlineLogo";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  LuggageIcon,
  PlaneIcon,
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
  const sameDomainPosts = (
    isAirPost ? FLIGHT_BLOG_POSTS : RAIL_BLOG_POSTS
  ).filter((p) => p.slug !== post.slug);

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
            <Link
              href={isAirPost ? "/air/flight-status" : "/rail/pnr-status"}
              className="hover:text-[#1956b4]"
            >
              {isAirPost ? "Flight Status" : "Rail"}
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink">{post.category}</span>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`rounded px-2.5 py-0.5 font-bold ${
                isAirPost
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              }`}
            >
              {post.category}
            </span>
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
              href={isAirPost ? "/air/flight-status" : "/rail/live-status"}
              className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold"
            >
              <span>
                {isAirPost ? "Check Flight Status" : "Spot Train Live"}
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

          {/* Contextual Quick Lookups */}
          {post.quickActionLinks && post.quickActionLinks.length > 0 && (
            <div className="rounded-xl border border-line bg-subcard/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {isAirPost
                  ? "Quick Live Flight Lookups"
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
                      ) : (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
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
          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-3.5">
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
            <section className="space-y-3 border-t border-line pt-6">
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

          {/* Bottom In-Article CTA */}
          <div className="ta-live-cockpit flex flex-col justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isAirPost
                  ? "Check Live Flight Status, Terminal & Boarding Gate"
                  : "Spot Your Train's Live Station & Coach Position"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-300">
                {isAirPost
                  ? "Real-time departure, arrival, gate, and baggage carousel updates."
                  : "Real-time station progress, platform numbers, and coach sequence."}
              </p>
            </div>
            <Link
              href={isAirPost ? "/air/flight-status" : "/rail/live-status"}
              className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold"
            >
              <span>{isAirPost ? "Track Flight" : "Spot Train"}</span>
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
                    href="/rail/pnr-status"
                    className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold"
                  >
                    <TicketIcon className="h-3.5 w-3.5" />
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
                  {isAirPost ? "More Flight Guides" : "More Rail Guides"}
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
          </div>
        </aside>
      </div>
    </main>
  );
}
