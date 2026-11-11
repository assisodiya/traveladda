import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightIcon, ClockIcon, TrainIcon } from "@/components/Icons";
import { MetroRouteFinder } from "@/components/MetroRouteFinder";
import { METRO_BLOG_POSTS } from "@/lib/blog-data";
import { fetchCachedMetroNetworkSummary } from "@/lib/metro-service";
import {
    buildMetroLinePath,
    buildMetroRoutePath,
    buildMetroStationPath,
    POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";

export const metadata: Metadata = {
    title:
        "Delhi NCR Metro Route, Fare, Timing & Station Map (DMRC, Noida Aqua & Rapid Metro) | TravelAdda",
    description:
        "Check Delhi NCR Metro route, token & smart card fare, travel time, number of stops, platform direction, and interchanges across all 12 DMRC, Airport Express, Noida Aqua & Gurgaon Rapid Metro lines (262 stations).",
    keywords: [
        "Delhi Metro Route",
        "DMRC Route Planner",
        "Delhi Metro Fare Calculator",
        "Delhi NCR Metro Timings",
        "Delhi Metro Map Stations",
        "MG Road to Anand Vihar Metro Route",
        "Rajiv Chowk to Huda City Centre Metro",
        "New Delhi to IGI Airport Metro Route",
        "Noida Aqua Line Route",
        "Gurgaon Rapid Metro Route",
    ],
    alternates: {
        canonical: "/delhi-metro",
    },
    openGraph: {
        title:
            "Delhi NCR Metro Route, Fare, Timings & Interchange Planner | TravelAdda",
        description:
            "Find the fastest or minimum-interchange Delhi NCR Metro route across all 262 stations and 12 metro lines with official token & smart card fares.",
        url: "https://traveladda.in/delhi-metro",
        type: "website",
    },
};

const METRO_HUB_FAQS = [
    {
        q: "How do I find the fastest Delhi NCR Metro route and interchange station?",
        a: "Select your Origin and Destination stations in the Delhi NCR Metro Route Planner above and tap 'Find Metro Route & Fare'. You will be taken to the dedicated route details page where you can compare 'Fastest Route', 'Min Change' (minimum interchanges), and 'Min Stops' with step-by-step line colors, platform directions, intermediate stations, and fares.",
    },
    {
        q: "What are the Delhi Metro (DMRC) token and smart card fares in 2026?",
        a: "DMRC fares are based on distance traveled: ₹10 (0–2 km), ₹20 (2–5 km), ₹30 (5–12 km), ₹40 (12–21 km), ₹50 (21–32 km), and ₹60 (above 32 km). On Sundays and National Holidays, maximum fare on DMRC lines is ₹50. Smart Card and NCMC users get a 10% discount during peak hours and a 20% discount during off-peak hours (before 8 AM, 12 PM–5 PM, and after 9 PM).",
    },
    {
        q: "How do I change from Delhi Metro Blue Line to Noida Aqua Line?",
        a: "Alight at Noida Sec-52 on the DMRC Blue Line and use the dedicated 300-meter covered pedestrian walkway/e-rickshaw corridor to reach Noida Sector 51 on the NMRC Noida Aqua Line (~5 minutes transfer).",
    },
    {
        q: "Which metro line goes directly to IGI Airport Terminal 3 and Terminal 1?",
        a: "For IGI Airport Terminal 3 (T3) and T2, take the Airport Express (Orange Line) from New Delhi, Shivaji Stadium, Dhaula Kuan, or Dwarka Sector-21 to 'IGI Airport' station (19 minutes from New Delhi). For Domestic Terminal 1 (T1), take the Magenta Line (Line 8) directly to 'Terminal 1- IGI Airport' station.",
    },
    {
        q: "What are the first and last metro train timings in Delhi NCR?",
        a: "Most Delhi Metro corridors start their first service between 05:15 AM and 05:45 AM (Airport Express starts at 04:45 AM), while the last terminal departures operate between 11:00 PM and 11:30 PM daily.",
    },
];

export default async function MetroHubPage() {
    "use cache";
    cacheLife("days");

    const network = await fetchCachedMetroNetworkSummary();

    const linesMap = new Map(network.routes.map((r) => [r.id, r]));
    const majorInterchanges = network.stops.filter((s) => s.isInterchange);

    const webAppJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Delhi NCR Metro Route, Fare & Interchange Planner",
        url: "https://traveladda.in/delhi-metro",
        applicationCategory: "TravelApplication",
        operatingSystem: "All",
        description:
            "Interactive Delhi NCR Metro route finder, token/smart card fare calculator, and station timetable covering all 12 DMRC, Airport Express, Noida Aqua, and Gurgaon Rapid Metro lines.",
        featureList: [
            "Fastest Route vs Minimum Interchange Route Comparison",
            "All 262 Delhi NCR Metro Stations & 12 Color Lines",
            "DMRC Token, Smart Card Peak/Off-Peak & Sunday Fare Breakdown",
            "First & Last Train Timings and Platform Direction Hints",
        ],
    };

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: METRO_HUB_FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
            },
        })),
    };

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://traveladda.in",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Delhi NCR Metro Route & Fare Finder",
                item: "https://traveladda.in/delhi-metro",
            },
        ],
    };

    return (
        <main className="min-h-screen bg-canvas pb-16 sm:pb-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Deep Navy Hero Banner */}
            <section className="ta-navy-hero pt-5 pb-12 sm:pt-7 sm:pb-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                        <nav
                            aria-label="Breadcrumb"
                            className="flex flex-wrap items-center gap-1.5"
                        >
                            <Link href="/" className="hover:text-white hover:underline">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/tools" className="hover:text-white hover:underline">
                                Tools
                            </Link>
                            <span>/</span>
                            <span className="font-semibold text-white">
                                Delhi NCR Metro Route &amp; Fare
                            </span>
                        </nav>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            12 Metro Lines • 262 Stations
                        </span>
                    </div>

                    <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs sm:text-xs">
                                <TrainIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                                <span>
                                    DMRC • Airport Express • Noida Aqua • Gurgaon Rapid Metro
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Delhi NCR Metro Route, Fare &amp; Timing Finder
                            </h1>
                            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                                Select your Origin and Destination metro station to check{" "}
                                <strong className="text-white">Fastest Route</strong> vs{" "}
                                <strong className="text-white">Minimum Interchange</strong>,
                                official Token &amp; Smart Card fares, platform directions, and
                                station-by-station timings.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <a
                                href="#popular-metro-routes"
                                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
                            >
                                Popular Routes
                            </a>
                            <a
                                href="#metro-lines-directory"
                                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
                            >
                                12 Metro Lines
                            </a>
                            <a
                                href="#dmrc-fare-chart"
                                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 font-bold text-white transition hover:bg-white/20"
                            >
                                Fare Chart
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Container with Overlapping Search Box */}
            <div className="relative z-20 mx-auto -mt-8 max-w-6xl space-y-8 px-3.5 sm:-mt-10 sm:space-y-10 sm:px-6 lg:px-8">
                {/* Search-Only Interactive Metro Route Finder (Navigates to /delhi-metro/route/[routeSlug]) */}
                <Suspense
                    fallback={
                        <div className="h-48 animate-pulse rounded-2xl border border-line bg-card p-6" />
                    }
                >
                    <MetroRouteFinder
                        stations={network.stops}
                        lines={network.routes}
                        mode="search-only"
                        initialFromSlug="mg-road"
                        initialToSlug="anand-vihar"
                        initialPreference="fastest"
                    />
                </Suspense>

                {/* Popular Delhi NCR Metro Routes Directory (Direct SSR Links) */}
                <section
                    id="popular-metro-routes"
                    className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
                >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                                Top Commuter Corridors
                            </span>
                            <h2 className="text-base font-extrabold text-ink sm:text-xl">
                                Most Searched Delhi NCR Metro Routes (Fare, Stops &amp; Timings)
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-ink-muted">
                            Tap any route for full station details
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {POPULAR_METRO_ROUTES.map((item) => (
                            <Link
                                key={`${item.fromSlug}-${item.toSlug}`}
                                href={buildMetroRoutePath(item.fromSlug, item.toSlug)}
                                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/40 p-3.5 transition hover:border-[#1956b4] hover:bg-card hover:shadow-sm sm:p-4"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:bg-blue-950/60 dark:text-blue-300">
                                            {item.corridorTag}
                                        </span>
                                        <ArrowRightIcon className="h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-[#1956b4]" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                                        {item.fromName} → {item.toName}
                                    </h3>
                                    <p className="mt-1 text-xs text-ink-muted">
                                        {item.highlight}
                                    </p>
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
                                    <span>View Route, Fare &amp; Stops</span>
                                    <span>Open Route →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* All 12 Delhi NCR Metro Lines Directory */}
                <section
                    id="metro-lines-directory"
                    className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
                >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fc6203]">
                                Complete DMRC, NMRC &amp; Rapid Metro Corridors
                            </span>
                            <h2 className="text-base font-extrabold text-ink sm:text-xl">
                                All 12 Delhi NCR Metro Lines — Terminals, Distance &amp;
                                Stations
                            </h2>
                        </div>
                        <span className="text-xs font-semibold text-ink-muted">
                            Total Network: 262 Stations
                        </span>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {network.routes.map((line) => (
                            <div
                                key={line.id}
                                style={{ borderTop: `4px solid ${line.color}` }}
                                className="flex flex-col justify-between rounded-xl border border-line bg-subcard/30 p-3.5 shadow-2xs transition hover:border-[#1956b4] sm:p-4"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            style={{
                                                backgroundColor: line.color,
                                                color: line.textColor,
                                            }}
                                            className="rounded-md px-2.5 py-0.5 text-xs font-extrabold shadow-2xs"
                                        >
                                            {line.badge}
                                        </span>
                                        <span className="font-mono text-xs font-bold text-ink-muted">
                                            {line.totalStops} Stations
                                        </span>
                                    </div>

                                    <h3 className="mt-2.5 text-sm font-extrabold text-ink">
                                        {line.fromStationName} ↔ {line.toStationName}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-ink-muted">{line.zone}</p>

                                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-line bg-card p-2.5 text-xs">
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase text-ink-muted">
                                                Corridor Length
                                            </span>
                                            <span className="font-mono font-extrabold text-ink">
                                                {line.totalDistanceKm} km
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold uppercase text-ink-muted">
                                                End-to-End Time
                                            </span>
                                            <span className="font-mono font-extrabold text-ink">
                                                ~{line.totalDurationMin} mins
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-xs font-bold">
                                    <Link
                                        href={buildMetroLinePath(line.slug)}
                                        className="text-[#1956b4] hover:underline dark:text-blue-300"
                                    >
                                        View {line.totalStops} Stations →
                                    </Link>
                                    <Link
                                        href={buildMetroRoutePath(
                                            network.stops.find((s) => s.id === line.fromStopId)
                                                ?.slug || "mg-road",
                                            network.stops.find((s) => s.id === line.toStopId)?.slug ||
                                            "anand-vihar",
                                        )}
                                        className="text-ink-muted hover:text-ink hover:underline"
                                    >
                                        End-to-End Route
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Official DMRC Fare Chart & Smart Card Discount Table */}
                <section
                    id="dmrc-fare-chart"
                    className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6"
                >
                    <div className="mb-4 border-b border-line pb-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            Official Distance-Based Tariff
                        </span>
                        <h2 className="text-base font-extrabold text-ink sm:text-xl">
                            Delhi Metro (DMRC) Fare Chart — Token, Smart Card &amp; Sunday
                            Discount
                        </h2>
                        <p className="mt-1 text-xs text-ink-muted">
                            DMRC calculates metro fares by shortest track distance between
                            origin and destination stations. Smart Card &amp; NCMC users save
                            10% during peak hours and 20% during non-peak hours.
                        </p>
                    </div>

                    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[580px] border-collapse text-left text-xs sm:text-sm">
                            <thead>
                                <tr className="border-b border-line bg-subcard text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                                        Distance Slab
                                    </th>
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                                        Mon–Sat Token
                                    </th>
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                                        Card Peak (10% Off)
                                    </th>
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                                        Card Off-Peak (20% Off)
                                    </th>
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                                        Sun &amp; Holiday
                                    </th>
                                    <th className="px-3.5 py-2.5 sm:px-4 sm:py-3">Max Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {[
                                    {
                                        slab: "0 – 2 km",
                                        token: "₹10",
                                        peak: "₹9",
                                        offPeak: "₹8",
                                        holiday: "₹10",
                                        maxTime: "65 mins",
                                    },
                                    {
                                        slab: "2 – 5 km",
                                        token: "₹20",
                                        peak: "₹18",
                                        offPeak: "₹16",
                                        holiday: "₹10",
                                        maxTime: "65 mins",
                                    },
                                    {
                                        slab: "5 – 12 km",
                                        token: "₹30",
                                        peak: "₹27",
                                        offPeak: "₹24",
                                        holiday: "₹20",
                                        maxTime: "100 mins",
                                    },
                                    {
                                        slab: "12 – 21 km",
                                        token: "₹40",
                                        peak: "₹36",
                                        offPeak: "₹32",
                                        holiday: "₹30",
                                        maxTime: "180 mins",
                                    },
                                    {
                                        slab: "21 – 32 km",
                                        token: "₹50",
                                        peak: "₹45",
                                        offPeak: "₹40",
                                        holiday: "₹40",
                                        maxTime: "180 mins",
                                    },
                                    {
                                        slab: "Above 32 km",
                                        token: "₹60",
                                        peak: "₹54",
                                        offPeak: "₹48",
                                        holiday: "₹50",
                                        maxTime: "180 mins",
                                    },
                                ].map((row) => (
                                    <tr
                                        key={row.slab}
                                        className="transition hover:bg-subcard/60"
                                    >
                                        <td className="px-3.5 py-2.5 font-bold text-ink sm:px-4 sm:py-3">
                                            {row.slab}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-mono font-extrabold text-ink sm:px-4 sm:py-3">
                                            {row.token}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-700 sm:px-4 sm:py-3 dark:text-emerald-300">
                                            {row.peak}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-700 sm:px-4 sm:py-3 dark:text-emerald-300">
                                            {row.offPeak}
                                        </td>
                                        <td className="px-3.5 py-2.5 font-mono font-bold text-[#1956b4] sm:px-4 sm:py-3 dark:text-blue-300">
                                            {row.holiday}
                                        </td>
                                        <td className="px-3.5 py-2.5 text-ink-muted sm:px-4 sm:py-3">
                                            {row.maxTime}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Major Interchange Stations Hub Directory */}
                <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
                    <div className="mb-4 border-b border-line pb-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                            Delhi NCR Transfer Hubs ({majorInterchanges.length} Interchange
                            Stations)
                        </span>
                        <h2 className="text-base font-extrabold text-ink sm:text-xl">
                            Major Delhi Metro Interchange Stations &amp; Connecting Lines
                        </h2>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {majorInterchanges.map((st) => (
                            <Link
                                key={st.id}
                                href={buildMetroStationPath(st.slug)}
                                className="flex items-center justify-between gap-2 rounded-xl border border-line bg-subcard/40 px-3.5 py-2.5 text-xs transition hover:border-[#1956b4] hover:bg-card"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-extrabold text-ink">{st.name}</p>
                                    <p className="text-[10px] text-ink-muted">
                                        First: {st.firstTrain}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-1">
                                    {st.routeIds.map((rid) => {
                                        const ln = linesMap.get(rid);
                                        if (!ln) return null;
                                        return (
                                            <span
                                                key={`${st.id}-${rid}`}
                                                style={{
                                                    backgroundColor: ln.color,
                                                    color: ln.textColor,
                                                }}
                                                className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                                            >
                                                {ln.shortCode}
                                            </span>
                                        );
                                    })}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Complete A-Z Directory of All 262 Delhi NCR Metro Stations */}
                <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
                    <details className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                                    Complete Station Index (262 Stations)
                                </span>
                                <h2 className="text-sm font-extrabold text-ink sm:text-lg">
                                    Browse All 262 Delhi NCR Metro Stations (A–Z Station Pages)
                                </h2>
                            </div>
                            <span className="shrink-0 rounded-lg border border-line bg-subcard px-2.5 py-1.5 text-xs font-bold text-[#1956b4] group-open:bg-[#1956b4] group-open:text-white dark:text-blue-300">
                                All 262 ▼
                            </span>
                        </summary>

                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {[...network.stops]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((st) => (
                                    <Link
                                        key={st.id}
                                        href={buildMetroStationPath(st.slug)}
                                        className="truncate rounded-lg border border-line/70 bg-subcard/30 px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                                    >
                                        {st.name}
                                    </Link>
                                ))}
                        </div>
                    </details>
                </section>

                {/* Delhi NCR Metro SEO Blog Guides & Hot Topics */}
                <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#fc6203]">
                                Delhi Metro Authority Guides &amp; Hot Topics
                            </span>
                            <h2 className="text-base font-extrabold text-ink sm:text-xl">
                                Delhi NCR Metro Route Map, IGI Airport Express, Fare Slabs &amp;
                                Phase 4 Guides
                            </h2>
                        </div>
                        <Link
                            href="/blog#delhi-metro-guides"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-300"
                        >
                            <span>View All Travel Guides</span>
                            <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {METRO_BLOG_POSTS.map((post) => (
                            <article
                                key={post.slug}
                                className="group flex flex-col justify-between rounded-xl border border-line bg-subcard/35 p-4 transition hover:border-[#1956b4] hover:bg-card hover:shadow-xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                                            {post.category}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                                            <ClockIcon className="h-3 w-3" />
                                            <span>{post.readTime}</span>
                                        </span>
                                    </div>
                                    <h3 className="mt-2.5 text-sm font-extrabold leading-snug text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                    </h3>
                                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                                        {post.excerpt}
                                    </p>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
                                    {post.primaryKeyword ? (
                                        <span className="rounded bg-card px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                                            #{post.primaryKeyword}
                                        </span>
                                    ) : (
                                        <span className="text-ink-muted">{post.publishedDate}</span>
                                    )}
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-1 font-extrabold text-[#1956b4] dark:text-blue-300"
                                    >
                                        <span>Read Guide</span>
                                        <ArrowRightIcon className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Frequently Asked Questions */}
                <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
                    <h2 className="text-base font-extrabold text-ink sm:text-xl">
                        Frequently Asked Questions — Delhi NCR Metro Route &amp; Fares
                    </h2>
                    <div className="mt-4 space-y-3">
                        {METRO_HUB_FAQS.map((faq) => (
                            <div
                                key={faq.q}
                                className="rounded-xl border border-line bg-subcard/40 p-3.5 sm:p-4"
                            >
                                <h3 className="text-xs font-extrabold text-ink sm:text-sm">
                                    {faq.q}
                                </h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
