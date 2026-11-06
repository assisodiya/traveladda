import Link from "next/link";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";
import {
  BookOpenIcon,
  CalculatorIcon,
  ClockIcon,
  CoachTrainIcon,
  HelpCircleIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  RadarLiveIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-band text-ink-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm leading-relaxed text-ink-soft">
              Your modern companion for Air, Rail, and Hotel travel tools. Check
              real-time Indian Railways PNR &amp; live train running status,
              calculate baggage &amp; stay budgets, and read practical guides.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3 py-1 text-xs font-bold text-orange-700 dark:text-amber-300">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Live PNR &amp; Train Radar Ready</span>
            </div>
          </div>

          {/* Rail Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              <TrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Rail Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/rail/pnr-status"
                  className="inline-flex items-center gap-2 font-semibold text-ink transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <TicketIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Live PNR Status Checker</span>
                  <span className="rounded bg-orange-500/18 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-amber-300">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/live-status"
                  className="inline-flex items-center gap-2 font-semibold text-ink transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <RadarLiveIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Live Train Running Status</span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-300">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#decoder"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <CoachTrainIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Coach &amp; Berth Code Decoder</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#faq"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <HelpCircleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                  <span>PNR &amp; Rail FAQs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Air & Hotel Tools */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              <PlaneIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Air &amp; Hotel Tools</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/tools/air#baggage"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <LuggageIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Flight Baggage Allowance</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/air#buffer"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <ClockIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Airport Arrival Buffer Planner</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#gst-calculator"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <CalculatorIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Hotel Tariff &amp; GST Calculator</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#transit-planner"
                  className="inline-flex items-center gap-2 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
                >
                  <HotelIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                  <span>Check-in &amp; Transit Stay Guide</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Editorial Guides */}
          <div>
            <h3 className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-ink">
              <BookOpenIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Travel Guides</span>
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RAIL_BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="line-clamp-1 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
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
              className="inline-flex items-center gap-1.5 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>Air</span>
            </Link>
            <Link
              href="/rail/pnr-status"
              className="inline-flex items-center gap-1.5 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              <TicketIcon className="h-3.5 w-3.5" />
              <span>PNR Status</span>
            </Link>
            <Link
              href="/rail/live-status"
              className="inline-flex items-center gap-1.5 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              <RadarLiveIcon className="h-3.5 w-3.5" />
              <span>Live Train</span>
            </Link>
            <Link
              href="/tools/hotel"
              className="inline-flex items-center gap-1.5 text-ink-soft transition hover:text-orange-600 dark:hover:text-amber-300"
            >
              <HotelIcon className="h-3.5 w-3.5" />
              <span>Hotel</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
