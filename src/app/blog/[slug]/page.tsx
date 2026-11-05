import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
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
      {/* Light / Dark Mode Compatible Article Header */}
      <section className="border-b border-slate-200 bg-indigo-50/75 bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-16 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-indigo-950/85 dark:to-slate-900 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            <Link
              href="/"
              className="hover:text-indigo-600 dark:hover:text-white"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/rail/pnr-status#rail-blog"
              className="hover:text-indigo-600 dark:hover:text-white"
            >
              Rail Blog
            </Link>
            <span>/</span>
            <span className="font-bold text-indigo-700 dark:text-sky-300">
              {post.category}
            </span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-white dark:bg-sky-500/20 dark:text-sky-200 dark:ring-1 dark:ring-sky-400/30">
              {post.category}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {post.readTime}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              {post.publishedDate}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-slate-200 pt-5 text-sm dark:border-white/15">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-black text-white">
              {post.author.name[0]}
            </div>
            <div>
              <p className="font-bold text-slate-950 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {post.author.role}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        {/* Article Body */}
        <article className="space-y-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          {/* Key Takeaways Box */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-900 dark:text-emerald-300">
              Quick Summary
            </h2>
            <ul className="mt-3 space-y-2.5">
              {post.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm font-medium text-emerald-950 dark:text-emerald-100"
                >
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-base leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <div className="mt-4 space-y-3">
                  {section.bullets.map((b) => (
                    <div
                      key={b.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {b.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {b.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.callout && (
                <div className="rounded-2xl border-l-4 border-indigo-600 bg-indigo-50 p-5 dark:border-sky-400 dark:bg-indigo-950/40">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-sky-300">
                    {section.callout.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-indigo-950 dark:text-slate-200">
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
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 text-slate-900 shadow-lg transition-colors dark:border-slate-800 dark:bg-slate-900 dark:from-slate-900 dark:via-indigo-950/70 dark:to-slate-900 dark:text-white">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300">
                LIVE PNR TOOL
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">
                Check Your 10-Digit PNR Now
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                Verify live seat confirmation, charting status, and coach number
                via TravelAdda&apos;s owned PNR API.
              </p>
              <Link
                href="/rail/pnr-status"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Open PNR Status Tool</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                More Rail Guides
              </h3>
              <div className="mt-4 space-y-3.5">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-sky-400/50"
                  >
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-sky-400">
                      {rel.category}
                    </span>
                    <p className="mt-1 text-xs font-extrabold leading-snug text-slate-900 dark:text-white">
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
