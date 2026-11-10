import Link from "next/link";
import { FEATURED_SEO_BLOG_POSTS } from "@/lib/blog-data";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-band text-ink-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-3 lg:col-span-1">
            <Logo size="lg" />
            <p className="text-xs leading-relaxed text-ink-muted">
              Fast, distraction-free Indian &amp; global travel tools. Check
              live flight status, terminals &amp; gates, spot Indian Railways
              trains live, verify 10-digit PNR seats, and calculate hotel GST.
            </p>
          </div>

          {/* Flight & Airport Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Air Tools
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
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
                  href="/tools/air"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Baggage &amp; Arrival Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Trains & Hotels */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Rail &amp; Hotel Tools
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
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
                  10-Digit PNR Status Checker
                </Link>
              </li>
              <li>
                <Link
                  href="/rail/chart-time"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Train Chart Preparation Time
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/hotel"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Hotel Room GST Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Travel Guides */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              2026–27 Travel Guides
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
              {FEATURED_SEO_BLOG_POSTS.slice(0, 4).map((post) => (
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
                  View all 19 guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company, Legal & Commercial Compliance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Company &amp; Legal
            </h3>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  About TravelAdda
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="font-medium text-ink-soft transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Terms &amp; Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-ink-muted transition hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  XML Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row">
          <p>
            © 2026 TravelAdda (traveladda.in). Independent Flight, Train, PNR
            &amp; Hotel Utility Portal.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/tools" className="hover:text-ink">
              All Tools
            </Link>
            <Link href="/about" className="hover:text-ink">
              About Us
            </Link>
            <Link href="/privacy-policy" className="hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-ink">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
