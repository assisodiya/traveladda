import type { MetadataRoute } from "next";
import { RAIL_BLOG_POSTS } from "@/lib/blog-data";

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
      url: `${BASE_URL}/tools/air`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/hotel`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = RAIL_BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...coreRoutes, ...blogRoutes];
}

