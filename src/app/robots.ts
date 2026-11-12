import type { MetadataRoute } from "next";

const PUBLIC_ALLOW_PATHS = [
  "/",
  "/delhi-metro",
  "/delhi-metro/",
  "/flight-status/",
  "/chart-times/",
  "/rail/",
  "/air/",
  "/blog",
  "/blog/",
  "/tools",
  "/tools/",
  "/llms.txt",
  "/llms-full.txt",
  "/api/metro/route",
  "/api/metro/stations",
  "/favicon.ico",
  "/favicon-48x48.png",
  "/apple-touch-icon.png",
  "/icon1",
  "/icon1.png",
  "/icon2",
  "/icon2.png",
  "/apple-icon",
  "/apple-icon.png",
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
      "https://traveladda.in/llms.txt",
      "https://traveladda.in/llms-full.txt",
    ],
  };
}
