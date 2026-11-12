import type { MetadataRoute } from "next";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildChartTimePath,
  POPULAR_CHART_TRAINS,
} from "@/lib/chart-time-types";
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
  buildAirlineCompensationPath,
  DGCA_AIRLINE_PROFILES,
} from "@/lib/dgca-compensation-types";
import { getAllIndexableTollRouteSlugs } from "@/lib/toll-service";

const BASE_URL = "https://traveladda.in";
const SITEMAP_LAST_MODIFIED = "2026-11-12T06:00:00.000Z";

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/air/flight-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/rail/live-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/rail/pnr-status`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "always",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/rail/chart-time`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.94,
    },
    {
      url: `${BASE_URL}/delhi-metro`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${BASE_URL}/air/flight-compensation`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${BASE_URL}/toll-calculator`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/air`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/tools/hotel`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.88,
    },
  ];

  // All 252+ Indian Railways Live Train Running Status URLs
  const popularTrainSet = new Set(
    POPULAR_LIVE_TRAINS.map((t) => t.trainNumber),
  );
  const trainUrlSet = new Set<string>();
  const trainStatusRoutes: MetadataRoute.Sitemap = [];

  for (const train of ALL_CATALOG_TRAINS) {
    const fullUrl = `${BASE_URL}${buildTrainLiveStatusPath(
      train.trainNumber,
      train.trainName,
    )}`;
    if (!trainUrlSet.has(fullUrl)) {
      trainUrlSet.add(fullUrl);
      trainStatusRoutes.push({
        url: fullUrl,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "daily",
        priority: popularTrainSet.has(train.trainNumber) ? 0.94 : 0.89,
      });
    }
  }

  // All 252+ Indian Railways Train Chart Preparation Time URLs
  const chartUrlSet = new Set<string>();
  const chartTimeRoutes: MetadataRoute.Sitemap = [];

  for (const train of POPULAR_CHART_TRAINS) {
    const fullUrl = `${BASE_URL}/chart-times/${train.slug}`;
    if (!chartUrlSet.has(fullUrl)) {
      chartUrlSet.add(fullUrl);
      chartTimeRoutes.push({
        url: fullUrl,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.92,
      });
    }
  }

  for (const train of ALL_CATALOG_TRAINS) {
    const fullUrl = `${BASE_URL}${buildChartTimePath(
      train.trainNumber,
      train.trainName,
    )}`;
    if (!chartUrlSet.has(fullUrl)) {
      chartUrlSet.add(fullUrl);
      chartTimeRoutes.push({
        url: fullUrl,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: popularTrainSet.has(train.trainNumber) ? 0.9 : 0.86,
      });
    }
  }

  // Live Flight Status SSR URLs
  const flightStatusRoutes: MetadataRoute.Sitemap = POPULAR_LIVE_FLIGHTS.map(
    (flight) => ({
      url: `${BASE_URL}${buildFlightStatusPath(
        flight.airlineCode,
        flight.flightNumber,
        flight.airlineName,
      )}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "hourly",
      priority: 0.94,
    }),
  );

  // Delhi NCR Metro Lines (12 lines)
  const metroLines = getAllMetroLines();
  const metroLineRoutes: MetadataRoute.Sitemap = metroLines.map((line) => ({
    url: `${BASE_URL}${buildMetroLinePath(line.slug)}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.89,
  }));

  // Delhi NCR Metro Stations (all 262 stations)
  const metroStations = getAllMetroStations();
  const metroStationRoutes: MetadataRoute.Sitemap = metroStations.map((st) => ({
    url: `${BASE_URL}${buildMetroStationPath(st.slug)}`,
    lastModified: SITEMAP_LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: st.isInterchange ? 0.88 : 0.82,
  }));

  // Delhi NCR Metro Route Combinations (/delhi-metro/route/[from]-to-[to])
  const metroRouteUrlsSet = new Set<string>();
  const metroPairRoutes: MetadataRoute.Sitemap = [];

  const addMetroRouteUrl = (
    fromSlug: string,
    toSlug: string,
    priority: number,
  ) => {
    if (!fromSlug || !toSlug || fromSlug === toSlug) return;
    const fullUrl = `${BASE_URL}${buildMetroRoutePath(fromSlug, toSlug)}`;
    if (!metroRouteUrlsSet.has(fullUrl)) {
      metroRouteUrlsSet.add(fullUrl);
      metroPairRoutes.push({
        url: fullUrl,
        lastModified: SITEMAP_LAST_MODIFIED,
        changeFrequency: "weekly",
        priority,
      });
    }
  };

  // 1. Featured Popular Metro Routes ( both directions )
  for (const item of POPULAR_METRO_ROUTES) {
    addMetroRouteUrl(item.fromSlug, item.toSlug, 0.93);
    addMetroRouteUrl(item.toSlug, item.fromSlug, 0.91);
  }

  // 2. Top 20 Delhi NCR Metro Transit Hubs (all 20 x 19 = 380 hub-to-hub combinations)
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

  // 3. All 262 Stations <-> 12 Primary Commuter Hubs (matches every station page's direct route links: ~6,200 URLs)
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

  // Blog & Editorial Guides
  const blogRoutes: MetadataRoute.Sitemap = ALL_BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedIso,
    changeFrequency: "weekly",
    priority: post.primaryKeyword ? 0.88 : post.domain === "air" ? 0.85 : 0.8,
  }));

  // DGCA Airline Compensation Programmatic SSR Pages (14 airlines)
  const dgcaAirlineRoutes: MetadataRoute.Sitemap = DGCA_AIRLINE_PROFILES.map(
    (airline) => ({
      url: `${BASE_URL}${buildAirlineCompensationPath(airline.slug)}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.91,
    }),
  );

  // NHAI FASTag Highway Toll & Fuel Calculator City-to-City Routes (158+ corridors)
  const tollRoutes: MetadataRoute.Sitemap = getAllIndexableTollRouteSlugs().map(
    (route) => ({
      url: `${BASE_URL}${route.routePath}`,
      lastModified: SITEMAP_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: route.isPrimaryCorridor ? 0.92 : 0.86,
    }),
  );

  return [
    ...coreRoutes,
    ...flightStatusRoutes,
    ...dgcaAirlineRoutes,
    ...tollRoutes,
    ...trainStatusRoutes,
    ...chartTimeRoutes,
    ...metroLineRoutes,
    ...metroStationRoutes,
    ...metroPairRoutes,
    ...blogRoutes,
  ];
}
