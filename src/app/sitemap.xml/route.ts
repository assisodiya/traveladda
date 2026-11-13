import { NextResponse } from "next/server";
import { buildSitemapIndexXml, SITEMAP_SEGMENTS } from "@/lib/sitemap-builder";

export async function GET() {
  return new NextResponse(buildSitemapIndexXml(SITEMAP_SEGMENTS), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

