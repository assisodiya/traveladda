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
  "/api/og",
  "/api/flights/icon/",
  "/favicon.ico",
  "/favicon-48x48.png",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/assets/",
  "/airlines/",
];

/**
 * Block internal JSON APIs and infinite query-parameter crawl traps
 * (calendar dates, PNR inputs, currency switches, passenger counts, UTM tags)
 * to preserve Google Crawl Budget for canonical SEO pages.
 */
const CRAWL_BUDGET_DISALLOW_PATHS = [
  "/api/pnr",
  "/api/trains",
  "/api/metro/",
  "/api/seo/",
  "/api/flights/airlines",
  "/api/flights/status",
  "/api/flights/fares",
  "/api/flights/places",
  "/*?date=*",
  "/*&date=*",
  "/*?pnr=*",
  "/*?currency=*",
  "/*&currency=*",
  "/*?pax=*",
  "/*?adults=*",
  "/*?cabin=*",
  "/*?sort=*",
  "/*?utm_*",
  "/*&utm_*",
];

/**
 * Explicit rules for traditional search engines AND Generative AI / LLM crawlers
 * (OpenAI ChatGPT Search, Google Gemini / AI Overviews, Anthropic Claude, Perplexity,
 * Microsoft Copilot, Apple Intelligence, Meta AI, Amazon Rufus, DuckAssist, Cohere, etc.)
 */
const AI_AND_SEARCH_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Googlebot",
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
        allow: [
          "/",
          "/api/og",
          "/api/flights/icon/",
          "/airlines/",
          "/assets/",
        ],
        disallow: ["/api/pnr", "/api/trains", "/api/metro/", "/api/seo/"],
      },
      {
        userAgent: "*",
        allow: PUBLIC_ALLOW_PATHS,
        disallow: CRAWL_BUDGET_DISALLOW_PATHS,
      },
      {
        userAgent: AI_AND_SEARCH_AGENTS,
        allow: PUBLIC_ALLOW_PATHS,
        disallow: CRAWL_BUDGET_DISALLOW_PATHS,
      },
    ],
    host: "https://traveladda.in",
    sitemap: "https://traveladda.in/sitemaps/index.xml",
  };
}
