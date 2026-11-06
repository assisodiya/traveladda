import { connection, type NextRequest } from "next/server";
import { fetchOwnedFlightStatus } from "@/lib/flight-service";
import {
  getFlightTodayIstDateString,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";

export async function GET(request: NextRequest) {
  await connection();
  const airline =
    request.nextUrl.searchParams.get("airline") ??
    request.nextUrl.searchParams.get("airlineCode") ??
    request.nextUrl.searchParams.get("code") ??
    "";
  const flightNumber =
    request.nextUrl.searchParams.get("flightNumber") ??
    request.nextUrl.searchParams.get("flight") ??
    request.nextUrl.searchParams.get("number") ??
    "";
  const departureDate =
    request.nextUrl.searchParams.get("departureDate") ??
    request.nextUrl.searchParams.get("date");

  if (!airline && !flightNumber) {
    const today = getFlightTodayIstDateString();
    const overview = {
      success: true,
      provider: "TravelAdda Owned Flight API v1",
      service: "Live Global & Domestic Flight Status, Airline Search & Daily Local Icon Service",
      status: "operational",
      endpoints: {
        airlineSearch: "/api/flights/airlines?searchTerm={query}",
        flightStatusByQuery:
          "/api/flights/status?airline={code}&flightNumber={num}&departureDate=YYYY-MM-DD",
        flightStatusByPath:
          "/api/flights/{airline}/{flightNumber}?departureDate=YYYY-MM-DD",
        flightStatusByPost:
          'POST /api/flights/status with JSON { "airline": "6E", "flightNumber": "2045", "departureDate": "YYYY-MM-DD" }',
        airlineIconDailyLocal: "/api/flights/icon/{airlineCode}",
        airlineIconStaticPublic: "/airlines/{airlineCode}.png",
      },
      quickExamples: POPULAR_LIVE_FLIGHTS.slice(0, 6).map((f) => ({
        flight: `${f.airlineCode} ${f.flightNumber}`,
        airlineName: f.airlineName,
        route: f.routeCodes,
        statusEndpoint: `/api/flights/${f.airlineCode}/${f.flightNumber}?departureDate=${today}`,
        iconEndpoint: `/api/flights/icon/${f.airlineCode}`,
      })),
    };

    return new Response(JSON.stringify(overview, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
        "X-Powered-By": "TravelAdda-Flight-API-v1",
      },
    });
  }

  const { httpStatus, body } = await fetchOwnedFlightStatus(
    airline,
    flightNumber,
    departureDate
  );

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Flight-API-v1",
    },
  });
}

export async function POST(request: NextRequest) {
  await connection();
  let airline = "";
  let flightNumber = "";
  let departureDate: string | null = null;

  try {
    const payload = (await request.json()) as {
      airline?: unknown;
      airlineCode?: unknown;
      code?: unknown;
      flightNumber?: unknown;
      flight?: unknown;
      departureDate?: unknown;
      date?: unknown;
    };

    const rawAirline = payload?.airline ?? payload?.airlineCode ?? payload?.code;
    const rawFlight = payload?.flightNumber ?? payload?.flight;
    const rawDate = payload?.departureDate ?? payload?.date;

    airline =
      typeof rawAirline === "string" || typeof rawAirline === "number"
        ? String(rawAirline)
        : "";
    flightNumber =
      typeof rawFlight === "string" || typeof rawFlight === "number"
        ? String(rawFlight)
        : "";
    departureDate = typeof rawDate === "string" ? rawDate : null;
  } catch {
    airline = "";
    flightNumber = "";
  }

  const { httpStatus, body } = await fetchOwnedFlightStatus(
    airline,
    flightNumber,
    departureDate
  );

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Flight-API-v1",
    },
  });
}

