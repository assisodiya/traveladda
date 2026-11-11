import type { MetadataRoute } from "next";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import {
  buildTrainLiveStatusPath,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";

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
        train.trainName
      )}`,
      changeFrequency: "daily",
      priority: 0.92,
    })
  );

  const blogRoutes: MetadataRoute.Sitemap = ALL_BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedIso,
    changeFrequency: "weekly",
    priority: post.primaryKeyword ? 0.88 : post.domain === "air" ? 0.85 : 0.8,
  }));

  return [...coreRoutes, ...trainStatusRoutes, ...blogRoutes];
}
