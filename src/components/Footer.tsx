import Link from "next/link";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { HotelIcon, PlaneIcon, TrainIcon } from "./Icons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo theme="dark" size="md" />
            <p className="text-sm leading-relaxed text-slate-300">
              Your modern portal for Air, Rail, and Hotel travel tools. Check
              real-time Indian Railways PNR status, calculate baggage &amp; stay
              budgets, and read practical travel guides.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Live Rail PNR Engine Active</span>
            </div>
          </div>

          {/* Rail Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white">
              <TrainIcon className="h-4 w-4 text-sky-400" />
              <span>Rail Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/rail/pnr-status"
                  className="inline-flex items-center gap-2 text-slate-200 transition hover:text-sky-400"
                >
                  <span>Live PNR Status Checker</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#decoder"
                  className="text-slate-300 transition hover:text-white"
                >
                  Coach &amp; Berth Code Decoder
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#rail-blog"
                  className="text-slate-300 transition hover:text-white"
                >
                  Chart Timings &amp; Rail Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#faq"
                  className="text-slate-300 transition hover:text-white"
                >
                  PNR Status FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Air & Hotel Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white">
              <PlaneIcon className="h-4 w-4 text-sky-400" />
              <span>Air &amp; Hotel Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/tools/air#baggage"
                  className="text-slate-300 transition hover:text-white"
                >
                  Flight Baggage Allowance Checker
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/air#buffer"
                  className="text-slate-300 transition hover:text-white"
                >
                  Airport Arrival Buffer Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#gst-calculator"
                  className="inline-flex items-center gap-1.5 text-slate-300 transition hover:text-white"
                >
                  <HotelIcon className="h-3.5 w-3.5 text-teal-400" />
                  <span>Hotel Tariff &amp; GST Calculator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#transit-planner"
                  className="text-slate-300 transition hover:text-white"
                >
                  Check-in &amp; Transit Stay Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Guides */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white">
              Travel Guides
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RAIL_BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="line-clamp-1 text-slate-300 transition hover:text-sky-400"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 TravelAdda. Built for seamless Air, Rail &amp; Hotel journeys.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/tools/air" className="hover:text-white">
              Air
            </Link>
            <Link href="/rail/pnr-status" className="hover:text-white">
              Rail
            </Link>
            <Link href="/tools/hotel" className="hover:text-white">
              Hotel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
