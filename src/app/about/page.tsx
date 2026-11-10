import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  HotelIcon,
  PlaneIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "@/components/Icons";

export const metadata: Metadata = {
  title:
    "About TravelAdda | India's Real-Time Flight, Train, PNR & Hotel Utility Portal",
  description:
    "Learn about TravelAdda—our mission, real-time aviation and railway data architecture, editorial team, and commitment to fast, distraction-free Indian & global travel intelligence.",
  keywords: [
    "about traveladda",
    "traveladda india",
    "live flight and train status platform",
    "indian railways pnr and flight tracker team",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About TravelAdda | Real-Time Flight, Train & Stay Intelligence",
    description:
      "Meet the aviation, railway, and hospitality specialists behind TravelAdda's live trackers and travel guides.",
    url: "/about",
    siteName: "TravelAdda",
    locale: "en_IN",
    type: "website",
  },
};

const EDITORIAL_TEAM = [
  {
    name: "Capt. Vikramaditya Rao",
    role: "Aviation Operations & Network Analyst",
    bio: "Specializes in commercial airline scheduling, multi-terminal airport turnarounds (DEL, BOM, BLR), inbound aircraft rotation tracking, and DGCA Civil Aviation Requirements (CAR).",
    focus: "Airlines, Terminals & Flight Delay Intelligence",
  },
  {
    name: "Aarav Deshmukh",
    role: "Lead Rail Infrastructure & Rolling Stock Analyst",
    bio: "Focuses on Indian Railways CRIS/PRS reservation logic, LHB & Vande Bharat EMU rolling stock, waitlist quota confirmation math, and NTES real-time train operations.",
    focus: "Indian Railways PNR, Charting & Live Train Status",
  },
  {
    name: "Meera Nair",
    role: "Destination & Hospitality Strategist",
    bio: "Covers Indian hotel GST taxation slabs, family resort and heritage homestay evaluations, seasonal winter/monsoon itineraries, and budget international travel from Indian metros.",
    focus: "Hotels, Homestays & Destination Planning",
  },
];

