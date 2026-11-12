import { NextResponse } from "next/server";
import {
  buildAllSitemapEntries,
  buildSegmentedSitemaps,
  INDEXNOW_KEY,
  SITE_BASE_URL,
  SITEMAP_SEGMENTS,
  type SitemapSegmentKey,
} from "@/lib/sitemap-builder";

const KEY_LOCATION = `${SITE_BASE_URL}/${INDEXNOW_KEY}.txt`;

export async function GET() {
  const segments = buildSegmentedSitemaps();
  const allEntries = buildAllSitemapEntries();

  return NextResponse.json({
    protocol: "IndexNow 2.0 (Bing, ChatGPT Search, Copilot, Yandex, Seznam)",
    host: "traveladda.in",
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    totalUrls: allEntries.length,
    sitemaps: {
      master: `${SITE_BASE_URL}/sitemap.xml`,
      index: `${SITE_BASE_URL}/sitemaps/index.xml`,
      segments: SITEMAP_SEGMENTS.map((seg) => ({
        category: seg.key,
        url: `${SITE_BASE_URL}/sitemaps/${seg.filename}`,
        count: segments[seg.key].length,
      })),
    },
    usage: {
      submitAll: "POST /api/seo/indexnow with body { category: 'all' }",
      submitCategory:
        "POST /api/seo/indexnow with body { category: 'core' | 'flights' | 'trains' | 'toll-routes' | 'delhi-metro' | 'blogs' }",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const category = String(body.category || "core").toLowerCase();

    const segments = buildSegmentedSitemaps();
    let urlsToSubmit: string[] = [];

    if (category === "all") {
      urlsToSubmit = buildAllSitemapEntries().map((e) => e.url);
    } else if (category in segments) {
      urlsToSubmit = segments[category as SitemapSegmentKey].map((e) => e.url);
    } else if (Array.isArray(body.urls)) {
      urlsToSubmit = body.urls.map(String);
    } else {
      urlsToSubmit = segments.core.map((e) => e.url);
    }

    // IndexNow accepts up to 10,000 URLs per POST request
    const urlBatch = urlsToSubmit.slice(0, 10000);

    const payload = {
      host: "traveladda.in",
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlBatch,
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      ok: response.ok,
      statusCode: response.status,
      submittedCategory: category,
      submittedUrlCount: urlBatch.length,
      keyLocation: KEY_LOCATION,
      message: response.ok
        ? `Successfully submitted ${urlBatch.length} URLs to IndexNow (Bing, ChatGPT Search & Partner Engines).`
        : `IndexNow endpoint responded with HTTP ${response.status}. Verify domain ownership at ${KEY_LOCATION} in production.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "IndexNow submission failed",
      },
      { status: 500 }
    );
  }
}

