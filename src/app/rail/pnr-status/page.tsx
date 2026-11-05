import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
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
    tone: "bg-emerald-50 text-emerald-950 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800/60",
    badge: "bg-emerald-700 text-white dark:bg-emerald-600",
    desc: "Full seat or sleeping berth guaranteed. Coach & berth appear immediately or upon chart preparation.",
  },
  {
    code: "RAC",
    title: "Reservation Against Cancellation",
    chance: "Board Guaranteed",
    tone: "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/60",
    badge: "bg-amber-700 text-white dark:bg-amber-600",
    desc: "Permitted to board! Shares a side-lower seat initially and upgrades to a full berth as cancellations/no-shows occur.",
  },
  {
    code: "GNWL",
    title: "General Waiting List",
    chance: "High Priority",
    tone: "bg-teal-50 text-teal-950 border-teal-200 dark:bg-teal-950/40 dark:text-teal-100 dark:border-teal-800/60",
    badge: "bg-teal-700 text-white dark:bg-teal-600",
    desc: "Origin-station general pool with the largest seat allocation and fastest confirmation movement.",
  },
  {
    code: "RLWL / PQWL",
    title: "Remote / Pooled Waitlist",
    chance: "Moderate Priority",
    tone: "bg-indigo-50 text-indigo-950 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800/60",
    badge: "bg-indigo-700 text-white dark:bg-indigo-600",
    desc: "Quota reserved for intermediate boarding stations; clears when passengers on that route leg cancel.",
  },
  {
    code: "TQWL",
    title: "Tatkal Waiting List",
    chance: "Last-Minute Pool",
    tone: "bg-rose-50 text-rose-950 border-rose-200 dark:bg-rose-950/40 dark:text-rose-100 dark:border-rose-800/60",
    badge: "bg-rose-700 text-white dark:bg-rose-600",
    desc: "Booked during the 10 AM / 11 AM Tatkal window; jumps directly to CNF if confirmed Tatkal seats cancel.",
  },
  {
    code: "NOSB / CAN",
    title: "Child No-Seat / Cancelled",
    chance: "Special Status",
    tone: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800/70 dark:text-slate-100 dark:border-slate-700",
    badge: "bg-slate-800 text-white dark:bg-slate-700",
    desc: "NOSB applies to children aged 5–11 travelling without a separate berth; CAN denotes a cancelled passenger.",
  },
];

function PnrCheckerFallback() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="h-6 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="h-14 flex-1 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-14 w-48 animate-pulse rounded-2xl bg-indigo-200 dark:bg-indigo-900" />
      </div>
    </div>
  );
}

