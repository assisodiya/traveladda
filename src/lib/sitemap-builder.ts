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
export const SITEMAP_LAST_MODIFIED = "2026-11-12T06:00:00.000Z";
export const INDEXNOW_KEY = "traveladda2026indexnow88a9b7c6d5";

export type SitemapSegmentKey =
  | "core"
  | "flights"
  | "flight-routes"
  | "trains"
  | "train-live-status"
  | "train-chart-times"
  | "toll-routes"
  | "delhi-metro"
  | "blogs";

export const SITEMAP_SEGMENTS: {
  key: SitemapSegmentKey;
  filename: string;
  title: string;
  description: string;
}[] = [
  {
    key: "core",
    filename: "core.xml",
    title: "Core Tools & Hub Pages",
    description:
      "Primary TravelAdda tool hubs, static pages, HTML sitemap directory, and AI index files (llms.txt).",
  },
  {
    key: "flights",
    filename: "flights.xml",
    title: "Flights, Route Schedules & DGCA Compensation Pages",
    description:
      "Live flight status tracking pages, 1,496 airport-to-airport flight schedule & fare routes, and 14 airline DGCA compensation pages.",
  },
  {
    key: "flight-routes",
    filename: "flight-routes.xml",
    title: "Domestic & International Flight Schedule & Fare Routes (1,496 Combinations)",
    description:
      "All 1,496 airport-to-airport flight schedules, non-stop durations, T1/T2/T3 terminals, and 14-day lowest fare calendars.",
  },
  {
    key: "train-live-status",
    filename: "train-live-status.xml",
    title: "Indian Railways Live Train Running Status Pages (10,173 Trains)",
    description:
      "All 10,173 non-zero NTES Indian Railways trains mapped to dedicated live running status, coach position & platform URLs.",
  },
  {
    key: "train-chart-times",
    filename: "train-chart-times.xml",
    title: "Indian Railways Reservation Chart Preparation Time Pages (10,173 Trains)",
    description:
      "All 10,173 non-zero NTES Indian Railways trains mapped to station-wise 1st & 2nd chart preparation time and remote charting hub URLs.",
  },
  {
    key: "trains",
    filename: "trains.xml",
    title: "Combined Indian Railways Live Status, Chart Time & Refund Pages",
    description:
      "10,173 live train running status pages, 10,173 reservation chart preparation times, and 30 IRCTC ticket refund calculators.",
  },
  {
    key: "toll-routes",
    filename: "toll-routes.xml",
    title: "NHAI FASTag Highway Toll & Fuel Route Pages (1,560 Combinations)",
    description:
      "All 40 × 39 = 1,560 city-to-city Indian National Highway & Expressway toll and fuel cost calculators.",
  },
  {
    key: "delhi-metro",
    filename: "delhi-metro.xml",
    title: "Delhi NCR Metro Lines, Stations & Route Pages",
    description:
      "All 12 Delhi NCR Metro lines, 262 station pages, and 6,600+ station-to-station fare & interchange routes.",
  },
  {
    key: "blogs",
    filename: "blogs.xml",
    title: "Editorial Travel, Aviation, Rail, Metro & Highway Blog Guides",
    description:
      "Long-form 2026–27 travel guides, FASTag rules, PRS refund rules, and Delhi Metro commuter handbooks.",
  },
];

export function buildSegmentedSitemaps(): Record<
  SitemapSegmentKey,
  MetadataRoute.Sitemap
