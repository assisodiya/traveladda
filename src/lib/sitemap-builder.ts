import type { MetadataRoute } from "next";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildChartTimePath,
  POPULAR_CHART_TRAINS,
} from "@/lib/chart-time-types";
import {
  buildAirlineCompensationPath,
  DGCA_AIRLINE_PROFILES,
} from "@/lib/dgca-compensation-types";
import { getAllIndexableFlightRouteSlugs } from "@/lib/flight-booking-types";
import {
  buildFlightStatusPath,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";
import {
  ALL_CATALOG_TRAINS,
  buildTrainLiveStatusPath,
  isReservedChartEligibleTrain,
  isSuburbanLocalEmuTrain,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";
import { getAllMetroLines, getAllMetroStations } from "@/lib/metro-service";
import {
  buildMetroLinePath,
  buildMetroRoutePath,
  buildMetroStationPath,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";
import {
  buildRefundScenarioPath,
  REFUND_SEO_SCENARIOS,
} from "@/lib/rail-refund-service";
import { getAllIndexableTollRouteSlugs } from "@/lib/toll-service";

export const SITE_BASE_URL = "https://traveladda.in";
export const INDEXNOW_KEY = "traveladda2026indexnow88a9b7c6d5";

export type SitemapSegmentKey =
  | "core"
  | "flights"
  | "flight-routes"
  | "train-live-status"
  | "train-regional-status"
  | "train-chart-times"
  | "toll-routes"
  | "delhi-metro"
  | "blogs";

const LATEST_BLOG_PUBLISHED_ISO =
  ALL_BLOG_POSTS.reduce(
    (latest, post) =>
      post.publishedIso && post.publishedIso > latest
        ? post.publishedIso
        : latest,
    "2026-11-10T06:00:00.000Z"
  ) || "2026-11-10T06:00:00.000Z";

/**
 * Independent per-segment lastModified timestamps so Googlebot ONLY re-crawls
 * the specific section that actually changed (preserving crawl budget and
 * leaving already-indexed segments like Delhi Metro & Toll Routes untouched).
 */
export const SITEMAP_SEGMENT_LAST_MODIFIED: Record<SitemapSegmentKey, string> =
  {
    core: "2026-11-13T06:00:00.000Z",
    flights: "2026-11-13T06:00:00.000Z",
    "flight-routes": "2026-11-13T06:00:00.000Z",
    "train-live-status": "2026-11-13T06:00:00.000Z",
    "train-regional-status": "2026-11-12T06:00:00.000Z",
    "train-chart-times": "2026-11-13T06:00:00.000Z",
    "toll-routes": "2026-11-11T06:00:00.000Z",
    "delhi-metro": "2026-11-10T06:00:00.000Z",
    blogs: LATEST_BLOG_PUBLISHED_ISO,
  };

export const SITEMAP_LAST_MODIFIED = SITEMAP_SEGMENT_LAST_MODIFIED.core;

/**
 * Strictly mutually exclusive (0% URL overlap) XML sitemap segments.
 */
export const SITEMAP_SEGMENTS: {
  key: SitemapSegmentKey;
  filename: string;
  lastModified: string;
  title: string;
  description: string;
}[] = [
  {
    key: "core",
    filename: "core.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED.core,
    title: "Core Tools & Hub Pages",
    description:
      "Primary TravelAdda interactive tool hubs, static pages, and HTML sitemap directory.",
  },
  {
    key: "flights",
    filename: "flights.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED.flights,
    title: "Live Flight Status & DGCA Airline Compensation Pages",
    description:
      "Dedicated live flight status tracking pages and 14 airline DGCA delay/cancellation compensation calculators (zero overlap with flight-routes.xml).",
  },
  {
    key: "flight-routes",
    filename: "flight-routes.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["flight-routes"],
    title:
      "Domestic & International Flight Schedule & Fare Routes (1,496 Combinations)",
    description:
      "All 1,496 airport-to-airport flight schedules, non-stop durations, T1/T2/T3 terminals, and 14-day lowest fare calendars.",
  },
  {
    key: "train-live-status",
    filename: "train-live-status.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["train-live-status"],
    title: "Indian Railways Reserved Mail/Express Live Running Status Pages",
    description:
      "All ~4,000 reserved Mail/Express, Superfast, Vande Bharat, Rajdhani, Shatabdi & Intercity trains mapped to live running status, coach position & platform URLs.",
  },
  {
    key: "train-regional-status",
    filename: "train-regional-status.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["train-regional-status"],
    title: "Indian Railways Regional Passenger, MEMU & DEMU Live Status Pages",
    description:
      "Regional Passenger, MEMU & DEMU train schedules and live running status pages (excludes unindexed city Suburban/EMU local trains).",
  },
  {
    key: "train-chart-times",
    filename: "train-chart-times.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["train-chart-times"],
    title:
      "Indian Railways Reservation Chart Preparation Time & IRCTC Refund Pages",
    description:
      "Reserved Indian Railways trains mapped to station-wise 1st & 2nd reservation chart preparation times, remote charting hubs, and IRCTC ticket refund calculators.",
  },
  {
    key: "toll-routes",
    filename: "toll-routes.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["toll-routes"],
    title: "NHAI FASTag Highway Toll & Fuel Route Pages (1,560 Combinations)",
    description:
      "All 40 × 39 = 1,560 city-to-city Indian National Highway & Expressway toll and fuel cost calculators.",
  },
  {
    key: "delhi-metro",
    filename: "delhi-metro.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED["delhi-metro"],
    title: "Delhi NCR Metro Lines, Stations & Route Pages",
    description:
      "All 12 Delhi NCR Metro lines, 262 station pages, and 6,600+ station-to-station fare & interchange routes.",
  },
  {
    key: "blogs",
    filename: "blogs.xml",
    lastModified: SITEMAP_SEGMENT_LAST_MODIFIED.blogs,
    title: "Editorial Travel, Aviation, Rail, Metro & Highway Blog Guides",
    description:
      "Long-form 2026–27 travel guides, FASTag rules, PRS refund rules, and Delhi Metro commuter handbooks.",
  },
];

function escapeXmlValue(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapIndexXml(
  segments: { filename: string; lastModified: string }[] = SITEMAP_SEGMENTS
): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...segments.map(
      (seg) =>
        `  <sitemap>\n    <loc>${escapeXmlValue(
          `${SITE_BASE_URL}/sitemaps/${seg.filename}`
        )}</loc>\n    <lastmod>${escapeXmlValue(
          seg.lastModified
        )}</lastmod>\n  </sitemap>`
    ),
    "</sitemapindex>",
  ].join("\n");
}

export function buildSegmentedSitemaps(): Record<
  SitemapSegmentKey,
  MetadataRoute.Sitemap
> {
  const coreLastMod = SITEMAP_SEGMENT_LAST_MODIFIED.core;
  const flightsLastMod = SITEMAP_SEGMENT_LAST_MODIFIED.flights;
  const flightRoutesLastMod = SITEMAP_SEGMENT_LAST_MODIFIED["flight-routes"];
  const trainStatusLastMod = SITEMAP_SEGMENT_LAST_MODIFIED["train-live-status"];
  const trainRegionalLastMod =
    SITEMAP_SEGMENT_LAST_MODIFIED["train-regional-status"];
  const trainChartLastMod = SITEMAP_SEGMENT_LAST_MODIFIED["train-chart-times"];
  const tollLastMod = SITEMAP_SEGMENT_LAST_MODIFIED["toll-routes"];
  const metroLastMod = SITEMAP_SEGMENT_LAST_MODIFIED["delhi-metro"];

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_BASE_URL}/`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_BASE_URL}/flights`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/air/flight-status`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/rail/live-status`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/rail/pnr-status`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_BASE_URL}/rail/chart-time`,
      lastModified: coreLastMod,
      changeFrequency: "daily",
      priority: 0.94,
    },
    {
      url: `${SITE_BASE_URL}/rail/refund-calculator`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/delhi-metro`,
      lastModified: metroLastMod,
      changeFrequency: "weekly",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/air/flight-compensation`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/toll-calculator`,
      lastModified: tollLastMod,
      changeFrequency: "weekly",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/blog`,
      lastModified: SITEMAP_SEGMENT_LAST_MODIFIED.blogs,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${SITE_BASE_URL}/tools`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_BASE_URL}/tools/air`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${SITE_BASE_URL}/tools/hotel`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_BASE_URL}/sitemap-directory`,
      lastModified: coreLastMod,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_BASE_URL}/about`,
      lastModified: coreLastMod,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${SITE_BASE_URL}/privacy-policy`,
      lastModified: coreLastMod,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${SITE_BASE_URL}/terms`,
      lastModified: coreLastMod,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_BASE_URL}/contact`,
      lastModified: coreLastMod,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Flights (Live Flight Status + DGCA Airline Compensation ONLY — no overlap with flight-routes)
  const flightUrlSet = new Set<string>();
  const flightStatusRoutes: MetadataRoute.Sitemap = [];
  for (const flight of POPULAR_LIVE_FLIGHTS) {
    const url = `${SITE_BASE_URL}${buildFlightStatusPath(
      flight.airlineCode,
      flight.flightNumber,
      flight.airlineName
    )}`;
    if (!flightUrlSet.has(url)) {
      flightUrlSet.add(url);
      flightStatusRoutes.push({
        url,
        lastModified: flightsLastMod,
        changeFrequency: "daily",
        priority: 0.93,
      });
    }
  }

  const dgcaAirlineRoutes: MetadataRoute.Sitemap = DGCA_AIRLINE_PROFILES.map(
    (airline) => ({
      url: `${SITE_BASE_URL}${buildAirlineCompensationPath(airline.slug)}`,
      lastModified: flightsLastMod,
      changeFrequency: "weekly",
      priority: 0.91,
    })
  );

  // Flight Schedule & Fare Routes (1,496 unique combinations)
  const flightRouteScheduleUrls: MetadataRoute.Sitemap =
    getAllIndexableFlightRouteSlugs().map((r) => ({
      url: `${SITE_BASE_URL}${r.routePath}`,
      lastModified: flightRoutesLastMod,
      changeFrequency: "daily",
      priority: r.isPrimaryCorridor ? 0.94 : 0.88,
    }));

  // Trains: Split into Reserved Mail/Express Live Status vs Regional Passenger/MEMU/DEMU (excluding local Suburban EMUs)
  const flagshipTrainSet = new Set(
    POPULAR_LIVE_TRAINS.slice(0, 50).map((t) => t.trainNumber)
  );
  const trainUrlSet = new Set<string>();
  const reservedTrainStatusRoutes: MetadataRoute.Sitemap = [];
  const regionalTrainStatusRoutes: MetadataRoute.Sitemap = [];

  const pushTrainLiveStatusEntry = (train: {
    trainNumber: string;
    trainName: string;
    type?: string | null;
  }) => {
    if (!train.trainNumber || train.trainNumber.startsWith("0")) return;
    if (isSuburbanLocalEmuTrain(train)) return;

    const url = `${SITE_BASE_URL}${buildTrainLiveStatusPath(
      train.trainNumber,
      train.trainName
    )}`;
    if (trainUrlSet.has(url)) return;
    trainUrlSet.add(url);

    if (isReservedChartEligibleTrain(train)) {
      reservedTrainStatusRoutes.push({
        url,
        lastModified: trainStatusLastMod,
        changeFrequency: "daily",
        priority: flagshipTrainSet.has(train.trainNumber) ? 0.92 : 0.86,
      });
    } else {
      regionalTrainStatusRoutes.push({
        url,
        lastModified: trainRegionalLastMod,
        changeFrequency: "weekly",
        priority: 0.78,
      });
    }
  };

  for (const train of POPULAR_LIVE_TRAINS) {
    pushTrainLiveStatusEntry(train);
  }
  for (const train of ALL_CATALOG_TRAINS) {
    pushTrainLiveStatusEntry(train);
  }

  // Train Reservation Chart Times (Strictly Reserved chart-eligible trains ONLY)
  const popularChartSet = new Set(
    POPULAR_CHART_TRAINS.map((t) => t.trainNumber)
  );
  const chartUrlSet = new Set<string>();
  const chartTimeRoutes: MetadataRoute.Sitemap = [];

  for (const train of POPULAR_CHART_TRAINS) {
    if (train.trainNumber.startsWith("0")) continue;
    const url = `${SITE_BASE_URL}/chart-times/${train.slug}`;
    if (!chartUrlSet.has(url)) {
      chartUrlSet.add(url);
      chartTimeRoutes.push({
        url,
        lastModified: trainChartLastMod,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  for (const train of POPULAR_LIVE_TRAINS) {
    if (!isReservedChartEligibleTrain(train)) continue;
    const url = `${SITE_BASE_URL}${buildChartTimePath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!chartUrlSet.has(url) && !popularChartSet.has(train.trainNumber)) {
      chartUrlSet.add(url);
      chartTimeRoutes.push({
        url,
        lastModified: trainChartLastMod,
        changeFrequency: "weekly",
        priority: flagshipTrainSet.has(train.trainNumber) ? 0.88 : 0.84,
      });
    }
  }

  for (const train of ALL_CATALOG_TRAINS) {
    if (!isReservedChartEligibleTrain(train)) continue;
    const url = `${SITE_BASE_URL}${buildChartTimePath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!chartUrlSet.has(url) && !popularChartSet.has(train.trainNumber)) {
      chartUrlSet.add(url);
      chartTimeRoutes.push({
        url,
        lastModified: trainChartLastMod,
        changeFrequency: "weekly",
        priority: 0.84,
      });
    }
  }

  const railRefundRoutes: MetadataRoute.Sitemap = REFUND_SEO_SCENARIOS.map(
    (scenario) => ({
      url: `${SITE_BASE_URL}${buildRefundScenarioPath(scenario.slug)}`,
      lastModified: trainChartLastMod,
      changeFrequency: "monthly",
      priority: 0.91,
    })
  );

  // Toll Routes (All 1,560 combinations — stable independent lastModified)
  const tollRoutes: MetadataRoute.Sitemap = getAllIndexableTollRouteSlugs().map(
    (route) => ({
      url: `${SITE_BASE_URL}${route.routePath}`,
      lastModified: tollLastMod,
      changeFrequency: "weekly",
      priority: route.isPrimaryCorridor ? 0.92 : 0.86,
    })
  );

  // Delhi Metro (Untouched URLs & untouched lastModified to protect already-indexed pages)
  const metroSeenUrls = new Set<string>();
  const metroEntries: MetadataRoute.Sitemap = [];

  const pushMetroEntry = (url: string, priority: number) => {
    if (!metroSeenUrls.has(url)) {
      metroSeenUrls.add(url);
      metroEntries.push({
        url,
        lastModified: metroLastMod,
        changeFrequency: "weekly",
        priority,
      });
    }
  };

  for (const line of getAllMetroLines()) {
    pushMetroEntry(`${SITE_BASE_URL}${buildMetroLinePath(line.slug)}`, 0.91);
  }

  const metroStations = getAllMetroStations();
  for (const st of metroStations) {
    pushMetroEntry(
      `${SITE_BASE_URL}${buildMetroStationPath(st.slug)}`,
      st.isInterchange ? 0.89 : 0.84
    );
  }

  const addMetroRouteUrl = (
    fromSlug: string,
    toSlug: string,
    priority: number
  ) => {
    if (!fromSlug || !toSlug || fromSlug === toSlug) return;
    pushMetroEntry(
      `${SITE_BASE_URL}${buildMetroRoutePath(fromSlug, toSlug)}`,
      priority
    );
  };

  for (const item of POPULAR_METRO_ROUTES) {
    addMetroRouteUrl(item.fromSlug, item.toSlug, 0.93);
    addMetroRouteUrl(item.toSlug, item.fromSlug, 0.91);
  }

  const topHubSlugs = [
    "mg-road",
    "anand-vihar",
    "rajiv-chowk",
    "new-delhi",
    "kashmere-gate",
    "huda-city-centre",
    "igi-airport",
    "noida-electronic-city",
    "hauz-khas",
    "botanical-garden",
    "lajpat-nagar",
    "dwarka-sector-21",
    "central-secretariat",
    "mandi-house",
    "sikanderpur",
    "cyber-city-rapid-metro",
    "pari-chowk",
    "vaishali",
    "rajouri-garden",
    "netaji-subash-place",
  ];

  for (const fromSlug of topHubSlugs) {
    for (const toSlug of topHubSlugs) {
      addMetroRouteUrl(fromSlug, toSlug, 0.87);
    }
  }

  const primaryStationHubSlugs = [
    "mg-road",
    "anand-vihar",
    "rajiv-chowk",
    "new-delhi",
    "kashmere-gate",
    "huda-city-centre",
    "igi-airport",
    "noida-electronic-city",
    "hauz-khas",
    "botanical-garden",
    "lajpat-nagar",
    "dwarka-sector-21",
  ];

  for (const st of metroStations) {
    for (const hubSlug of primaryStationHubSlugs) {
      addMetroRouteUrl(st.slug, hubSlug, 0.83);
      addMetroRouteUrl(hubSlug, st.slug, 0.81);
    }
  }

  // Blogs (Individual per-post publishedIso lastModified)
  const blogRoutes: MetadataRoute.Sitemap = ALL_BLOG_POSTS.map((post) => ({
    url: `${SITE_BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedIso,
    changeFrequency: "weekly",
    priority: post.primaryKeyword ? 0.88 : post.domain === "air" ? 0.85 : 0.8,
  }));

  return {
    core: coreRoutes,
    flights: [...flightStatusRoutes, ...dgcaAirlineRoutes],
    "flight-routes": flightRouteScheduleUrls,
    "train-live-status": reservedTrainStatusRoutes,
    "train-regional-status": regionalTrainStatusRoutes,
    "train-chart-times": [...chartTimeRoutes, ...railRefundRoutes],
    "toll-routes": tollRoutes,
    "delhi-metro": metroEntries,
    blogs: blogRoutes,
  };
}

export function buildAllSitemapEntries(): MetadataRoute.Sitemap {
  const segments = buildSegmentedSitemaps();
  const seen = new Set<string>();
  const combined: MetadataRoute.Sitemap = [];

  for (const seg of SITEMAP_SEGMENTS) {
    for (const entry of segments[seg.key]) {
      if (!seen.has(entry.url)) {
        seen.add(entry.url);
        combined.push(entry);
      }
    }
  }

  return combined;
}
