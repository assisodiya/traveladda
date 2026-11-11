import type { MetadataRoute } from "next";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import { POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";
import {
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

const BASE_URL = "https://traveladda.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/air/flight-status`,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/rail/live-status`,
      changeFrequency: "always",
      priority: 0.98,
    },
    {
      url: `${BASE_URL}/rail/pnr-status`,
      changeFrequency: "always",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/rail/chart-time`,
      changeFrequency: "daily",
      priority: 0.94,
    },
    {
      url: `${BASE_URL}/delhi-metro`,
      changeFrequency: "daily",
      priority: 0.96,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${BASE_URL}/tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/air`,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/tools/hotel`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const trainStatusRoutes: MetadataRoute.Sitemap = POPULAR_LIVE_TRAINS.map(
    (train) => ({
      url: `${BASE_URL}${buildTrainLiveStatusPath(
        train.trainNumber,
        train.trainName,
      )}`,
      changeFrequency: "daily",
      priority: 0.92,
    }),
  );

  const chartTimeRoutes: MetadataRoute.Sitemap = POPULAR_CHART_TRAINS.map(
    (train) => ({
      url: `${BASE_URL}/chart-times/${train.slug}`,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );

  // Delhi NCR Metro Lines (12 lines)
  const metroLines = getAllMetroLines();
  const metroLineRoutes: MetadataRoute.Sitemap = metroLines.map((line) => ({
    url: `${BASE_URL}${buildMetroLinePath(line.slug)}`,
    changeFrequency: "weekly",
    priority: 0.89,
  }));

  // Delhi NCR Metro Stations (all 262 stations)
  const metroStations = getAllMetroStations();
  const metroStationRoutes: MetadataRoute.Sitemap = metroStations.map((st) => ({
    url: `${BASE_URL}${buildMetroStationPath(st.slug)}`,
    changeFrequency: "weekly",
    priority: st.isInterchange ? 0.88 : 0.82,
  }));

  // Popular & Hub-to-Hub Metro Route Combinations (/delhi-metro/route/[from]-to-[to])
  const metroRouteUrlsSet = new Set<string>();
  const metroPairRoutes: MetadataRoute.Sitemap = [];

  for (const item of POPULAR_METRO_ROUTES) {
    const fullUrl = `${BASE_URL}${buildMetroRoutePath(item.fromSlug, item.toSlug)}`;
    if (!metroRouteUrlsSet.has(fullUrl)) {
      metroRouteUrlsSet.add(fullUrl);
      metroPairRoutes.push({
        url: fullUrl,
        changeFrequency: "weekly",
        priority: 0.93,
      });
    }
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
      if (fromSlug === toSlug) continue;
      const fullUrl = `${BASE_URL}${buildMetroRoutePath(fromSlug, toSlug)}`;
      if (!metroRouteUrlsSet.has(fullUrl)) {
        metroRouteUrlsSet.add(fullUrl);
        metroPairRoutes.push({
          url: fullUrl,
          changeFrequency: "weekly",
          priority: 0.87,
        });
      }
    }
  }

  const blogRoutes: MetadataRoute.Sitemap = ALL_BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedIso,
    changeFrequency: "weekly",
    priority: post.primaryKeyword ? 0.88 : post.domain === "air" ? 0.85 : 0.8,
  }));

  return [
    ...coreRoutes,
    ...trainStatusRoutes,
    ...chartTimeRoutes,
    ...metroLineRoutes,
    ...metroPairRoutes,
    ...metroStationRoutes,
    ...blogRoutes,
  ];
}
