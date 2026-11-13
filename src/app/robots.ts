import type { MetadataRoute } from "next";

const PUBLIC_ALLOW_PATHS = [
  "/",
  "/flights",
  "/flights/",
  "/delhi-metro",
  "/delhi-metro/",
  "/toll-calculator",
  "/toll-calculator/",
  "/flight-status/",
  "/chart-times/",
  "/rail/",
  "/air/",
  "/blog",
  "/blog/",
  "/tools",
  "/tools/",
  "/sitemap-directory",
  "/sitemaps/",
  "/llms.txt",
  "/llms-full.txt",
  "/api/metro/route",
  "/api/metro/stations",
  "/api/flights/fares",
  "/api/flights/places",
  "/api/og",
  "/favicon.ico",
  "/favicon-48x48.png",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/assets/",
  "/airlines/",
  "/api/flights/icon/",
];

const PRIVATE_API_DISALLOW_PATHS = [
  "/api/pnr",
  "/api/trains",
  "/api/flights/airlines",
  "/api/flights/status",
];

/**
 * Explicit allow rules for traditional search engines AND Generative AI / LLM crawlers
 * (OpenAI ChatGPT Search, Google Gemini / AI Overviews, Anthropic Claude, Perplexity,
 * Microsoft Copilot, Apple Intelligence, Meta AI, Amazon Rufus, DuckAssist, Cohere, etc.)
 */
const AI_AND_SEARCH_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Googlebot",
  "Googlebot-Image",
  "Google-Favicon",
  "Google-Extended",
  "GoogleOther",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  "Amazonbot",
  "DuckAssistBot",
  "YouBot",
  "cohere-ai",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Google-Favicon", "Googlebot-Image"],
        allow: "/",
      },
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW_PATHS,
        disallow: PRIVATE_API_DISALLOW_PATHS,
      },
      {
        userAgent: AI_AND_SEARCH_AGENTS,
        allow: PUBLIC_ALLOW_PATHS,
        disallow: PRIVATE_API_DISALLOW_PATHS,
      },
    ],
    host: "https://traveladda.in",
    sitemap: [
      "https://traveladda.in/sitemap.xml",
      "https://traveladda.in/sitemaps/index.xml",
      "https://traveladda.in/sitemaps/core.xml",
      "https://traveladda.in/sitemaps/flights.xml",
      "https://traveladda.in/sitemaps/flight-routes.xml",
      "https://traveladda.in/sitemaps/train-live-status.xml",
      "https://traveladda.in/sitemaps/train-chart-times.xml",
      "https://traveladda.in/sitemaps/trains.xml",
      "https://traveladda.in/sitemaps/toll-routes.xml",
      "https://traveladda.in/sitemaps/delhi-metro.xml",
      "https://traveladda.in/sitemaps/blogs.xml",
      "https://traveladda.in/llms.txt",
      "https://traveladda.in/llms-full.txt",
    ],
  };
}
