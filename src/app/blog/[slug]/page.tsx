import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
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
      {/* Article Header */}
      <section
        className={`bg-gradient-to-br ${post.accentColor} py-16 text-white sm:py-20`}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/rail/pnr-status#rail-blog" className="hover:text-white">
              PNR Hub &amp; Blog
            </Link>
            <span>/</span>
            <span className="text-white">{post.category}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="rounded-full bg-black/25 px-3 py-1 backdrop-blur-xs">
              {post.category}
            </span>
            <span>{post.readTime}</span>
            <span>·</span>
            <span>{post.publishedDate}</span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {post.excerpt}
          </p>

          <div className="mt-8 flex items-center gap-3 border-t border-white/20 pt-5 text-sm">
            <div className="grid size-10 place-items-center rounded-full bg-white/20 font-black">
              {post.author.name[0]}
            </div>
            <div>
              <p className="font-bold">{post.author.name}</p>
              <p className="text-xs text-white/80">{post.author.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Sidebar */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        {/* Article Body */}
        <article className="space-y-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-xs sm:p-10">
          {/* Key Takeaways Box */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">
              Quick Summary
            </h2>
            <ul className="mt-3 space-y-2">
              {post.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm font-medium text-emerald-950"
                >
                  <span className="mt-0.5 font-bold text-emerald-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {post.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-base leading-relaxed text-slate-700"
                >
                  {p}
                </p>
              ))}

              {section.bullets && (
                <div className="mt-4 space-y-3">
                  {section.bullets.map((b) => (
                    <div
                      key={b.label}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4"
                    >
                      <p className="text-sm font-extrabold text-slate-900">
                        {b.label}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {b.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {section.callout && (
                <div className="rounded-2xl border-l-4 border-orange-500 bg-orange-50/80 p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
                    💡 {section.callout.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-orange-950">
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
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                LIVE PNR TOOL
              </span>
              <h3 className="mt-4 text-xl font-extrabold">
                Check Your 10-Digit PNR Now
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Verify live seat confirmation, charting status, and coach number
                via TravelAdda&apos;s owned PNR API.
              </p>
              <Link
                href="/rail/pnr-status"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-extrabold text-white transition hover:from-orange-700 hover:to-amber-600"
              >
                <span>Open PNR Status Tool</span>
                <span>→</span>
              </Link>
              <Link
                href="/rail/pnr-status?pnr=2528012827"
                className="mt-2.5 flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-semibold text-orange-200 hover:bg-white/10"
              >
                Try Sample: 2528012827
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                More Rail Guides
              </h3>
              <div className="mt-4 space-y-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="block rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/40"
                  >
                    <span className="text-[10px] font-bold uppercase text-orange-600">
                      {rel.category}
                    </span>
                    <p className="mt-1 text-xs font-extrabold leading-snug text-slate-900">
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

