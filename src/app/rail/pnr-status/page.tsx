import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
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
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    desc: "Full seat or sleeping berth guaranteed. Coach & berth appear immediately or upon chart preparation.",
  },
  {
    code: "RAC",
    title: "Reservation Against Cancellation",
    chance: "Boarding Allowed",
    badge:
      "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300",
    desc: "Permitted to board. Shares a side-lower seat initially and upgrades to a full berth as cancellations occur.",
  },
  {
    code: "GNWL",
    title: "General Waiting List",
    chance: "High Priority",
    badge:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    desc: "Origin-station general pool with the largest seat allocation and fastest confirmation movement.",
  },
  {
    code: "RLWL / PQWL",
    title: "Remote / Pooled Waitlist",
    chance: "Moderate Priority",
    badge:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    desc: "Quota reserved for intermediate boarding stations; clears when passengers on that route leg cancel.",
  },
  {
    code: "TQWL",
    title: "Tatkal Waiting List",
    chance: "Last-Minute Pool",
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    desc: "Booked during the 10 AM / 11 AM Tatkal window; jumps directly to CNF if confirmed Tatkal seats cancel.",
  },
  {
    code: "NOSB / CAN",
    title: "Child No-Seat / Cancelled",
    chance: "Special Status",
    badge: "bg-subcard text-ink-soft",
    desc: "NOSB applies to children aged 5–11 travelling without a separate berth; CAN denotes a cancelled passenger.",
  },
];

function PnrCheckerFallback() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-md">
      <div className="h-14 animate-pulse rounded-xl bg-subcard" />
    </div>
  );
}

export default async function PnrStatusPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-16 sm:pb-24">
      {/* Clean Compact Navy Banner */}
      <section className="ta-navy-hero pb-12 pt-5 sm:pb-16 sm:pt-7">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">PNR Status</span>
            </nav>

            <Link
              href="/rail/live-status"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
            >
              <TrainIcon className="h-3.5 w-3.5" />
              <span>Spot Train Live</span>
            </Link>
          </div>

          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              IRCTC PNR Status — Check 10-Digit Confirmation
            </h1>
            <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
              Check real-time CNF, RAC, or Waitlist status, coach &amp; berth
              numbers, and reservation chart updates across Indian Railways.
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping PNR Checker */}
      <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense fallback={<PnrCheckerFallback />}>
          <PnrChecker />
        </Suspense>

        <div className="mt-4 grid gap-2.5 rounded-xl border border-line bg-card px-4 py-3 text-xs font-medium text-ink-soft sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Instant coach &amp; berth verification</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
            <span>1st &amp; 2nd reservation chart tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4 shrink-0 text-[#0d9458] dark:text-emerald-400" />
            <span>Supports all 17 Indian Railway zones</span>
          </div>
        </div>
      </section>

      {/* Ticket Status & Berth Code Decoder */}
      <section
        id="decoder"
        className="mx-auto mt-12 max-w-5xl scroll-mt-24 px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div>
          <h2 className="text-lg font-extrabold text-ink sm:text-xl">
            IRCTC Ticket Status &amp; Berth Codes Explained
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
            Understand CNF, RAC, GNWL, RLWL, TQWL, and coach abbreviations on
            your ticket slip.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WAITLIST_PRIORITY_CARDS.map((card) => (
            <div
              key={card.code}
              className="rounded-xl border border-line bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${card.badge}`}
                >
                  {card.code}
                </span>
                <span className="text-[11px] font-semibold text-ink-muted">
                  {card.chance}
                </span>
              </div>
              <h3 className="mt-2.5 text-sm font-bold text-ink">{card.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Seat &amp; Berth Position Codes
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(BERTH_CODE_MAP).map(([code, label]) => (
                <div
                  key={code}
                  className="flex items-center gap-2 rounded-lg bg-subcard px-2.5 py-1.5"
                >
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {code}
                  </span>
                  <span className="font-medium text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Indian Railways Coach Classes
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(RAILWAY_CLASS_MAP)
                .slice(0, 10)
                .map(([code, label]) => (
                  <div
                    key={code}
                    className="flex items-center gap-2 rounded-lg bg-subcard px-2.5 py-1.5"
                  >
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {code}
                    </span>
                    <span className="truncate font-medium text-ink-soft">
                      {label.replace(` (${code})`, "")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clean Rail Guides Grid */}
      <section
        id="rail-blog"
        className="mx-auto mt-12 max-w-5xl scroll-mt-20 px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-ink sm:text-xl">
              Indian Railways PNR &amp; Travel Guides
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
              Practical articles on PNR digits, chart preparation timings, and
              waitlist confirmation rules.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
          >
            All Guides →
          </Link>
        </div>

        <div className="mt-4 grid gap-3.5 md:grid-cols-3">
          {RAIL_BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-card p-4 transition hover:border-[#1956b4] hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-ink-muted">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-400">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
                <ul className="mt-3 space-y-1.5 border-t border-line pt-2.5">
                  {post.keyTakeaways.slice(0, 2).map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-1.5 text-[11px] text-ink-soft"
                    >
                      <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-clamp-2">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] dark:text-blue-400">
                <span>Read Guide</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Clean Divider FAQ Accordion */}
      <section
        id="faq"
        className="mx-auto mt-12 max-w-4xl scroll-mt-24 px-4 sm:mt-16 sm:px-6 lg:px-8"
      >
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — IRCTC PNR Status
        </h2>

        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {PNR_FAQ_ITEMS.map((faq, idx) => (
            <details key={faq.question} open={idx === 0} className="group p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                <span>{faq.question}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
