import Link from "next/link";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Logo theme="dark" size="md" showTagline />
            <p className="text-sm leading-relaxed text-slate-400">
              India&apos;s clean, fast, clutter-free rail &amp; aviation travel portal.
              Track real-time Indian Railways PNR status, decode coach &amp; berth
              allocations, and plan smarter journeys.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400" />
              Owned PNR API Active (/api/pnr)
            </div>
          </div>

          {/* Rail & Air Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Travel Toolkit
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/rail/pnr-status"
                  className="inline-flex items-center gap-2 text-slate-300 transition hover:text-orange-400"
                >
                  <span>Live PNR Status Checker</span>
                  <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-300">
                    POPULAR
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status?pnr=2528012827"
                  className="text-slate-400 transition hover:text-white"
                >
                  Sample PNR Demo (2528012827)
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#decoder"
                  className="text-slate-400 transition hover:text-white"
                >
                  Berth &amp; Quota Code Decoder
                </Link>
              </li>
              <li>
                <Link
                  href="/#toolkit"
                  className="text-slate-400 transition hover:text-white"
                >
                  Flight Baggage &amp; Layover Guide
                </Link>
              </li>
              <li>
                <a
                  href="/api/pnr/2528012827"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition hover:text-teal-300"
                >
                  Owned PNR JSON Endpoint ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Editorial Guides */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Rail &amp; Travel Blog
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {RAIL_BLOG_POSTS.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="line-clamp-1 text-slate-400 transition hover:text-white"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Help & Corridors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Traveller Notes
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Reservation charts are typically prepared 4 hours before scheduled
              train departure (or the previous evening between 8:00 PM – 9:30 PM
              for morning trains).
            </p>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs font-semibold text-white">
                Need instant PNR verification?
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Works for IRCTC e-tickets &amp; PRS counter slips across all 17
                Indian Railway zones.
              </p>
              <Link
                href="/rail/pnr-status"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300"
              >
                Open PNR Tool →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 TravelAdda Portal. Crafted for effortless rail &amp; air journeys.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/" className="hover:text-slate-300">
              Home
            </Link>
            <Link href="/rail/pnr-status" className="hover:text-slate-300">
              PNR Status
            </Link>
            <Link href="/rail/pnr-status#faq" className="hover:text-slate-300">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