> {
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_BASE_URL}/`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_BASE_URL}/flights`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/air/flight-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/rail/live-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${SITE_BASE_URL}/rail/pnr-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.95,
    },
    {
      url: `${SITE_BASE_URL}/rail/chart-time`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.94,
    },
    {
      url: `${SITE_BASE_URL}/rail/refund-calculator`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/delhi-metro`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/air/flight-compensation`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/toll-calculator`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${SITE_BASE_URL}/blog`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${SITE_BASE_URL}/tools`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_BASE_URL}/tools/air`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${SITE_BASE_URL}/tools/hotel`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_BASE_URL}/sitemap-directory`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.92,
    },
    {
      url: `${SITE_BASE_URL}/about`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${SITE_BASE_URL}/privacy-policy`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${SITE_BASE_URL}/terms`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${SITE_BASE_URL}/contact`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_BASE_URL}/llms.txt`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_BASE_URL}/llms-full.txt`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.88,
    },
  ];

  // Flights + DGCA Airline Compensation
  const flightStatusRoutes: MetadataRoute.Sitemap = POPULAR_LIVE_FLIGHTS.map(
    (flight) => ({
      url: `${SITE_BASE_URL}${buildFlightStatusPath(
        flight.airlineCode,
        flight.flightNumber,
        flight.airlineName
      )}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.93,
    })
  );

  const dgcaAirlineRoutes: MetadataRoute.Sitemap = DGCA_AIRLINE_PROFILES.map(
    (airline) => ({
      url: `${SITE_BASE_URL}${buildAirlineCompensationPath(airline.slug)}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.91,
    })
  );

  const flightRouteScheduleUrls: MetadataRoute.Sitemap =
    getAllIndexableFlightRouteSlugs().map((r) => ({
      url: `${SITE_BASE_URL}${r.routePath}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: r.isPrimaryCorridor ? 0.94 : 0.88,
    }));

  // Trains: Live Status + Chart Times + Refund Scenarios (All non-zero NTES trains)
  const flagshipTrainSet = new Set(
    POPULAR_LIVE_TRAINS.slice(0, 50).map((t) => t.trainNumber)
  );
  const trainUrlSet = new Set<string>();
  const trainStatusRoutes: MetadataRoute.Sitemap = [];

  for (const train of POPULAR_LIVE_TRAINS) {
    if (train.trainNumber.startsWith("0")) continue;
    const url = `${SITE_BASE_URL}${buildTrainLiveStatusPath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!trainUrlSet.has(url)) {
      trainUrlSet.add(url);
      trainStatusRoutes.push({
        url,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "always",
        priority: flagshipTrainSet.has(train.trainNumber) ? 0.92 : 0.86,
      });
    }
  }

  for (const train of ALL_CATALOG_TRAINS) {
    if (train.trainNumber.startsWith("0")) continue;
    const url = `${SITE_BASE_URL}${buildTrainLiveStatusPath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!trainUrlSet.has(url)) {
      trainUrlSet.add(url);
      trainStatusRoutes.push({
        url,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "always",
        priority: flagshipTrainSet.has(train.trainNumber) ? 0.92 : 0.86,
      });
    }
  }

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
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  for (const train of POPULAR_LIVE_TRAINS) {
    if (train.trainNumber.startsWith("0")) continue;
    const url = `${SITE_BASE_URL}${buildChartTimePath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!chartUrlSet.has(url) && !popularChartSet.has(train.trainNumber)) {
      chartUrlSet.add(url);
      chartTimeRoutes.push({
        url,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: flagshipTrainSet.has(train.trainNumber) ? 0.88 : 0.84,
      });
    }
  }

  for (const train of ALL_CATALOG_TRAINS) {
    if (train.trainNumber.startsWith("0")) continue;
    const url = `${SITE_BASE_URL}${buildChartTimePath(
      train.trainNumber,
      train.trainName
    )}`;
    if (!chartUrlSet.has(url) && !popularChartSet.has(train.trainNumber)) {
      chartUrlSet.add(url);
      chartTimeRoutes.push({
        url,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.84,
      });
    }
  }

  const railRefundRoutes: MetadataRoute.Sitemap = REFUND_SEO_SCENARIOS.map(
    (scenario) => ({
      url: `${SITE_BASE_URL}${buildRefundScenarioPath(scenario.slug)}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.91,
    })
  );

  // Toll Routes (All 1,560 combinations)
  const tollRoutes: MetadataRoute.Sitemap = getAllIndexableTollRouteSlugs().map(
    (route) => ({
      url: `${SITE_BASE_URL}${route.routePath}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: route.isPrimaryCorridor ? 0.92 : 0.86,
    })
  );

  // Delhi Metro
  const metroLines = getAllMetroLines();
  const metroLineRoutes: MetadataRoute.Sitemap = metroLines.map((line) => ({
    url: `${SITE_BASE_URL}${buildMetroLinePath(line.slug)}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.91,
  }));

  const metroStations = getAllMetroStations();
  const metroStationRoutes: MetadataRoute.Sitemap = metroStations.map((st) => ({
    url: `${SITE_BASE_URL}${buildMetroStationPath(st.slug)}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: st.isInterchange ? 0.89 : 0.84,
  }));

  const metroRouteUrlSet = new Set<string>();
  const metroPairRoutes: MetadataRoute.Sitemap = [];

  const addMetroRouteUrl = (
    fromSlug: string,
    toSlug: string,
    priority: number
  ) => {
    if (!fromSlug || !toSlug || fromSlug === toSlug) return;
    const url = `${SITE_BASE_URL}${buildMetroRoutePath(fromSlug, toSlug)}`;
    if (!metroRouteUrlSet.has(url)) {
      metroRouteUrlSet.add(url);
      metroPairRoutes.push({
        url,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority,
      });
    }
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

  // Blogs
  const blogRoutes: MetadataRoute.Sitemap = ALL_BLOG_POSTS.map((post) => ({
    url: `${SITE_BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedIso,
    changeFrequency: "weekly",
    priority: post.primaryKeyword ? 0.88 : post.domain === "air" ? 0.85 : 0.8,
  }));

  return {
    core: coreRoutes,
    flights: [
      ...flightStatusRoutes,
      ...dgcaAirlineRoutes,
      ...flightRouteScheduleUrls,
    ],
    "flight-routes": flightRouteScheduleUrls,
    "train-live-status": trainStatusRoutes,
    "train-chart-times": [...chartTimeRoutes, ...railRefundRoutes],
    trains: [...trainStatusRoutes, ...chartTimeRoutes, ...railRefundRoutes],
    "toll-routes": tollRoutes,
    "delhi-metro": [
      ...metroLineRoutes,
      ...metroStationRoutes,
      ...metroPairRoutes,
    ],
    blogs: blogRoutes,
  };
}

export function buildAllSitemapEntries(): MetadataRoute.Sitemap {
  const segments = buildSegmentedSitemaps();
  return [
    ...segments.core,
    ...segments.flights,
    ...segments.trains,
    ...segments["toll-routes"],
    ...segments["delhi-metro"],
    ...segments.blogs,
  ];
}

