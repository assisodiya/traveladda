import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { CheckCircleIcon, ShieldCheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title:
    "Privacy Policy | TravelAdda Data Protection, PNR Privacy & Cookie Policy",
  description:
    "Read TravelAdda's Privacy Policy covering how we protect 10-digit PNR & flight lookups, local browser storage, cookies, advertising & affiliate disclosures, and user rights under India's DPDP Act.",
  keywords: [
    "traveladda privacy policy",
    "pnr status privacy policy",
    "cookie and advertising policy traveladda",
    "dpdp act compliance travel portal",
  ],
  alternates: {
    canonical: "/privacy-policy",
  },
};

const PRIVACY_SECTIONS = [
  {
    id: "information-we-process",
    title: "1. Information We Process When You Use Our Tools",
    paragraphs: [
      "TravelAdda is designed so you can check Live Flight Status, Live Train Running Status, 10-Digit IRCTC PNR Status, Airline Baggage Rules, and Hotel GST Slabs without creating a mandatory user account or submitting sensitive personal identity documents.",
    ],
    bullets: [
      "Ephemeral PNR & Flight Lookups: When you enter a 10-digit railway PNR number, a 5-digit train number, or an airline flight number, our backend API processes the query in real time to return your live status. We do NOT permanently store your PNR number alongside your name, phone number, or email in any public or searchable database.",
      "Local Browser Storage (localStorage): For your convenience, your recent PNR searches, recent train lookups, and Light/Dark theme preference are saved locally inside your own web browser (localStorage). You can clear this history at any time with a single click using the 'Clear history' button on the tool card.",
      "Voluntary Contact Information: If you email our support, editorial, or partnership desks, we process your name, email address, and message contents solely to respond to your inquiry.",
    ],
  },
  {
    id: "cookies-and-analytics",
    title: "2. Cookies, Log Files & Analytics",
    paragraphs: [
      "Like all modern web portals, TravelAdda uses standard server log files and first-party/third-party analytics cookies to maintain site security, prevent automated bot abuse on our APIs, and understand which travel guides and tools are most helpful.",
    ],
    bullets: [
      "Technical & Security Logs: IP addresses (anonymized where applicable), browser user-agent strings, referring pages, and timestamps are logged briefly to enforce rate limits and protect our live flight and railway API endpoints.",
      "Performance & Analytics Cookies: Aggregated metrics such as page load speeds (Core Web Vitals), device screen categories, and popular routes help us improve mobile usability under slow railway or airport network conditions.",
    ],
  },
  {
    id: "advertising-and-affiliates",
    title: "3. Third-Party Advertising, Google AdSense & Affiliate Disclosure",
    paragraphs: [
      "To keep TravelAdda's live flight trackers, train radar, PNR decoders, and calculators 100% free for travellers, we may display contextual advertisements and partner booking links.",
    ],
    bullets: [
      "Google AdSense & Third-Party Ad Networks: Third-party vendors, including Google, use cookies (such as the Google Advertising / DART cookie) to serve ads based on a user's prior visits to TravelAdda or other websites on the internet.",
      "Opting Out of Personalized Ads: Users may opt out of personalized advertising at any time by visiting Google Ads Settings (https://myadcenter.google.com) or visiting www.aboutads.info.",
      "Commercial & Affiliate Links: Some travel guides or tool pages may contain referral links to licensed airlines, hotel booking platforms, or travel services. Clicking these links never increases the price you pay; if you complete a booking on an external partner site, that partner's own Privacy Policy and Terms govern your transaction.",
    ],
  },
  {
    id: "dpdp-and-user-rights",
    title:
      "4. Your Data Rights (Indian DPDP Act, 2023 & Global Privacy Standards)",
    paragraphs: [
      "In accordance with India's Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and applicable international privacy regulations (such as GDPR), you have the right to:",
    ],
    bullets: [
      "Access & Correction: Request confirmation of any personal data you have voluntarily shared with us via email and ask for corrections or updates.",
      "Erasure / Right to Be Forgotten: Request deletion of any support correspondence or contact records held by us.",
      "Clear Local Device Data: Clear your browser's localStorage and cookies at any time using our in-app 'Clear' controls or your browser settings.",
    ],
  },
  {
    id: "data-security-and-children",
    title: "5. Data Security & Children's Privacy",
    paragraphs: [
      "All communication between your browser and TravelAdda (traveladda.in) is encrypted over HTTPS/TLS. Our services are intended for general travel planning and are not directed toward children under the age of 18 without parental supervision. We do not knowingly collect personal information from minors.",
    ],
  },
  {
    id: "grievance-officer",
    title: "6. Grievance Redressal & Privacy Contact",
    paragraphs: [
      "In compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, if you have any questions, privacy concerns, or data requests regarding this Privacy Policy, please contact our Grievance & Data Protection Desk:",
      "Email: privacy@traveladda.in | General Support: support@traveladda.in | Response SLA: Within 48 hours of receipt.",
    ],
  },
];

export default async function PrivacyPolicyPage() {
  "use cache";
  cacheLife("days");

  const privacyJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "TravelAdda Privacy Policy",
    url: "https://traveladda.in/privacy-policy",
    dateModified: "2026-11-10",
    publisher: {
      "@type": "Organization",
      name: "TravelAdda",
      url: "https://traveladda.in",
    },
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="ta-navy-hero pb-10 pt-5 sm:pb-12 sm:pt-7">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-300"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-white">Privacy Policy</span>
          </nav>

          <div className="mt-4">
            <span className="inline-block rounded bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Effective &amp; Updated: November 10, 2026
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              Privacy Policy &amp; Data Protection Notice
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              How TravelAdda safeguards your 10-digit PNR searches, live flight
              lookups, browser storage, cookies, and privacy rights.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-4xl space-y-6 px-4 sm:mt-10 sm:px-6 lg:px-8">
        {/* Privacy At A Glance Box */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-5 dark:bg-emerald-500/10 sm:p-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Privacy-First Commitment at a Glance
            </h2>
          </div>
          <ul className="mt-3 grid gap-2.5 text-xs text-ink sm:grid-cols-2 sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                No account sign-up required to track flights, trains, or PNRs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Recent PNR/train searches stay only in your device&apos;s
                localStorage.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Compliant with India&apos;s DPDP Act 2023 &amp; Google Publisher
                Policies.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% HTTPS encrypted API-to-API status lookups.</span>
            </li>
          </ul>
        </div>

        {/* Policy Sections */}
        <article className="space-y-7 rounded-2xl border border-line bg-card p-6 shadow-xs sm:p-8">
          {PRIVACY_SECTIONS.map((sec) => (
            <section key={sec.id} id={sec.id} className="space-y-3">
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                {sec.title}
              </h2>
              {sec.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 32)}
                  className="text-xs leading-relaxed text-ink-soft sm:text-sm"
                >
                  {p}
                </p>
              ))}
              {sec.bullets && (
                <ul className="space-y-2 pt-1">
                  {sec.bullets.map((bullet) => (
                    <li
                      key={bullet.slice(0, 32)}
                      className="flex items-start gap-2.5 rounded-xl border border-line bg-subcard/70 p-3 text-xs leading-relaxed text-ink-soft sm:text-sm"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs">
            <span className="text-ink-muted">
              Have a question about your privacy or data?
            </span>
            <div className="flex flex-wrap gap-4 font-bold">
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
                Contact Grievance Desk →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

