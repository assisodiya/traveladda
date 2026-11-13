import { NextResponse } from "next/server";
import {
  buildSegmentedSitemaps,
  SITE_BASE_URL,
  SITEMAP_LAST_MODIFIED,
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

  // 1. Sitemap Index (/sitemaps/index.xml)
  if (cleanName === "index") {
    const indexXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...SITEMAP_SEGMENTS.map(
        (seg) =>
          `  <sitemap>\n    <loc>${SITE_BASE_URL}/sitemaps/${seg.filename}</loc>\n    <lastmod>${SITEMAP_LAST_MODIFIED}</lastmod>\n  </sitemap>`
      ),
      "</sitemapindex>",
    ].join("\n");

    return new NextResponse(indexXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  }

  // 2. Individual Category Sitemaps (/sitemaps/core.xml, /sitemaps/trains.xml, etc.)
  const segments = buildSegmentedSitemaps();
  const validKeys: SitemapSegmentKey[] = [
    "core",
    "flights",
    "trains",
    "train-live-status",
    "train-chart-times",
    "toll-routes",
    "delhi-metro",
    "blogs",
  ];

  if (!validKeys.includes(cleanName as SitemapSegmentKey)) {
    return new NextResponse("Sitemap category not found", { status: 404 });
  }

  const entries = segments[cleanName as SitemapSegmentKey];
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => {
      const lastMod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified || SITEMAP_LAST_MODIFIED;
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

