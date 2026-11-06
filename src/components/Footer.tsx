import Link from "next/link";
import { FLIGHT_BLOG_POSTS, RAIL_BLOG_POSTS } from "@/lib/blog-data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-band text-ink-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-3">
            <Logo size="lg" />
            <p className="text-xs leading-relaxed text-ink-muted sm:text-sm">
              Fast, distraction-free Indian &amp; global travel tools. Check
              live flight status, terminals &amp; gates, spot Indian Railways
              trains live, verify 10-digit PNR seats, and plan hotel budgets.
            </p>
          </div>

          {/* Flight & Airport Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Flights &amp; Airports
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/air/flight-status"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Live Flight Status Tracker
                </Link>
              </li>
              <li>
                <Link
                  href="/air/flight-status#airlines-directory"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Airline Directory &amp; Helplines
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/air#baggage"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Cabin &amp; Check-in Baggage Rules
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/air#buffer"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Airport Arrival Time Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Trains & Hotels */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Trains &amp; Stays
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/rail/live-status"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Live Train Running Status
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  10-Digit PNR Status Check
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/pnr-status#decoder"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Coach &amp; Berth Decoder
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel#gst-calculator"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Hotel Room &amp; GST Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Travel Guides */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Popular Guides
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ...FLIGHT_BLOG_POSTS.slice(0, 3),
                ...RAIL_BLOG_POSTS.slice(0, 1),
              ].map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="line-clamp-1 text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
                >
                  View all guides →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>© 2026 TravelAdda. Simple, accurate Flight, Train &amp; Hotel tools.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/air/flight-status" className="hover:text-ink">
              Flight Status
            </Link>
            <Link href="/rail/live-status" className="hover:text-ink">
              Train Status
            </Link>
            <Link href="/rail/pnr-status" className="hover:text-ink">
              PNR Status
            </Link>
            <Link href="/blog" className="hover:text-ink">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