export default async function AboutPage() {
  "use cache";
  cacheLife("days");

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        name: "About TravelAdda",
        url: "https://traveladda.in/about",
        description:
          "TravelAdda is an independent Indian travel utility and editorial platform offering Live Flight Status, Live Train Running Status, 10-Digit PNR verification, and Hotel GST tools.",
        mainEntity: {
          "@type": "Organization",
          name: "TravelAdda",
          url: "https://traveladda.in",
          logo: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
          foundingDate: "2025",
          areaServed: "IN",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "support@traveladda.in",
              availableLanguage: ["English", "Hindi"],
            },
            {
              "@type": "ContactPoint",
              contactType: "editorial & press",
              email: "editorial@traveladda.in",
              availableLanguage: ["English"],
            },
          ],
        },
      },
    ],
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd).replace(/</g, "\\u003c"),
        }}
      />

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
            <span className="font-semibold text-white">About Us</span>
          </nav>

          <div className="mt-4 max-w-3xl">
            <span className="inline-block rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Our Mission &amp; Standards
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Built to Make Indian Air, Rail &amp; Hotel Travel Clear, Fast &amp; Stress-Free
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              TravelAdda is an independent travel technology and editorial
              portal engineered for flyers, Indian Railways passengers, and
              holidaymakers who want instant operational answers without pop-up
              clutter.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-5xl space-y-8 px-4 sm:mt-10 sm:px-6 lg:px-8">
        {/* Core Pillars */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-card p-5 shadow-2xs">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
              <PlaneIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">
              500+ Airlines Tracked
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Real-time terminal, boarding gate, baggage carousel, and airborne
              telemetry across domestic &amp; international carriers.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card p-5 shadow-2xs">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <TrainIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">
              Live GPS Rail Radar
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Station-by-station running status, delay minutes, platform
              numbers, and exact coach sequence from the locomotive.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card p-5 shadow-2xs">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#fc6203] dark:bg-orange-500/15 dark:text-orange-300">
              <TicketIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">
              10-Digit PNR Decoder
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Human-readable CNF, RAC, and Waitlist quota translation so you
              never have to guess what C8U/71/WS/GN means.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card p-5 shadow-2xs">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              <HotelIcon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-bold text-ink">
              Transparent Stay Math
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Instant 0%, 12%, and 18% Indian hotel GST calculators, airport
              buffer planners, and verified research guides.
            </p>
          </div>
        </section>

        {/* Story & Architecture */}
        <section className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          <h2 className="text-lg font-extrabold text-ink sm:text-2xl">
            Why We Built TravelAdda
          </h2>
          <div className="mt-3 space-y-3.5 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
            <p>
              Checking whether your flight is departing from Delhi Terminal 1D
              or Terminal 3, finding out where your Vande Bharat or Rajdhani
              coach will halt on the platform, or verifying whether your
              10-digit PNR has cleared the chart should take less than five
              seconds. Yet most travel sites bury critical live status data
              beneath intrusive pop-ups, cryptic railway abbreviations, and slow
              redirects.
            </p>
            <p>
              We engineered <strong>TravelAdda</strong> around three core
              principles: <strong>Speed, Clarity, and Privacy</strong>. Our
              server-to-server API architecture fetches live aviation and
              railway telemetry on demand, enriches raw codes (such as IATA
              carrier prefixes, LHB coach IDs, berth codes, and waitlist pools)
              into plain English, and presents them in a high-contrast interface
              that works seamlessly in bright daylight at a railway platform or
              in dark mode aboard a night flight.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Privacy-First Lookups",
                text: "We do not store your personal 10-digit PNR numbers or passenger names in any public database. Recent searches stay strictly in your own browser's local storage.",
              },
              {
                title: "Human-Verified Guides",
                text: "Every destination, airfare, railway charting, and hotel GST article is researched and reviewed by domain specialists—never auto-generated spam.",
              },
              {
                title: "Independent & Unbiased",
                text: "Our flight vs train comparisons, hotel vs Airbnb breakdowns, and airline baggage guides give you honest door-to-door math.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-line bg-subcard/70 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.title}</span>
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial & Domain Experts (E-E-A-T) */}
        <section className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-400">
                Editorial &amp; Domain Leadership
              </span>
              <h2 className="mt-1 text-lg font-extrabold text-ink sm:text-2xl">
                Meet Our Research &amp; Editorial Team
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                Every guide on TravelAdda is authored and fact-checked against
                official DGCA, Indian Railways, and GST Council notifications.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
            >
              <span>Read Editorial Guides</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {EDITORIAL_TEAM.map((member) => (
              <div
                key={member.name}
                className="flex flex-col justify-between rounded-xl border border-line bg-subcard/60 p-5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1956b4] text-sm font-bold text-white">
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">
                        {member.name}
                      </h3>
                      <p className="text-[11px] font-medium text-ink-muted">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                    {member.bio}
                  </p>
                </div>
                <div className="mt-4 border-t border-line pt-2.5">
                  <span className="text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
                    Coverage: {member.focus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Official Independence & Commercial Disclosure */}
        <section className="rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Official Independence &amp; Commercial Transparency
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                TravelAdda (<strong>traveladda.in</strong>) is an privately
                operated travel information and utility portal. We are{" "}
                <strong>not affiliated with</strong> the Ministry of Railways,
                IRCTC, CRIS, NTES, the Directorate General of Civil Aviation
                (DGCA), Airports Authority of India (AAI), or any individual
                airline. All airline names, IATA codes, logos, and train names
                are used strictly for informational identification to help
                passengers track their journeys accurately.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
                <Link
                  href="/privacy-policy"
                  className="text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  Read Privacy Policy →
                </Link>
                <Link
                  href="/terms"
                  className="text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  Terms &amp; Disclaimer →
                </Link>
                <Link
                  href="/contact"
                  className="text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  Contact Our Team →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

