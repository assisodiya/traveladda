import { NextResponse } from "next/server";
import { planMetroRoute } from "@/lib/metro-service";
import type { MetroRoutePreference } from "@/lib/metro-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim() || "";
  const to = searchParams.get("to")?.trim() || "";
  const prefParam = searchParams.get("preference")?.trim() || "fastest";

  const preference: MetroRoutePreference =
    prefParam === "min-interchange" || prefParam === "min-stops"
      ? prefParam
      : "fastest";

  if (!from || !to) {
    return NextResponse.json(
      {
        error:
          "Please provide both origin ('from') and destination ('to') metro stations.",
      },
      { status: 400 },
    );
  }

  const result = planMetroRoute(from, to, preference);
  if (!result) {
    return NextResponse.json(
      {
        error:
          "Could not calculate a Delhi NCR Metro route between the selected stations. Please select two distinct stations.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
