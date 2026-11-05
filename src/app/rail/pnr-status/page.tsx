import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  TrainIcon,
} from "@/components/Icons";
import { PnrChecker } from "@/components/PnrChecker";
import { PNR_FAQ_ITEMS, RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { BERTH_CODE_MAP, RAILWAY_CLASS_MAP } from "@/lib/pnr-types";

export const metadata: Metadata = {
  title: "Live Indian Railways PNR Status Check & Rail Travel Guides",
  description:
    "Check real-time 10-digit Indian Railways PNR status, coach & berth numbers, chart preparation updates, and read expert rail travel blog guides on TravelAdda.",
};

const WAITLIST_PRIORITY_CARDS = [
  {
    code: "CNF",
    title: "Confirmed Seat / Berth",
    chance: "100% Confirmed",
    badge: "bg-amber-500/20 text-amber-900 dark:text-amber-300",
    border: "border-amber-500/30",
    desc: "Full seat or sleeping berth guaranteed. Coach & berth appear immediately or upon chart preparation.",
  },
  {
    code: "RAC",
    title: "Reservation Against Cancellation",
    chance: "Board Guaranteed",
    badge: "bg-orange-500/18 text-orange-800 dark:text-orange-300",
    border: "border-orange-500/30",
    desc: "Permitted to board! Shares a side-lower seat initially and upgrades to a full berth as cancellations/no-shows occur.",
  },
  {
    code: "GNWL",
    title: "General Waiting List",
    chance: "High Priority",
    badge: "bg-yellow-500/20 text-amber-900 dark:text-yellow-300",
    border: "border-yellow-500/30",
    desc: "Origin-station general pool with the largest seat allocation and fastest confirmation movement.",
  },
  {
    code: "RLWL / PQWL",
    title: "Remote / Pooled Waitlist",
    chance: "Moderate Priority",
    badge: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
    border: "border-orange-500/25",
    desc: "Quota reserved for intermediate boarding stations; clears when passengers on that route leg cancel.",
  },
  {
    code: "TQWL",
    title: "Tatkal Waiting List",
    chance: "Last-Minute Pool",
    badge: "bg-rose-500/18 text-rose-800 dark:text-rose-300",
    border: "border-rose-500/25",
    desc: "Booked during the 10 AM / 11 AM Tatkal window; jumps directly to CNF if confirmed Tatkal seats cancel.",
  },
  {
    code: "NOSB / CAN",
    title: "Child No-Seat / Cancelled",
    chance: "Special Status",
    badge: "bg-subcard text-ink",
    border: "border-line",
    desc: "NOSB applies to children aged 5–11 travelling without a separate berth; CAN denotes a cancelled passenger.",
  },
];

function PnrCheckerFallback() {
  return (
    <div className="rounded-3xl border border-line bg-card p-7 shadow-xl">
      <div className="h-6 w-64 animate-pulse rounded-lg bg-subcard" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="h-14 flex-1 animate-pulse rounded-2xl bg-subcard" />
        <div className="h-14 w-48 animate-pulse rounded-2xl bg-subcard" />
      </div>
    </div>
  );
}

export default async function PnrStatusPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-20">
      {/* Warm Sunset / Golden Rail Hero Banner */}
      <section className="ta-hero relative overflow-hidden pb-24 pt-12 sm:pb-28 sm:pt-16">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
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
            <span>Rail</span>
            <span className="text-ink-muted">/</span>
            <span className="font-bold text-orange-700 dark:text-amber-300">
              PNR Status
            </span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3.5 py-1 text-xs font-bold text-orange-700 dark:text-amber-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500 dark:bg-amber-400" />
              <span>INDIAN RAILWAYS LIVE PRS TRACKER</span>
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl">
              Check Your 10-Digit{" "}
              <span className="text-orange-600 dark:text-amber-400">
                PNR Status
              </span>{" "}
              Instantly
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              Get real-time seat confirmation, coach &amp; berth positions,
              reservation chart updates, and passenger quota details in seconds
              — followed by practical Indian Railways travel guides below.
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping Live PNR Checker Tool */}
      <section className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <Suspense fallback={<PnrCheckerFallback />}>
          <PnrChecker />
        </Suspense>

        {/* Traveller Highlights Strip */}
        <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-card px-5 py-4 text-xs font-semibold text-ink-soft shadow-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
            <span>Instant Coach &amp; Berth Verification</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ClockIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
            <span>1st &amp; 2nd Reservation Chart Tracking</span>
          </div>
          <div className="flex items-center gap-2.5">
            <TrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
            <span>Supports All 17 Indian Railway Zones</span>
          </div>
        </div>
      </section>

      {/* Ticket Status & Berth Code Decoder */}
      <section
        id="decoder"
        className="mx-auto mt-20 max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            INSTANT TICKET DECODER
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            What do CNF, RAC, GNWL &amp; berth codes mean?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Every abbreviation on your Indian Railways PNR slip explained
            clearly before you head to the station.
          </p>
        </div>

        {/* Status Priority Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WAITLIST_PRIORITY_CARDS.map((card) => (
            <div
              key={card.code}
              className={`rounded-2xl border bg-card p-5 shadow-xs ${card.border}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold ${card.badge}`}
                >
                  {card.code}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  {card.chance}
                </span>
              </div>
              <h3 className="mt-3 text-base font-extrabold text-ink">
                {card.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Berth & Class Quick Reference Pill Boards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink">
              Seat &amp; Berth Position Codes
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {Object.entries(BERTH_CODE_MAP).map(([code, label]) => (
                <div
                  key={code}
                  className="flex items-center gap-2.5 rounded-xl bg-subcard px-3 py-2"
                >
                  <span className="rounded bg-orange-500/18 px-2 py-0.5 font-mono font-bold text-orange-800 dark:text-orange-300">
                    {code}
                  </span>
                  <span className="font-semibold text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-card p-6 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink">
              Indian Railways Coach Classes
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {Object.entries(RAILWAY_CLASS_MAP)
                .slice(0, 10)
                .map(([code, label]) => (
                  <div
                    key={code}
                    className="flex items-center gap-2.5 rounded-xl bg-subcard px-3 py-2"
                  >
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono font-bold text-amber-900 dark:text-amber-300">
                      {code}
                    </span>
                    <span className="truncate font-semibold text-ink-soft">
                      {label.replace(` (${code})`, "")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rich Editorial Rail Travel Blog Section on PNR Page */}
      <section
        id="rail-blog"
        className="mt-20 scroll-mt-20 border-y border-line bg-band py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
                RAILWAY INSIGHTS &amp; TRAVEL BLOG
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Essential Indian Rail Guides &amp; PNR Deep-Dives
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Everything seasoned Indian train travellers know about PNR
                digits, charting windows, waitlist pools, and Double Decker /
                Vande Bharat coaches.
              </p>
            </div>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/12 px-4 py-1.5 text-xs font-extrabold text-orange-700 dark:text-amber-300">
              {RAIL_BLOG_POSTS.length} Editorial Guides
            </span>
          </div>

          {/* Smooth Story Cards */}
          <div className="mt-12 space-y-10">
            {RAIL_BLOG_POSTS.map((post, index) => (
              <article
                key={post.slug}
                className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="grid lg:grid-cols-[1fr_1.45fr]">
                  {/* Left Story Cover */}
                  <div className="ta-ticket-header flex flex-col justify-between p-7 lg:border-b-0 lg:border-r lg:border-line sm:p-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                        <span className="rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-orange-800 dark:text-amber-200">
                          0{index + 1} · {post.category}
                        </span>
                        <span className="text-ink-muted">{post.readTime}</span>
                      </div>
                      <h3 className="mt-5 text-2xl font-black leading-snug text-ink">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition hover:text-orange-600 dark:hover:text-amber-300"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-line pt-4 text-xs">
                      <p className="font-bold text-ink">{post.author.name}</p>
                      <p className="text-ink-muted">
                        {post.author.role} · {post.publishedDate}
                      </p>
                    </div>
                  </div>

                  {/* Right Substantive In-Page Blog Content */}
                  <div className="flex flex-col justify-between bg-card p-7 sm:p-8">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-orange-600 dark:text-amber-400">
                        Key Takeaways
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {post.keyTakeaways.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 text-sm text-ink-soft"
                          >
                            <CheckCircleIcon className="mt-0.5 h-4 w-4 text-orange-600 dark:text-amber-400" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      {post.sections[0] && (
                        <div className="mt-5 rounded-2xl border border-line bg-subcard p-4">
                          <h4 className="text-sm font-extrabold text-ink">
                            {post.sections[0].heading}
                          </h4>
                          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                            {post.sections[0].paragraphs[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="text-xs font-semibold text-ink-muted">
                        {post.heroTagline}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="ta-btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold"
                      >
                        <span>Read Complete Article</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PNR Status FAQ Section */}
      <section
        id="faq"
        className="mx-auto mt-20 max-w-4xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-amber-400">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Common Questions About Indian Railways PNR Status
          </h2>
        </div>

        <div className="mt-10 space-y-3.5">
          {PNR_FAQ_ITEMS.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-line bg-card p-5 shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-ink sm:text-base">
                <span>{faq.question}</span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-subcard text-ink-soft transition group-open:rotate-45 group-open:bg-orange-500/20 group-open:text-orange-700 dark:group-open:text-amber-300">
                  +
                </span>
              </summary>
              <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
