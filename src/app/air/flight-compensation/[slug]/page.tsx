import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DgcaCompensationChecker } from "@/components/DgcaCompensationChecker";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  PlaneIcon,
  ShieldCheckIcon,
} from "@/components/Icons";
import {
  buildAirlineCompensationPath,
  DGCA_AIRLINE_PROFILES,
  findAirlineCompensationBySlug,
} from "@/lib/dgca-compensation-types";

interface AirlineCompensationPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DGCA_AIRLINE_PROFILES.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: AirlineCompensationPageProps): Promise<Metadata> {
  "use cache";
  cacheLife("days");

  const { slug } = await params;
  const airline = findAirlineCompensationBySlug(slug);
  if (!airline) {
    return {
      title: "Airline Compensation Guide Not Found | TravelAdda",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildAirlineCompensationPath(airline.slug);
  const title = `${airline.name} (${airline.code}) Flight Delay, Cancellation & Plan B Refund Compensation Calculator`;
  const description = `Is your ${airline.name} (${airline.code}) flight delayed or cancelled? Check ${airline.name} Plan B zero-fee refund rules, ₹5,000–₹20,000 DGCA compensation slabs, free hotel/meal rights, and ${airline.name} Nodal Officer email (${airline.nodalOfficer.email}).`;

  return {
    title,
    description,
    keywords: [
      `${airline.name.toLowerCase()} flight cancelled refund`,
      `${airline.name.toLowerCase()} flight delay compensation`,
      `${airline.name.toLowerCase()} plan b rules`,
      `${airline.name.toLowerCase()} nodal officer email`,
      `${airline.code.toLowerCase()} flight delayed 6 hours refund`,
      `${airline.name.toLowerCase()} denied boarding compensation`,
      `${airline.name.toLowerCase()} lost baggage compensation`,
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | TravelAdda`,
      description,
      url: `https://traveladda.in${canonicalPath}`,
      siteName: "TravelAdda",
      locale: "en_IN",
      type: "article",
    },
  };
}

export default async function AirlineCompensationSlugPage({
  params,
}: AirlineCompensationPageProps) {
  "use cache";
  cacheLife("days");

  const { slug } = await params;
  const airline = findAirlineCompensationBySlug(slug);
  if (!airline) {
    notFound();
  }

  const canonicalPath = buildAirlineCompensationPath(airline.slug);
  const faqs = [
    {
      q: `How do I claim a 100% full refund or Plan B rebooking if my ${airline.name} (${airline.code}) flight is delayed or cancelled?`,
      a: `Under DGCA CAR Section 3, Series M, Part IV, if your ${airline.name} flight is cancelled or delayed by 6 hours or more, you are legally entitled to a 100% full refund with zero cancellation fee OR a free alternate flight (${airline.name} Plan B). If ${airline.name} cancels your flight less than 24 hours before departure due to operational reasons, you can also claim ₹5,000 to ₹10,000 in statutory cash compensation.`,
    },
    {
      q: `What is the official Nodal Officer & Appellate Authority email ID for ${airline.name} (${airline.code})?`,
      a: `For unresolved ${airline.name} refund or DGCA compensation claims, email the ${airline.nodalOfficer.name} at ${airline.nodalOfficer.email} (Helpline: ${airline.nodalOfficer.phone}) and copy the Appellate Authority at ${airline.appellateAuthority.email}, or file an escalation on the Ministry of Civil Aviation AirSewa portal.`,
    },
    {
      q: `What is ${airline.name}'s baggage allowance and lost baggage compensation limit?`,
      a: `${airline.baggagePolicyNote} Under DGCA Passenger Charter rules, domestic checked baggage loss or damage is compensated up to ₹20,000 per passenger (₹350/kg), and international flights are covered up to 1,288 SDR (~₹1,45,000) under the Montreal Convention.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://traveladda.in/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "DGCA Flight Compensation",
            item: "https://traveladda.in/air/flight-compensation",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${airline.name} (${airline.code}) Compensation & Refund Rules`,
            item: `https://traveladda.in${canonicalPath}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <main className="pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Navy Hero */}
      <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span>/</span>
              <Link href="/air/flight-compensation" className="hover:text-white">
                DGCA Compensation
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">
                {airline.name} ({airline.code})
              </span>
            </nav>

            <Link
              href="/air/flight-status"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/15"
            >
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>Track Live {airline.name} Flights</span>
            </Link>
          </div>

          <div className="mt-4 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>
                {airline.name} ({airline.code}) · {airline.type}
              </span>
            </span>
            <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
              {airline.name} ({airline.code}) Flight Delay, Cancellation &amp;
              Plan B Refund Compensation Calculator
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
              Calculate your exact {airline.name} DGCA compensation (₹5,000 to
              ₹20,000), check 6-hour delay full refund rules, and generate a
              ready-to-send claim email for {airline.name}&apos;s Nodal Officer
              ({airline.nodalOfficer.email}).
            </p>
          </div>
        </div>
      </section>

      {/* Pre-selected Calculator */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-2xl border border-line bg-card p-6" />
          }
        >
          <DgcaCompensationChecker initialAirlineCode={airline.code} />
        </Suspense>
      </section>

      {/* Other Airlines Cross-Links */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Compare Other Airlines — DGCA Delay &amp; Cancellation Rules
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DGCA_AIRLINE_PROFILES.filter((a) => a.code !== airline.code).map(
            (other) => (
              <Link
                key={other.code}
                href={buildAirlineCompensationPath(other.slug)}
                className="flex items-center justify-between rounded-xl border border-line bg-card px-3.5 py-3 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4]"
              >
                <span className="truncate">
                  {other.name} ({other.code}) Rules
                </span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Airline FAQ */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:mt-16 sm:px-6 lg:px-8">
        <h2 className="text-lg font-extrabold text-ink sm:text-xl">
          Frequently Asked Questions — {airline.name} ({airline.code}) Refunds
          &amp; DGCA Compensation
        </h2>
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {faqs.map((faq, idx) => (
            <details
              key={faq.q}
              open={idx === 0}
              className="group p-4 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
                <span>{faq.q}</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-2.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

