import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { HotelToolsClient } from "@/components/HotelToolsClient";
import { ArrowRightIcon, ClockIcon } from "@/components/Icons";
import { HOTEL_BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Hotel Travel Tools | Room Tariff GST Calculator & Stay Planner",
  description:
    "Estimate Indian hotel tariffs with 0%, 12%, and 18% GST slabs, compare family hotels vs Airbnbs vs homestays, and plan early rail/flight check-ins on TravelAdda.",
  alternates: {
    canonical: "/tools/hotel",
  },
};

export default async function HotelToolsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-16 sm:pb-24">
      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">Hotels &amp; GST Calculator</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hotel Room GST Calculator &amp; Stay Guide
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Calculate room tariffs across 0%, 12%, and 18% GST brackets, plan
              early train/flight check-ins, and verify Indian hotel ID rules.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-5xl space-y-10 px-4 sm:mt-8 sm:px-6 lg:px-8">
        <HotelToolsClient />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-ink sm:text-xl">
                Family Hotels, Homestays &amp; Holiday Destination Guides
              </h2>
              <p className="text-xs text-ink-soft sm:text-sm">
                Compare hotel vs Airbnb vs homestay, find family-friendly
                resorts, and explore top winter &amp; weekend destinations.
              </p>
            </div>
            <Link
              href="/blog#hotel-destination-guides"
              className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
            >
              All guides →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {HOTEL_BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 transition hover:border-[#1956b4] hover:shadow-sm sm:p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="rounded bg-amber-50 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400 sm:text-base">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] dark:text-blue-400">
                  <span>Read Guide</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