export default async function PnrStatusPage() {
  "use cache";
  cacheLife("hours");

  return (
    <main className="pb-20">
      {/* Light / Dark Compatible Rail Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-indigo-50/70 bg-gradient-to-br from-indigo-50 via-white to-sky-50 pb-24 pt-12 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-indigo-950/85 dark:to-slate-900 sm:pb-28 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-12 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-12 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/15"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
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
            <span>Rail</span>
            <span>/</span>
            <span className="font-bold text-indigo-700 dark:text-sky-300">
              PNR Status
            </span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/25 bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>INDIAN RAILWAYS LIVE PRS TRACKER</span>
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Check Your 10-Digit{" "}
              <span className="text-indigo-600 dark:text-sky-400">
                PNR Status
              </span>{" "}
              Instantly
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
              Get real-time seat confirmation, coach &amp; berth numbers,
              reservation chart updates, and quota details powered by
              TravelAdda&apos;s owned rail API — plus in-depth Indian Railways
              travel guides below.
            </p>
          </div>
        </div>
      </section>

      {/* Overlapping Live PNR Checker Tool */}
      <section className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <Suspense fallback={<PnrCheckerFallback />}>
          <PnrChecker />
        </Suspense>

        {/* Owned API Architecture Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs text-slate-700 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white dark:bg-slate-800 dark:text-sky-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>API-TO-API</span>
            </span>
            <span>
              Powered by TravelAdda&apos;s owned backend route{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-900 dark:bg-slate-800 dark:text-sky-300">
                /api/pnr/[pnr]
              </code>{" "}
              with live server-to-server PRS synchronization.
            </span>
          </div>
        </div>
      </section>

      {/* Ticket Status & Berth Code Decoder */}
      <section
        id="decoder"
        className="mx-auto mt-20 max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-sky-400">
            INSTANT TICKET DECODER
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            What do CNF, RAC, GNWL &amp; berth codes mean?
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Every abbreviation on your Indian Railways PNR slip explained
            clearly before you head to the station.
          </p>
        </div>

        {/* Status Priority Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WAITLIST_PRIORITY_CARDS.map((card) => (
            <div
              key={card.code}
              className={`rounded-2xl border p-5 ${card.tone}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold ${card.badge}`}
                >
                  {card.code}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {card.chance}
                </span>
              </div>
              <h3 className="mt-3 text-base font-extrabold">{card.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed opacity-90">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Berth & Class Quick Reference Pill Boards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Seat &amp; Berth Position Codes
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {Object.entries(BERTH_CODE_MAP).map(([code, label]) => (
                <div
                  key={code}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80"
                >
                  <span className="rounded bg-indigo-600 px-2 py-0.5 font-mono font-bold text-white dark:bg-indigo-500/30 dark:text-sky-300">
                    {code}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Indian Railways Coach Classes
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {Object.entries(RAILWAY_CLASS_MAP)
                .slice(0, 10)
                .map(([code, label]) => (
                  <div
                    key={code}
                    className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80"
                  >
                    <span className="rounded bg-teal-700 px-2 py-0.5 font-mono font-bold text-white dark:bg-teal-500/30 dark:text-teal-200">
                      {code}
                    </span>
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
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
        className="mt-20 scroll-mt-20 border-y border-slate-200 bg-white py-20 transition-colors dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-400">
                RAILWAY INSIGHTS &amp; TRAVEL BLOG
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Essential Indian Rail Guides &amp; PNR Deep-Dives
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Everything seasoned Indian train travellers know about PNR
                digits, charting windows, waitlist pools, and Double Decker /
                Vande Bharat coaches.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-extrabold text-indigo-800 dark:bg-indigo-500/20 dark:text-sky-300">
              {RAIL_BLOG_POSTS.length} Editorial Guides
            </span>
          </div>

          {/* Light & Dark Compatible Story Cards */}
          <div className="mt-12 space-y-10">
            {RAIL_BLOG_POSTS.map((post, index) => (
              <article
                key={post.slug}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="grid lg:grid-cols-[1fr_1.45fr]">
                  {/* Left Story Cover (Crisp Indigo Tint in Light Mode / Deep Sapphire in Dark Mode) */}
                  <div className="flex flex-col justify-between border-b border-indigo-100 bg-indigo-50/75 bg-gradient-to-br from-indigo-50 via-sky-50/70 to-white p-7 text-slate-900 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-900 dark:text-white sm:p-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                        <span className="rounded-full bg-indigo-600 px-3 py-1 text-white dark:bg-sky-500/20 dark:text-sky-200 dark:ring-1 dark:ring-sky-400/30">
                          0{index + 1} · {post.category}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="mt-5 text-2xl font-black leading-snug text-slate-950 dark:text-white">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-indigo-600 dark:hover:text-sky-300"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-indigo-200/70 pt-4 text-xs dark:border-white/15">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {post.author.name}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {post.author.role} · {post.publishedDate}
                      </p>
                    </div>
                  </div>

                  {/* Right Substantive In-Page Blog Content */}
                  <div className="flex flex-col justify-between bg-white p-7 dark:bg-slate-900 sm:p-8">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-sky-400">
                        Key Takeaways
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {post.keyTakeaways.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                          >
                            <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      {post.sections[0] && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {post.sections[0].heading}
                          </h4>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300 sm:text-sm">
                            {post.sections[0].paragraphs[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {post.heroTagline}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600 dark:text-sky-400">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Common Questions About Indian Railways PNR Status
          </h2>
        </div>

        <div className="mt-10 space-y-3.5">
          {PNR_FAQ_ITEMS.map((faq, idx) => (
            <details
              key={faq.question}
              open={idx === 0}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-slate-900 dark:text-white sm:text-base">
                <span>{faq.question}</span>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-open:rotate-45 group-open:bg-indigo-100 group-open:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:group-open:bg-indigo-500/20 dark:group-open:text-sky-300">
                  +
                </span>
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
