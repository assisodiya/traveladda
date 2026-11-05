import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  RadarLiveIcon,
  SparklesIcon,
  TicketIcon,
} from "@/components/Icons";
import { getBlogPostBySlug, RAIL_BLOG_POSTS } from "@/lib/blog-data";

export function generateStaticParams() {
  return RAIL_BLOG_POSTS.map((post) => ({
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

  const relatedPosts = RAIL_BLOG_POSTS.filter((p) => p.slug !== post.slug);

  return (
    <main className="pb-20">
      {/* Warm Article Header */}
      <section className="ta-hero py-16 sm:py-20">
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
              href="/rail/pnr-status#rail-blog"
              className="transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              Rail Blog
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="font-bold text-orange-700 dark:text-amber-300">
              {post.category}
            </span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-orange-800 dark:text-amber-200">
              <BookOpenIcon className="h-3.5 w-3.5" />
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

          <div className="mt-8 flex items-center gap-3 border-t border-line pt-5 text-sm">
            <div className="ta-btn-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black">
              {post.author.name[0]}
            </div>
            <div>
              <p className="font-bold text-ink">{post.author.name}</p>
              <p className="text-xs text-ink-muted">{post.author.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        {/* Article Body */}
        <article className="space-y-8 rounded-3xl border border-line bg-card p-7 shadow-xs sm:p-10">
          {/* Key Takeaways Box */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/12 p-6">
            <h2 className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Quick Summary</span>
            </h2>
            <ul className="mt-3 space-y-2.5">
              {post.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm font-medium text-ink"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 text-orange-600 dark:text-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-base leading-relaxed text-ink-soft"
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
                        <CheckCircleIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
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
        </article>

        {/* Sticky Sidebar CTA + More Articles */}
        <aside className="space-y-6">
          <div className="sticky top-24 space-y-6">
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

            <div className="rounded-3xl border border-line bg-card p-6">
              <h3 className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                <BookOpenIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                <span>More Rail Guides</span>
              </h3>
              <div className="mt-4 space-y-3.5">
                {relatedPosts.map((rel) => (
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
