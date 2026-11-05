import Link from "next/link";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { HotelIcon, PlaneIcon, TrainIcon } from "./Icons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-band text-ink-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm leading-relaxed text-ink-soft">
              Your modern companion for Air, Rail, and Hotel travel tools. Check
              real-time Indian Railways PNR status, calculate baggage &amp; stay
              budgets, and read practical travel guides.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live Rail PNR Status Ready</span>
            </div>
          </div>

          {/* Rail Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              <TrainIcon className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              <span>Rail Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/rail/pnr-status"
                  className="inline-flex items-center gap-2 font-semibold text-ink transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  <span>Live PNR Status Checker</span>
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#decoder"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  Coach &amp; Berth Code Decoder
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#rail-blog"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  Chart Timings &amp; Rail Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#faq"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  PNR Status FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Air & Hotel Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              <PlaneIcon className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              <span>Air &amp; Hotel Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/tools/air#baggage"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  Flight Baggage Allowance Checker
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/air#buffer"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  Airport Arrival Buffer Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#gst-calculator"
                  className="inline-flex items-center gap-1.5 text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  <HotelIcon className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                  <span>Hotel Tariff &amp; GST Calculator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#transit-planner"
                  className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                >
                  Check-in &amp; Transit Stay Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Guides */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              Travel Guides
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RAIL_BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="line-clamp-1 text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-xs font-medium text-ink-muted sm:flex-row">
          <p>© 2026 TravelAdda. Built for seamless Air, Rail &amp; Hotel journeys.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/tools/air"
              className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
            >
              Air
            </Link>
            <Link
              href="/rail/pnr-status"
              className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
            >
              Rail
            </Link>
            <Link
              href="/tools/hotel"
              className="text-ink-soft transition hover:text-teal-700 dark:hover:text-teal-300"
            >
              Hotel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
