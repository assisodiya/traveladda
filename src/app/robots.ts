import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/favicon.ico",
          "/icon1",
          "/icon2",
          "/apple-icon",
          "/manifest.webmanifest",
          "/assets/",
          "/airlines/",
          "/api/flights/icon/",
        ],
        disallow: [
          "/api/pnr",
          "/api/trains",
          "/api/flights/airlines",
          "/api/flights/status",
        ],
      },
    ],
    sitemap: "https://traveladda.in/sitemap.xml",
  };
}
