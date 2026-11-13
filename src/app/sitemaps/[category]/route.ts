import { NextResponse } from "next/server";
import {
  buildSegmentedSitemaps,
  buildSitemapIndexXml,
  SITEMAP_SEGMENT_LAST_MODIFIED,
  SITEMAP_SEGMENTS,
  type SitemapSegmentKey,
} from "@/lib/sitemap-builder";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const cleanName = category.replace(/\.xml$/i, "").toLowerCase();

  // 1. Primary Sitemap Index (/sitemaps/index.xml) — emits independent per-segment <lastmod>
  if (cleanName === "index") {
    return new NextResponse(buildSitemapIndexXml(SITEMAP_SEGMENTS), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  // 2. Retired legacy bundle (/sitemaps/trains.xml) — serve clean train-only sitemap index (zero duplicate <url> dump)
  if (cleanName === "trains") {
    const trainSegments = SITEMAP_SEGMENTS.filter(
      (s) =>
        s.key === "train-live-status" ||
        s.key === "train-regional-status" ||
        s.key === "train-chart-times"
    );
    return new NextResponse(buildSitemapIndexXml(trainSegments), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  // 3. Individual mutually-exclusive Category Sitemaps
  const matchedSegment = SITEMAP_SEGMENTS.find((s) => s.key === cleanName);
  if (!matchedSegment) {
    return new NextResponse("Sitemap category not found", { status: 404 });
  }

  const segmentKey = matchedSegment.key as SitemapSegmentKey;
  const segments = buildSegmentedSitemaps();
  const entries = segments[segmentKey];
  const segmentFallbackLastMod = SITEMAP_SEGMENT_LAST_MODIFIED[segmentKey];

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => {
      const lastMod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified || segmentFallbackLastMod;
      const changeFreq = entry.changeFrequency || "weekly";
      const priority =
        typeof entry.priority === "number" ? entry.priority.toFixed(2) : "0.80";
      return `  <url>\n    <loc>${escapeXml(
        entry.url
      )}</loc>\n    <lastmod>${escapeXml(
        String(lastMod)
      )}</lastmod>\n    <changefreq>${changeFreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }),
    "</urlset>",
  ];

  return new NextResponse(xmlLines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
