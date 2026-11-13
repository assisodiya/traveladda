import { NextResponse } from "next/server";
import { fetchFlightRoutePageData } from "@/lib/flight-booking-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = (searchParams.get("origin") || "DEL").trim();
    const destination = (searchParams.get("destination") || "BOM").trim();
    const date = (searchParams.get("date") || "").trim() || null;
    const currency = (searchParams.get("currency") || "inr").trim();

    const data = await fetchFlightRoutePageData(
      origin,
      destination,
      date,
      currency
    );

    return NextResponse.json(
      {
        success: true,
        provider: "TravelAdda Owned Flight Fare & Schedule Engine v1",
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch flight schedule and fares",
      },
      { status: 500 }
    );
  }
}

