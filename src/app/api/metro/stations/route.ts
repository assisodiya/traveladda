import { NextResponse } from "next/server";
import {
  getAllMetroLines,
  getAllMetroStations,
  searchMetroStations,
} from "@/lib/metro-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const all = searchParams.get("all") === "1";

  const lines = getAllMetroLines();
  const stations = all
    ? getAllMetroStations()
    : searchMetroStations(query, query ? 25 : 20);

  return NextResponse.json(
    {
      stations,
      lines: lines.map((l) => ({
        id: l.id,
        badge: l.badge,
        shortCode: l.shortCode,
        slug: l.slug,
        color: l.color,
        textColor: l.textColor,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

